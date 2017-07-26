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
    this.workers = [];
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
      compose(this.middlewares.slice(0).concat(resource)) :
      compose(this.middlewares.slice(0).concat([resource]));

    const worker = await this.arque.createWorker(
      { job: name, concurrency: 500 },
      async ({ body }) => {
        try {
          const ctx = { request: {}, response: {} };
          ctx.route = name;
          ctx.request.body = body;
          await stack(ctx);

          return { body: ctx.response.body, code: 'success' };
        } catch (err) {
          logger(`route: ${name}, request: ${JSON.stringify(body, null, 2)}, error: ${err.message}`);
          return { code: 'invalid_request', body: err.message };
        }
      },
    );

    this.workers.push(worker);
  }

  async close() {
    await Promise.all(_.map(this.workers, async (worker) => { await worker.close(); }));
    this.arque.close();
  }
}

export default class RabbitMQ {
  constructor() {
    this.arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);
    this.amqp = new AMQP();
    this.amqp.arque = this.arque;
    this.amqp.middlewares = this.middlewares;
    this.clients = {};
  }

  async start() {
    try {
      await Promise.all(_.map(this.routes, async ({ api, stack }) => {
        await this.amqp.route(api, stack);
      }));
    } catch (err) { throw err; }

    /* set amqp client */
    Adapter.RabbitMQ = async (route, request, timeout = 6000) => {
      if (!this.clients[route]) {
        this.clients[route] = await this.arque.createClient({ job: route, timeout });
      }

      const response = await this.clients[route]({ body: request });

      if (response.code === 'invalid_request') {
        logger(`route: ${route}, request: ${JSON.stringify(request, null, 2)}, error: ${response.body}`);
        const error = new Error(response.body);
        error.name = 'RabbitMQAdapterError';
        throw error;
      }

      return response;
    };
  }

  async stop() {
    await Promise.all(_.map(_.keys(this.clients), async (route) => {
      await this.clients[route].close();
    }));
    this.amqp.close();
  }
}

