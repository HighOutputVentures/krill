const debug = require('debug')('rabbitmq');
const delay = require('../delay');

module.exports = [
  async (ctx, next) => {
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
  },

  async (ctx, next) => {
    const time = 500 * Math.random();
    await delay(time);
    await next();
  }
];
