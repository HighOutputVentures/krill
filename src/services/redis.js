/* globals Adapter */
import redis from 'redis';
import Promise from 'bluebird';

export default {
  async start() {
    Promise.promisifyAll(redis.RedisClient.prototype);
    Promise.promisifyAll(redis.Multi.prototype);

    const { REDIS_HOST = 'localhost', REDIS_PORT = 6379 } = process.env;
    const client = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

    Adapter.Redis = client;
  },

  async stop() { Adapter.Redis.quit(); },
};