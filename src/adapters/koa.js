/* eslint  import/no-dynamic-require: off */
import _ from 'lodash';
import Koa from 'koa';
import Router from 'koa-router';
import compose from 'koa-compose';
import parser from 'koa-bodyparser';
import logger from 'koa-logger';

const { KOA_PORT = '8080', KOA_HOST = '127.0.0.1' } = process.env;
const app = new Koa();
const router = new Router();

export default {
  async start() {
    this.server = null;

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

    try { this.server = app.listen(KOA_PORT, KOA_HOST); } catch (err) { throw err; }
  },

  async stop() {
    await new Promise((resolve) => { this.server.close(resolve); });
  },
};
