import delay from '../delay';

export async function policy2(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  console.log(`adding delay2: ${time} on a policy`);

  await next();
}
