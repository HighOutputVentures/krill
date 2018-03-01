const fs = require('fs');
const path = require('path');
const merge = require('lodash/merge');
const each = require('lodash/each');

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
