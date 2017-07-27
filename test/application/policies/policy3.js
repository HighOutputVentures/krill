import delay from '../delay';

export async function policy3(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  console.log(`adding delay3: ${time} on a policy`);

  await next();
}
