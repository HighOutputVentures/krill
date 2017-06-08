/* globals Routes, Adapter, Resources */
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

export async function rpc(route, request, timeout = 6000) {
  const arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);
  const client = await arque.createClient({ job: route, timeout });
  const response = await client({ body: request });

  if (response.code === 'invalid_request') {
    logger(`route: ${route}, request: ${JSON.stringify(request, null, 2)}, error: ${response.body}`);
    const error = new Error(response.body);
    error.name = 'RabbitMQAdapterError';
    throw error;
  }

  return response;
}

export class AMQP {

  constructor() {
    this.arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);
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
      compose([...this.middlewares, resource]) : compose(this.middlewares.concat(resource));
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
    try {
      const routes = Routes.filter(route => route.type === 'amqp');

      await Promise.all(_.map(routes, async (route) => {
        const resource = _.get(Resources, route.resource);

        if (!resource) {
          logger(`Resource: ${route.resource} not found`);
          const error = new Error(`Resource: ${route.resource} not found`);
          error.name = 'RabbitMQAdapterError';
          throw error;
        }

        await Adapter.RabbitMQ.route(route.api, resource);
      }));
    } catch (err) { throw err; }
  },

  async stop() {
    Adapter.RabbitMQ.close();
  },
};
