/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Module */
import _ from 'lodash';
import Promise from 'bluebird';
import router from './router';

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

    const routed = router(this.routes, this.resources, this.policies);

    /* start adapters */
    await Promise.all(_.map(this.config.adapters, async (adapter) => {
      Module[adapter] = require(`./adapters/${adapter}`).default;

      if (adapter === 'koa') {
        Module[adapter].middlewares = this.config.middlewares.http;
        Module[adapter].routes = routed.filter((route) => {
          const service = (route.service) ? _.includes(this.config.services, route.service) : true;

          return (route.type === 'http') && service;
        });
      } else if (adapter === 'rabbitmq') {
        Module[adapter].middlewares = this.config.middlewares.amqp;
        Module[adapter].routes = routed.filter(route => route.type === 'amqp');
      }

      await Module[adapter].start();
    }));

    console.log('server started...');
  }

  async stop() {
    await Promise.all(_.map(this.adapters, async (adapter) => {
      await Module[adapter].stop();
    }));
  }
}
