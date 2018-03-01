const each = require('lodash/each');
const Koa = require('koa');
const Router = require('koa-router');
const compose = require('koa-compose');
const parser = require('koa-bodyparser');
const logger = require('koa-logger');

module.exports = class {
  constructor(opts) {
    const {host = '127.0.0.1', port = '8080'} = opts || {};

    this.app = new Koa();
    this.router = new Router();
    this.server = null;
    this.bootloaders = [];
    this.middlewares = [];
    this.routes = [];
    this.resources = {};
    this.policies = {};
    this.host = host;
    this.port = port;
  }

  async start() {
    /* Load koa modules */
    this.app.use(logger());
    this.app.use(parser({extendTypes: {json: ['application/vnd.api+json']}}));

    /* Load middlewares */
    each(this.middlewares, middleware => this.app.use(middleware));

    /* Load http routes */
    each(this.routes, route => {
      const [method, url] = route.api.split(' ');
      this.router[method](url, compose(route.stack));
    });

    /* Load routes into koa */
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());

    this.server = this.app.listen(this.port, this.host);
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
