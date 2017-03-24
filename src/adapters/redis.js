/* globals Adapter */
import redis from 'redis';
import Promise from 'bluebird';

const adapter = {};

adapter.start = async () => {
  const { REDIS_HOST, REDIS_PORT } = process.env;
  const client = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

  Promise.promisifyAll(client.prototype);

  Adapter.Redis = client;
};

adapter.stop = async () => { Adapter.Redis.quit(); };

export default adapter;
