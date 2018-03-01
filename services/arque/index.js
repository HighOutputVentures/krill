const map = require('lodash/map');
const debug = require('debug')('rabbitmq');
const Arque = require('arque').default;
const compose = require('./compose');

module.exports = class {
  constructor(opts) {
    const {
      host = 'localhost',
      vhost = '',
      port = '5672',
      username = 'guest',
      password = 'guest'
    } = opts || {};

    this.app = new Arque(`amqp://${username}:${password}@${host}:${port}/${vhost}`);
    this.middlewares = [];
    this.routes = [];
    this.workers = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async route(name, stack) {
    const composition = (Array.isArray(stack)) ?
      compose(this.middlewares.slice(0).concat(stack)) :
      compose(this.middlewares.slice(0).concat([stack]));

    const worker = await this.app.createWorker(
      {job: name, concurrency: 500},
      async ({body = {}}) => {
        try {
          const ctx = {request: {}, response: {}};
          ctx.route = name;
          ctx.request.body = body;
          await composition(ctx);

          return {body: ctx.response.body, code: 'success'};
        } catch (err) {
          debug(`route: ${name}, request: ${JSON.stringify(body, null, 2)}, error: ${err.message}`);
          return {code: 'invalid_request', body: err.message};
        }
      },
    );

    this.workers.push(worker);
  }

  async start() {
    await Promise.all(map(this.routes, async ({api, stack}) => {
      await this.route(api, stack);
    }));
  }

  async stop() {
    await Promise.all(map(this.workers, async worker => {
      await worker.close();
    }));
    this.app.close();
  }
};
