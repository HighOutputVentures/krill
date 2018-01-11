const delay = require('../delay');

module.exports = [
  async () => {
    const time = 500 * Math.random();
    await delay(time);
  },
  async () => {
    const time = 500 * Math.random();
    await delay(time);
  },
  async () => {
    const time = 1000 * Math.random();
    await delay(time);
  }
];
