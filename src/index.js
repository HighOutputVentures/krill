import _ from 'lodash';
import Promise from 'bluebird';
import router from './router';
import Koa from './services/koa';
import RabbitMQ from './services/rabbitmq';

export default class {
  constructor(opts) {
    const {
      routes,
      middlewares,
      bootloaders,
      resources,
      policies,
      services,
    } = opts;

    this.routes = routes || [];
    this.bootloaders = bootloaders || [];
    this.services = services || [];
    this.middlewares = middlewares || {};
    this.resources = resources || {};
    this.policies = policies || {};

    this.koa = null;
    this.rabbitmq = null;
  }

  async start() {
    /* load bootloaders */
    await Promise.all(_.map(this.bootloaders, async bootloader => bootloader()));

    /* setup routes */
    const routed = router(this.routes, this.resources, this.policies);

    if (routed.filter(route => route.type === 'http').length !== 0) {
      this.koa = new Koa();
      this.koa.middlewares = this.middlewares.http || [];
      this.koa.routes = routed.filter((route) => {
        const service = (route.service) ?
          _.includes(this.services, route.service) : true;
        return (route.type === 'http') && service;
      });
      this.koa.start();
    }

    if (routed.filter(route => route.type === 'amqp').length !== 0) {
      this.rabbitmq = new RabbitMQ();
      this.rabbitmq.middlewares = this.middlewares.amqp || [];
      this.rabbitmq.routes = routed.filter(route => route.type === 'amqp');
      this.rabbitmq.start();
    }
  }

  async stop() {
    if (!this.koa) this.koa.stop();
    if (!this.rabbitmq) this.rabbitmq.stop();
  }
}
