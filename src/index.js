/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Module, Util */
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import utilities from './lib/utilities';

global.Util = utilities;
global.Adapter = {};
global.Module = {};

/* export adapter classes */
export { AMQP } from './adapters/rabbitmq';
export { Mailer } from './adapters/sendgrid';

export default {
  async start() {
    this.config = {};

    /* require router after global __dirname is set */
    const router = require('./lib/router').default;

    /* load policies and resources to the global object */
    Util.require('policies', 'Policies');
    Util.require('resources', 'Resources');

    /* require all the config files */
    _.each(['adapters', 'routes', 'middlewares', 'bootloaders'], (config) => {
      this.config[config] = require(path.join(process.cwd(), `config/${config}`)).default;
    });

    /* load bootloaders */
    await Promise.all(_.map(this.config.bootloaders, async bootloader => bootloader()));

    const routed = router(this.config.routes, global.Resources, global.Policies);

    /* start adapters */
    await Promise.all(_.map(this.config.adapters, async (adapter) => {
      Module[adapter] = require(`./adapters/${adapter}`).default;

      if (adapter === 'koa') {
        Module[adapter].middlewares = this.config.middlewares.http;
        Module[adapter].routes = routed.filter(route => route.type === 'http');
      } else if (adapter === 'rabbitmq') {
        Module[adapter].middlewares = this.config.middlewares.amqp;
        Module[adapter].routes = routed.filter(route => route.type === 'amqp');
      }

      await Module[adapter].start();
    }));

    console.log('server started...');
  },

  async stop() {
    await Promise.all(_.map(this.adapters, async (adapter) => {
      await Module[adapter].stop();
    }));
  },
};
