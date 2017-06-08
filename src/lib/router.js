import _ from 'lodash';
import Ajv from 'ajv';

export default function (routes, resources, policies) {
  return _.reduce(routes, ({ type, api, resource, policy, schema }) => {
    const stack = [];
    const resourceObject = _.get(resources, resource);

    if (!resourceObject) { throw new Error('Resource not found'); }

    /* stack schema validator */
    stack.push(async (ctx, next) => {
      const ajv = new Ajv();
      const { body, headers } = schema;

      let valid;

      if (!body && !headers) { await next(); return; }
      if (body) { valid = ajv.validate(body, ctx.body); }
      if (headers) { valid = ajv.validate(headers, ctx.headers); }

      if (!valid) {
        const error = new Error(ajv.errorsText());
        error.name = 'AjvError';
        throw error;
      }

      await next();
    });

    /* stack policies */
    _.each(policy, (name) => {
      if (!policies[name]) throw new Error('Policy not found');
      stack.push(policies[name]);
    });

    /* stack resource object */
    stack.push(resourceObject);

    return { type, api, stack };
  }, []);
}
