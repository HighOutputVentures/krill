const debug = require('debug')('rabbitmq');
const delay = require('../delay');

module.exports = [
  async (ctx, next) => {
    const start = Date.now();
    await next();
    debug(`route: ${ctx.route}, benchmark: ${Date.now() - start}ms`);
  },

  async (ctx, next) => {
    const time = 500 * Math.random();
    await delay(time);
    await next();
  },

  async (ctx, next) => {
    const time = 500 * Math.random();
    await delay(time);
    await next();
  },

  async (ctx, next) => {
    const time = 500 * Math.random();
    await delay(time);
    await next();
  },

  async (ctx, next) => {
    const time = 500 * Math.random();
    await delay(time);
    await next();
  },

  async (ctx, next) => {
    const time = 500 * Math.random();
    await delay(time);
    await next();
  }
];
