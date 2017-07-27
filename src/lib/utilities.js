import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Ajv from 'ajv';

export function load(dir) {
  const object = {};

  const files = fs.existsSync(path.join(process.cwd(), dir)) ?
    fs.readdirSync(path.join(process.cwd(), dir)) : [];

  _.each(files, file => _.merge(
    object,
    require(path.join(process.cwd(), dir, file)),
  ));

  return object;
}

export function validate(schema, json) {
  const ajv = new Ajv();
  const valid = ajv.validate(
    require(path.join(process.cwd(), 'schema', schema)).default, json,
  );

  if (!valid) {
    throw new Error(ajv.errorsText());
  }
}

export function loadSchema(ajv, dir) {
  const schemas = fs.existsSync(path.join(process.cwd(), dir)) ?
    fs.readdirSync(path.join(process.cwd(), dir)) : [];
  _.each(schemas, (schema) => {
    ajv.addSchema(require(path.join(process.cwd(), dir, schema)).default, path.basename(schema, '.js'));
  });
}
