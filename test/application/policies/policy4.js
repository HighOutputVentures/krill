import delay from '../delay';

export async function policy4(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  console.log(`adding delay4: ${time} on a policy`);

  await next();
}
