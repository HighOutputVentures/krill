/* eslint global-require: off, import/no-dynamic-require: off */
/* globals Util, Adapter, Module */
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import Ajv from 'ajv';

const service = {};

global.Util = {};
global.Adapter = {};
global.Module = {};

Util.require = (dir, namespace) => {
  const files = fs.existsSync(path.join(process.cwd(), dir)) ?
    fs.readdirSync(path.join(process.cwd(), dir)) : [];
  _.each(files, (file) => {
    const module = require(path.join(process.cwd(), dir, file));
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
    require(path.join(process.cwd(), 'schema', schema)).default, json,
  );
  if (!valid) throw new Error('invalid_resource').stack = ajv.errors;
};

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
