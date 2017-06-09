import _ from 'lodash';
import Ajv from 'ajv';
import utilities from './utilities';

/* load all Ajv Schema*/
const ajv = new Ajv();
utilities.loadSchema(ajv, 'schema');

export default function (routes, resources, policies) {
  return _.reduce(routes, (reduced, { type, api, resource, policy = [], schema }) => {
    const stack = [];
    const resourceObject = _.get(resources, resource);

    if (!resourceObject) { throw new Error('Resource not found'); }

    /* stack schema validator */
    if (schema) {
      stack.push(async (ctx, next) => {
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
    }

    /* stack policies */
    _.each(policy, (name) => {
      if (!policies[name]) throw new Error('Policy not found');
      stack.push(policies[name]);
    });

    /* stack resource object */
    stack.push(resourceObject);
    reduced.push({ type, api, stack });

    return reduced;
  }, []);
}
