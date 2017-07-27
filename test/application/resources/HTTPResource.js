import delay from '../delay';

export const HTTPResource = {
  async post(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on HTTPResource`);

    ctx.body = { message: 'success' };
  },
  async get(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on HTTPResource`);

    ctx.body = { message: 'success' };
  },
  async patch(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on HTTPResource`);

    ctx.body = { message: 'success' };
  },
  async delete(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on HTTPResource`);

    ctx.body = { message: 'success' };
  },
};
