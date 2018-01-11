const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const compose = require('koa-compose');
const parser = require('koa-bodyparser');
const logger = require('koa-logger');

const app = new Koa();
const router = new Router();

module.exports = class {
  constructor(opts) {
    const {host = '127.0.0.1', port = '8080'} = opts || {};

    this.server = null;
    this.middlewares = [];
    this.routes = [];
    this.host = host;
    this.port = port;
  }

  async start() {
    /* Load koa modules */
    app.use(logger());
    app.use(parser({extendTypes: {json: ['application/vnd.api+json']}}));

    /* Load middlewares */
    _.each(this.middlewares, middleware => app.use(middleware));

    /* Load http routes */
    _.each(this.routes, route => {
      const [method, url] = route.api.split(' ');
      router[method](url, compose(route.stack));
    });

    /* Load routes into koa */
    app.use(router.routes());
    app.use(router.allowedMethods());

    this.server = app.listen(this.port, this.host);
  }

  async stop() {
    await new Promise(resolve => {
      if (this.server) {
        this.server.close(resolve);
      }
      resolve();
    });
  }
};
