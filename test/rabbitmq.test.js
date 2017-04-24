import test from 'ava';
import Adapter from '../src/adapters/rabbitmq';

const adapter = new Adapter();

test.before(async () => {
  await adapter.start({
    conf: { host: 'localhost', vhost: '', user: 'guest', password: 'guest' },
    routes: [],
    resources: {},
  });
});

test.cb('rabbitmq, given single worker with single message', (t) => {
  const rabbit = adapter.adapter;

  rabbit.subscribe('sample.worker', async ({ body }) => {
    t.deepEqual(body, { message: 'worker message' });
    t.end();
  });

  rabbit.publish('sample.worker', { message: 'worker message' });
});

test.todo('rabbitmq, given single worker with multiple messages');

test.todo('rabbitmq, given multiple worker with single message');

test.todo('rabbitmq, given multiple worker with multiple messages');


test.after(async () => { await adapter.stop(); });
