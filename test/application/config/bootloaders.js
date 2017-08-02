import delay from '../delay';

export default [
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
  },
];
