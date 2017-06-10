/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Module, Util */
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import utilities from './lib/utilities';

global.Util = utilities;
global.Adapter = {};
global.Module = {};

export default {
  async start() {
    /* require router after global __dirname is set */
    const router = require('./lib/router').default;

    /* load policies and resources to the global object */
    Util.require('policies', 'Policies');
    Util.require('resources', 'Resources');

    /* require all the config files */
    this.adapters = require(path.join(process.cwd(), 'config/adapters')).default;
    const routes = require(path.join(process.cwd(), 'config/routes')).default;
    const middlewares = require(path.join(process.cwd(), 'config/middlewares')).default;
    const bootloaders = require(path.join(process.cwd(), 'config/bootloaders')).default;

    /* load bootloaders */
    await Promise.all(_.map(bootloaders, async bootloader => bootloader()));

    const routed = router(routes, global.Resources, global.Policies);

    /* start adapters */
    await Promise.all(_.map(this.adapters, async (adapter) => {
      Module[adapter] = require(`./adapters/${adapter}`).default;

      if (adapter === 'koa') {
        Module[adapter].middlewares = middlewares.http;
        Module[adapter].routes = routed.filter(route => route.type === 'http');
      } else if (adapter === 'rabbitmq') {
        Module[adapter].middlewares = middlewares.amqp;
        Module[adapter].routes = routed.filter(route => route.type === 'amqp');
      }

      await Module[adapter].start();
    }));
  },

  async stop() {
    await Promise.all(_.map(this.adapters, async (adapter) => {
      await Module[adapter].stop();
    }));
  },
};
