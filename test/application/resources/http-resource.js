const delay = require('../delay');

module.exports = {
  async post(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    ctx.body = {message: 'success'};
  },
  async get(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    ctx.body = {message: 'success'};
  },
  async patch(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    ctx.body = {message: 'success'};
  },
  async delete(ctx) {
    const time = 100 * Math.random();
    await delay(time);
    ctx.body = {message: 'success'};
  }
};
