/* globals Adapter */
import { RedisClient } from 'redis';
import Promise from 'bluebird';

const adapter = {};

adapter.start = async () => {
  Promise.promisifyAll(RedisClient.prototype);
  Adapter.Redis = new RedisClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });
};

adapter.stop = async () => { Adapter.Redis.quit(); };

export default adapter;
