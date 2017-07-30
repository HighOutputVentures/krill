import Promise from 'bluebird';
import _ from 'lodash';
import debug from 'debug';
import Arque from 'arque';
import compose from './compose';

const logger = debug('rabbitmq');
export default class {
  constructor(opts) {
    const {
      host = 'localhost',
      vhost = '',
      port = '5672',
      username = 'guest',
      password = 'guest',
    } = opts || {};

    this.arque = new Arque(`amqp://${username}:${password}@${host}:${port}/${vhost}`);
    this.middlewares = [];
    this.clients = {};
    this.routes = [];
    this.workers = [];
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
      await this.route(api, stack);
    }));
  }

  async stop() {
    await Promise.all(_.map(this.workers, async (worker) => { await worker.close(); }));
    this.arque.close();
  }
}
