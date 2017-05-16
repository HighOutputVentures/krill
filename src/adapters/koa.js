/* globals Util, Policies, Routes, Resources */
/* eslint  import/no-dynamic-require: off */
import _ from 'lodash';
import Koa from 'koa';
import Router from 'koa-router';
import compose from 'koa-compose';
import parser from 'koa-bodyparser';
import path from 'path';
import logger from 'koa-logger';

const { KOA_PORT = '8080' } = process.env;
const adapter = {};
const app = new Koa();
const router = new Router();
const middlewares = require(path.join(process.cwd(), 'config/middlewares')).default;
const policies = require(path.join(process.cwd(), 'config/policies')).default;

let server;

adapter.start = async () => {
  /* require policies */
  Util.require(path.join(process.cwd(), 'policies'), 'Policies');

  /* load koa modules */
  app.use(logger());
  app.use(parser({ extendTypes: { json: ['application/vnd.api+json'] } }));

  /* load middlewares */
  _.each(middlewares, middleware => app.use(middleware));

  /* load routes */
  const routes = Routes.filter(route => route.type === 'http');
  _.each(routes, (route) => {
    const stack = [];
    const resource = _.get(Resources, route.resource);
    const policy = _.get(policies, route.resource, []);

    if (!/^(get|post|delete|put|patch) (.+)$/.test(route.api)) {
      throw new Error(`Invalid rest api ${route.api}`);
    }

    if (!resource) { throw new Error('Resource not found'); }

    /* Stack policies */
    _.each(policy, (name) => {
      if (!Policies[name]) throw new Error('Policy not found');
      stack.push(Policies[name]);
    });

    /* Stack Resource */
    const [method, url] = route.api.split(' ');
    stack.push(async (ctx, next) => {
      await resource.call(this, ctx);
      await next();
    });

    router[method](url, compose(stack));
  });

  /* load routes into koa */
  app.use(router.routes());
  app.use(router.allowedMethods());

  try { server = app.listen(KOA_PORT); } catch (err) { throw err; }
};

adapter.stop = async () => {
  await new Promise((resolve) => { server.close(resolve); });
};

export default adapter;
