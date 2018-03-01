module.exports = function (middlewares) {
  if (!Array.isArray(middlewares)) {
    throw new TypeError('Middleware stack must be an array');
  }

  return (ctx, next) => {
    function execute(index) {
      const fn = (index === middlewares.length) ? next : middlewares[index];
      if (!fn) {
        return Promise.resolve();
      }

      try {
        return Promise.resolve(fn(ctx, () => execute(index + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return execute(0);
  };
};
