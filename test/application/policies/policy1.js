import delay from '../delay';

export async function policy1(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  await next();
}
