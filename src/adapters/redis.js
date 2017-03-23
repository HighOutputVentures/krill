/* globals Adapter */
import redis from 'redis';
import Promise from 'bluebird';

const adapter = {};

adapter.start = async () => {
  const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  Promise.promisifyAll(client.prototype);

  Adapter.Redis = client;
};

adapter.stop = async () => { Adapter.Redis.quit(); };

export default adapter;
