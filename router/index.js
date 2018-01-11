const _ = require('lodash');
const Ajv = require('ajv');
const loadSchema = require('../utilities').loadSchema;

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

    /* Stack schema validator */
    if (schema) {
      stack.push(async (ctx, next) => {
        const {body, headers} = schema;

        let valid;

        if (!body && !headers) {
          await next();
          return;
        }

        if (body) {
          valid = ajv.validate(body, ctx.request.body);
        }

        if (headers) {
          valid = ajv.validate(headers, ctx.request.headers);
        }

        if (!valid) {
          const error = new Error(ajv.errorsText());
          error.name = 'AjvError';
          throw error;
        }

        await next();
      });
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
