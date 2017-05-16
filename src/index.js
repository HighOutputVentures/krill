/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Module */
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import utilities from './utilities';

const service = {};

global.Util = utilities;
global.Adapter = {};
global.Module = {};

service.start = async () => {
  const bootloaders = require(path.join(process.cwd(), 'config/bootloaders')).default;
  const adapters = require(path.join(process.cwd(), 'config/adapters')).default;

  /* load bootloaders */
  _.each(bootloaders, bootloader => bootloader());

  /* start adapters */
  await Promise.all(_.map(adapters, async (adapter) => {
    Module[adapter] = require(`./adapters/${adapter}`).default;
    await Module[adapter].start();
  }));
};

service.stop = async () => {
  const adapters = require(path.join(process.cwd(), 'config/adapters')).default;

  await Promise.all(_.map(adapters, async (adapter) => {
    await Module[adapter].stop();
  }));
};

export default service;
