const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Ajv = require('ajv');

module.exports = {};

module.exports.load = function (dir) {
  const object = {};
  const files = fs.existsSync(path.join(process.cwd(), dir)) ?
    fs.readdirSync(path.join(process.cwd(), dir)) : [];

  _.each(files, file => _.merge(
    object,
    require(path.join(process.cwd(), dir, file)),
  ));

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

  _.each(schemas, schema => {
    ajv.addSchema(require(path.join(process.cwd(), dir, schema)), path.basename(schema, '.js'));
  });
};
