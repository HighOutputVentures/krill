export default [
  async(ctx, next) => {
    const start = Date.now();

    await next();

    console.log(`benchmark: ${start - Date.now()}`);
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
];
