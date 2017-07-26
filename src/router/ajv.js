export default async function (ctx, next) {
  const { body, headers } = ctx.request.schema;

  let valid;

  if (!body && !headers) { await next(); return; }
  if (body) { valid = ctx.ajv.validate(body, ctx.request.body); }
  if (headers) { valid = ctx.ajv.validate(headers, ctx.request.headers); }
  if (!valid) {
    const error = new Error(ctx.ajv.errorsText());
    error.name = 'AjvError';
    throw error;
  }

  await next();
}
