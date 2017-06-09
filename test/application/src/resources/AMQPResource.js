export const AMQPResource = {
  async create(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on AMQPResource`);

    ctx.body = { message: 'success' };
  },
  async update(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on AMQPResource`);

    ctx.body = { message: 'success' };
  },
  async retrieve(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on AMQPResource`);

    ctx.body = { message: 'success' };
  },
  async remove(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on AMQPResource`);

    ctx.body = { message: 'success' };
  },
};
