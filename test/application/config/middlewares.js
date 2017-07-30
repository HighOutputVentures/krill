import debug from 'debug';
import delay from '../delay';

const logger = debug('rabbitmq');

export default {
  /* http middlewares */
  http: [
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
    },
  ],

  /* amqp middlewares */
  amqp: [
    async (ctx, next) => {
      const start = Date.now();
      await next();
      logger(`route: ${ctx.route}, benchmark: ${Date.now() - start}ms`);
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
    },
  ],
};
