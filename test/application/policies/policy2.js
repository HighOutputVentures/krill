import delay from '../delay';

export async function policy2(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  await next();
}
