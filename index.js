const map = require('lodash/map');
const Promise = require('bluebird');
const router = require('./router');
const Koa = require('./services/koa');
const Arque = require('./services/arque');

module.exports = class {
  constructor(opts) {
    const {
      service,
      routes,
      middlewares,
      bootloaders,
      resources,
      policies,
      env
    } = opts;

    this._koa = null;
    this._arque = null;

    this.service = service;
    this.routes = routes || [];
    this.bootloaders = bootloaders || [];
    this.middlewares = middlewares || {};
    this.resources = resources || {};
    this.policies = policies || {};

    if (this.service === 'koa') {
      this._koa = new Koa({
        host: env.host || '127.0.0.1',
        port: env.port || '8080'
      });

      this._koa.middlewares = this.middlewares || [];
      this._koa.routes = router(this.routes, this.resources, this.policies);

      this.koa = this._koa.app;
    } else if (this.service === 'arque') {
      this._arque = new Arque({
        host: env.host || '127.0.0.1',
        vhost: env.vhost || '/',
        port: env.port || '5672',
        username: env.username || 'guest',
        password: env.password || 'guest'
      });
      this._arque.middlewares = this.middlewares || [];
      this._arque.routes = router(this.routes, this.resources, this.policies);

      this.arque = this._arque.app;
    } else {
      throw new Error(`Service ${this.service} not supported`);
    }
  }

  async start() {
    /* Load bootloaders */
    await Promise.all(map(this.bootloaders, async bootloader => bootloader()));

    if (this.service === 'koa') {
      await this._koa.start();
    } else if (this.service === 'arque') {
      await this._arque.start();
    } else {
      throw new Error(`Service ${this.service} not supported`);
    }
  }

  async stop() {
    if (this.koa) {
      await this._koa.stop();
    }
    if (this.Arque) {
      await this._arque.stop();
    }
  }
};
