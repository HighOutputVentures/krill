/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Module */
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
    } = opts;

    this.routes = routes || [];
    this.middlewares = middlewares || [];
    this.bootloaders = bootloaders || [];
    this.resources = resources || {};
    this.policies = policies || {};
  }

  async start() {
    /* load bootloaders */
    await Promise.all(_.map(this.bootloaders, async bootloader => bootloader()));

    /* setup routes */
    const routed = router(this.routes, this.resources, this.policies);

    if (routed.filter(route => route.type === 'http')) {
      const koa = new Koa();
      koa.middlewares = this.middlewares.http;
      koa.routes = routed.filter((route) => {
        const service = (route.service) ?
          _.includes(this.config.services, route.service) : true;
        return (route.type === 'http') && service;
      });
    }

    if (routed.filter(route => route.type === 'amqp')) {
      const rabbitmq = new RabbitMQ();
      rabbitmq.middlewares = this.middlewares.amqp;
      rabbitmq.routes = routed.filter(route => route.type === 'amqp');
    }

    console.log('server started...');
  }

  async stop() {
    await Promise.all(_.map(this.adapters, async (adapter) => {
      await Module[adapter].stop();
    }));
  }
}
