const _ = require('lodash');
const each = require('lodash/each');
const get = require('lodash/get');

module.exports = function (routes, resources, policies) {
  return _.reduce(routes, (reduced, {type, service, api, resource, policy = []}) => {
    const stack = [];
    const resourceObject = _.get(resources, resource);

    if (!resourceObject) {
      const error = new Error(`${resource} resource not found`);
      error.name = 'RouterError';
      throw error;
    }

    /* Stack policies */
    _.each(policy, name => {
      if (!policies[name]) {
        throw new Error('Policy not found');
      }
      stack.push(policies[name]);
    });

    /* Stack resource object */
    stack.push(resourceObject);
    reduced.push({type, service, api, stack});

    return reduced;
  }, []);
};
