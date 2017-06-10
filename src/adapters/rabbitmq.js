/* globals Adapter */
import Promise from 'bluebird';
import _ from 'lodash';
import debug from 'debug';
import Arque from 'arque';
import compose from '../lib/compose';

const logger = debug('rabbitmq');
const {
  RABBIT_HOST = 'localhost',
  RABBIT_VHOST = '',
  RABBIT_USER = 'guest',
  RABBIT_PASSWORD = 'guest',
} = process.env;

export class AMQP {
  constructor() {
    this.arque = null;
    this.middlewares = [];
    this.ctx = { request: {}, response: {} };
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Creates a listener for rabbit based requests
   * @param {string} route
   * @param {function} resource
   */
  async route(name, resource) {
    const stack = (Array.isArray(resource)) ?
      compose(this.middlewares.slice().concat([resource])) :
      compose(this.middlewares.concat(resource));

    const ctx = Object.create(this.ctx);

    await this.arque.createWorker({ job: name }, async ({ body }) => {
      try {
        ctx.route = name;
        ctx.request.body = body;
        await stack(ctx);

        return { body: ctx.response.body, code: 'success' };
      } catch (err) {
        logger(`route: ${name}, request: ${JSON.stringify(body, null, 2)}, error: ${err.message}`);
        return { code: 'invalid_request', body: err.message };
      }
    });
  }

  close() {
    this.arque.close();
  }
}

export default {
  async start() {
    const arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);

    this.amqp = new AMQP();
    this.amqp.arque = arque;
    this.amqp.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      logger(`route: ${ctx.route}, benchmark: ${start - Date.now()}`);
    });

    try {
      await Promise.all(_.map(this.routes, async ({ api, stack }) => {
        await this.amqp.route(api, stack);
      }));
    } catch (err) { throw err; }

    /* set amqp client */
    Adapter.RabbitMQ = async (route, request, timeout = 6000) => {
      const client = await arque.createClient({ job: route, timeout });
      const response = await client({ body: request });

      if (response.code === 'invalid_request') {
        logger(`route: ${route}, request: ${JSON.stringify(request, null, 2)}, error: ${response.body}`);
        const error = new Error(response.body);
        error.name = 'RabbitMQAdapterError';
        throw error;
      }

      return response;
    };
  },

  async stop() {
    this.amqp.close();
  },
};
