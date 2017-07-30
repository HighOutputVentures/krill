import Promise from 'bluebird';
import _ from 'lodash';
import debug from 'debug';
import Arque from 'arque';
import compose from './compose';

const logger = debug('rabbitmq');
const {
  RABBIT_HOST = 'localhost',
  RABBIT_VHOST = '',
  RABBIT_USER = 'guest',
  RABBIT_PASSWORD = 'guest',
} = process.env;

export default class {
  constructor() {
    this.arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);
    this.middlewares = [];
    this.clients = {};
    this.routes = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

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

  async start() {
    await Promise.all(_.map(this.routes, async ({ api, stack }) => {
      await this.amqp.route(api, stack);
    }));
  }

  async stop() {
    await Promise.all(_.map(this.workers, async (worker) => { await worker.close(); }));
    this.arque.close();
  }
}
