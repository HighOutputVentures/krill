import delay from '../delay';

export async function policy5(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  console.log(`adding delay5: ${time} on a policy`);

  await next();
}
