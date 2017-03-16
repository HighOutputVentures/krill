/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Util, Adapter, Module */
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import Ajv from 'ajv';

const bootloaders = require(path.resolve(process.cwd(), 'config/bootloaders')).default;
const adapters = require(path.resolve(process.cwd(), 'config/adapters')).default;
const service = {};

global.Util = {};
global.Adapter = {};
global.Module = {};

Util.require = (dir, namespace) => {
  const files = fs.existsSync(path.resolve(process.cwd(), dir)) ?
    fs.readdirSync(path.resolve(process.cwd(), dir)) : [];
  _.each(files, (file) => {
    const module = require(path.resolve(process.cwd(), dir, file));
    if (namespace) {
      global[namespace] = _.merge(global[namespace] || {}, module);
    } else {
      _.merge(global, module);
    }
  });
};

Util.validate = (schema, json) => {
  const ajv = new Ajv();
  const valid = ajv.validate(
    require(path.resolve(process.cwd(), 'schema', schema)).default, json,
  );
  if (!valid) throw new Error('invalid_resource').stack = ajv.errors;
};

service.start = async () => {
  /* load bootloaders */
  _.each(bootloaders, bootloader => bootloader());

  /* start adapters */
  await Promise.all(_.map(adapters, async (adapter) => {
    Module[adapter] = require(`./adapters/${adapter}`).default;
    await Module[adapter].start();
  }));
};

service.stop = async () => {
  await Promise.all(_.map(adapters, async (adapter) => {
    await Module[adapter].stop();
  }));
};

export default service;
