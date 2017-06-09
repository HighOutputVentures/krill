/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Module */
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import router from './lib/router';
import utilities from './lib/utilities';

global.Util = utilities;
global.Adapter = {};
global.Module = {};

export default {
  async start() {
    /* load policies and resources to the global object */
    Util.require('policies', 'Policies');
    Util.require('resources', 'Resources');

    /* require all the config files */
    const routes = require(path.join(process.cwd(), 'config/routes')).default;
    const middlewares = require(path.join(process.cwd(), 'config/middlewares')).default;
    const bootloaders = require(path.join(process.cwd(), 'config/bootloaders')).default;
    const adapters = require(path.join(process.cwd(), 'config/adapters')).default;

    /* load bootloaders */
    await Promise.all(_.map(bootloaders, async (bootloader) => bootloader()));

    const routed = router(routes, global.Resources, global.Policies);

    /* start adapters */
    await Promise.all(_.map(adapters, async (adapter) => {
      Module[adapter] = require(`./adapters/${adapter}`).default;

      if (adapter === 'koa') {
        Module[adapter].middlewares = middlewares;
        Module[adapter].routes = routed.filter((route) => { return route.type === 'http' });
      } else if (adapter == 'rabbitmq') {
        Module[adapter].middlewares = middlewares;
        Module[adapter].routes = routed.filter((route) => { return route.type === 'amqp' });
      }

      await Module[adapter].start();
    }));
  },

  async stop() {
    const adapters = require(path.join(process.cwd(), 'config/adapters')).default;

    await Promise.all(_.map(adapters, async (adapter) => {
      await Module[adapter].stop();
    }));
  },
};
