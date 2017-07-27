import delay from '../delay';

export default [
  async () => {
    const time = 500 * Math.random();
    await delay(time);
    console.log(`adding delay1: ${time} on a bootloader`);
  },
  async () => {
    const time = 500 * Math.random();
    await delay(time);
    console.log(`adding delay2: ${time} on a bootloader`);
  },
  async () => {
    const time = 1000 * Math.random();
    await delay(time);
    console.log(`adding delay3: ${time} on a bootloader`);
  },
];
