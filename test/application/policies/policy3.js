const delay = require('../delay');

module.exports = async function (ctx, next) {
  const time = 10 * Math.random();
  await delay(time);
  await next();
};
