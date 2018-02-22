const _ = require('lodash');
const Promise = require('bluebird');
const router = require('./router');
const Koa = require('./services/koa');
const RabbitMQ = require('./services/rabbitmq');

module.exports = class {
  constructor(opts) {
    const {
      routes,
      middlewares,
      bootloaders,
      resources,
      policies
    } = opts;

    this.routes = routes || [];
    this.bootloaders = bootloaders || [];
    this.middlewares = middlewares || {};
    this.resources = resources || {};
    this.policies = policies || {};

    this.koa = null;
    this.rabbitmq = null;
  }

  async start(opts) {
    const {koa = {}, rabbitmq = {}} = opts || {};

    /* Load bootloaders */
    await Promise.all(_.map(this.bootloaders, async bootloader => bootloader()));

    /* Setup routes */
    const routed = router(this.routes, this.resources, this.policies);

    if (routed.filter(route => route.type === 'http').length !== 0) {
      this.koa = new Koa({
        host: koa.host,
        port: koa.port
      });
      this.koa.middlewares = this.middlewares.http || [];
      this.koa.routes = routed.filter(route => route.type === 'http');
      this.koa.start();
    }

    if (routed.filter(route => route.type === 'amqp').length !== 0) {
      this.rabbitmq = new RabbitMQ({
        host: rabbitmq.host,
        vhost: rabbitmq.vhost,
        port: rabbitmq.port,
        username: rabbitmq.username,
        password: rabbitmq.password
      });
      this.rabbitmq.middlewares = this.middlewares.amqp || [];
      this.rabbitmq.routes = routed.filter(route => route.type === 'amqp');
      this.rabbitmq.start();
    }
  }

  async stop() {
    if (this.koa) {
      this.koa.stop();
    }
    if (this.rabbitmq) {
      this.rabbitmq.stop();
    }
  }
};