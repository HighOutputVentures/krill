import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Ajv from 'ajv';

export const utilities = {
  /* Dynamic require utility */
  require(dir, namespace) {
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
  },

  /* Ajv schema validation utility */
  validate(schema, json) {
    const ajv = new Ajv();
    const valid = ajv.validate(
      require(path.join(process.cwd(), 'schema', schema)).default, json,
    );
    if (!valid) throw new Error('invalid_resource').stack = ajv.errors;
  },
};
