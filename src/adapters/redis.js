/* globals Adapter */
import redis from 'redis';
import Promise from 'bluebird';

const adapter = {};

adapter.start = async () => {
  Promise.promisifyAll(redis.RedisClient.prototype);
  Promise.promisifyAll(redis.Multi.prototype);

  const { REDIS_HOST = 'localhost', REDIS_PORT = 6379 } = process.env;
  const client = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

  Adapter.Redis = client;
};

adapter.stop = async () => { Adapter.Redis.quit(); };

export default adapter;
