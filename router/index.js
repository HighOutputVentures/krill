const _ = require('lodash');
const each = require('lodash/each');
const get = require('lodash/get');
const Ajv = require('ajv');
const loadSchema = require('../utilities').loadSchema;

/*
 * TODO: routing mechanism components 
 * 1. route stack, which contains all the stacked polices and resource
 * 2. route resolver, which maps the stack with the http api 
 * 3. router, loads mapped routes according to route type
 */


class RouteStack {
  constructor(options) {
    this.stack = [];

    this.api = options.api;
    this.type = options.type;
    this.policies = options.policies;
    this.resources = options.resources;
  }

  stackPolicies(policyConfig = []) {
    each(policyConfig, policyName => {
      if(!this.policies[policyName]) {
        throw new Error('Policy not found');
      }

      stack.push(this.policies[policyName]);
    });
  }

  stackResource(resource) {
    const resourceObject = get(this.resources, resource);

    if (!resourceObject) {
      throw new Error(`${resource} resource not found`);
    }

    this.stack.push(resourceObject);
  }
}

module.exports = function (routes, resources, policies) {
  const ajv = new Ajv();
  loadSchema(ajv, 'schema');

  return _.reduce(routes, (reduced, {type, service, api, resource, policy = [], schema}) => {
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
