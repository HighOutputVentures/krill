const fs = require('fs');
const path = require('path');
const merge = require('lodash/merge');
const each = require('lodash/each');
const Ajv = require('ajv');

module.exports = {};

module.exports.load = function (dir) {
  const object = {};
  const files = fs.existsSync(path.join(process.cwd(), dir)) ?
    fs.readdirSync(path.join(process.cwd(), dir)) : [];

  each(files, file => {
    const resource = {};
    resource[path.basename(file, '.js')] = require(path.join(process.cwd(), dir, file));
    return merge(object, resource);
  });

  return object;
};

module.exports.validate = function (schema, json) {
  const ajv = new Ajv();
  const valid = ajv.validate(
    require(path.join(process.cwd(), 'schema', schema)), json,
  );

  if (!valid) {
    throw new Error(ajv.errorsText());
  }
};

module.exports.loadSchema = function (ajv, dir) {
  const schemas = fs.existsSync(path.join(process.cwd(), dir)) ?
    fs.readdirSync(path.join(process.cwd(), dir)) : [];

  each(schemas, schema => {
    ajv.addSchema(require(path.join(process.cwd(), dir, schema)), path.basename(schema, '.js'));
  });
};
