import debug from 'debug';
const logger = debug('rabbitmq');

export default {
  /* http middlewares */
  http: [
    async(ctx, next) => {
      const start = Date.now();

      await next();

      console.log(`benchmark: ${Date.now() - start}`);
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay1: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay2: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay3: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay4: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay5: ${time} on a middleware`);

      await next();
    },
  ],

  /* amqp middlewares */
  amqp: [
    async(ctx, next) => {
      const start = Date.now();

      await next();

      console.log(`route: ${ctx.route}, message: ${ctx.request.body}`);
      logger(`route: ${ctx.route}, benchmark: ${Date.now() - start}ms`);
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay1: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay2: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay3: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay4: ${time} on a middleware`);

      await next();
    },
    async(ctx, next) => {
      const time = 500 * Math.random();
      await delay(time);
      console.log(`adding delay5: ${time} on a middleware`);

      await next();
    },
  ]
};
