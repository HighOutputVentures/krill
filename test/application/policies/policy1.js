export async function policy1(ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  console.log(`adding delay1: ${time} on a policy`);

  await next();
}
