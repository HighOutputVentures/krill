import _ from 'lodash';
import Koa from 'koa';
import Router from 'koa-router';
import compose from 'koa-compose';
import parser from 'koa-bodyparser';
import logger from 'koa-logger';

const app = new Koa();
const router = new Router();

export default class {
  constructor(opts) {
    const { host = '127.0.0.1', port = '8080' } = opts || {};

    this.server = null;
    this.middlewares = [];
    this.routes = [];
    this.host = host;
    this.port = port;
  }

  async start() {
    /* load koa modules */
    app.use(logger());
    app.use(parser({ extendTypes: { json: ['application/vnd.api+json'] } }));

    /* load middlewares */
    _.each(this.middlewares, middleware => app.use(middleware));

    /* load http routes */
    _.each(this.routes, (route) => {
      const [method, url] = route.api.split(' ');
      router[method](url, compose(route.stack));
    });

    /* load routes into koa */
    app.use(router.routes());
    app.use(router.allowedMethods());

    this.server = app.listen(this.port, this.host);
  }

  async stop() {
    await new Promise((resolve) => {
      if (this.server) {
        this.server.close(resolve);
      }
      resolve();
    });
  }
}
