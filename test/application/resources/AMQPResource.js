import delay from '../delay';

export const AMQPResource = {
  async create(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay: ${time} on ${ctx.route} AMQPResource.create`);

    ctx.body = { message: 'success' };
  },
  async update(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay: ${time} on ${ctx.route} AMQPResource.update`);

    ctx.body = { message: 'success' };
  },
  async retrieve(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay: ${time} on ${ctx.route} AMQPResource.retrieve`);

    ctx.body = { message: 'success' };
  },
  async remove(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    console.log(`adding delay: ${time} on ${ctx.route} AMQPResource.remove`);

    ctx.body = { message: 'success' };
  },
};
