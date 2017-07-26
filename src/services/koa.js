import _ from 'lodash';
import Koa from 'koa';
import Router from 'koa-router';
import compose from 'koa-compose';
import parser from 'koa-bodyparser';
import logger from 'koa-logger';

const { KOA_PORT = '8080', KOA_HOST = '127.0.0.1' } = process.env;
const app = new Koa();
const router = new Router();

export default class {
  constructor() {
    this.server = null;
    this.middlewares = [];
    this.routes = [];
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

    this.server = app.listen(KOA_PORT, KOA_HOST);
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
