const each = require('lodash/each');
const get = require('lodash/get');
const reduce = require('lodash/reduce');

module.exports = function (routes, resources, policies) {
  return reduce(routes, (reduced, {api, resource, policy = []}) => {
    const stack = [];
    const resourceObject = get(resources, resource);

    if (!resourceObject) {
      throw new Error(`${resource} resource not found`);
    }

    /* Stack policies */
    each(policy, name => {
      if (!policies[name]) {
        throw new Error('Policy not found');
      }
      stack.push(policies[name]);
    });

    /* Stack resource object */
    stack.push(resourceObject);
    reduced.push({api, stack});

    return reduced;
  }, []);
};
