import test from 'ava';
import _ from 'lodash';
import uuid from 'uuid';
import Arque from 'arque';
import { AMQP } from '../src/adapters/rabbitmq';

const arque = new Arque(`amqp://localhost/`);
const amqp = new AMQP();
amqp.arque = arque;

const rpc = async (route, request, timeout = 6000) => {
  const client = await arque.createClient({ job: route, timeout });
  const response = await client({ body: request });

  if (response.code === 'invalid_request') {
    logger(`route: ${route}, request: ${JSON.stringify(request, null, 2)}, error: ${response.body}`);
    const error = new Error(response.body);
    error.name = 'RabbitMQAdapterError';
    throw error;
  }

  return response;
};

async function delay(time) {
  return new Promise((resolve) => { setTimeout(resolve, time); });
}

test.before(async () => {
  amqp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    ctx.benchmark = Date.now() - start;
    console.log(`route: ${ctx.route}, benchmark: ${ctx.benchmark}ms`);
  });
});

test('rabbitmq, given single worker with single message', async (t) => {
  const message = { hello: 'world' };

  await amqp.route('sample.worker1', async (ctx) => { ctx.response.body = ctx.request.body; });
  const { body, code } = await rpc('sample.worker1', message);

  t.is(code, 'success');
  t.deepEqual(body, message);
});

test('rabbitmq, given single worker with multiple messages', async (t) => {
  const message = { hello: 'world' };

  await amqp.route('sample.worker2', async (ctx) => {
    const time = 1000 * Math.random();
    await delay(time);
    ctx.response.body = { time, ...ctx.request.body };
  });

  const result = await Promise.all(_.times(5, async () => rpc('sample.worker2', message, 10000)));

  t.is(result.length, 5);
});

test('rabbitmq, given multiple worker with single message', async (t) => {
  const message = { hello: 'world' };
  const responses = [];

  await Promise.all(
    _.times(5, async () => amqp.route('sample.worker3', async (ctx) => {
      responses.push(ctx);
    })),
  );

  await rpc('sample.worker3', message);

  t.is(responses.length, 1);
});

test('rabbitmq, given multiple worker with multiple messages', async (t) => {
  const message = { hello: 'world' };
  const responses = [];

  await Promise.all(
    _.times(5, async () => amqp.route('sample.worker4', async (ctx) => {
      responses.push(ctx.body);
      return ctx.body;
    })),
  );

  const result = await Promise.all(_.times(5, async () => rpc('sample.worker4', { id: uuid.v4(), ...message })));

  t.is(responses.length, 5);
  t.is(result.length, 5);
});

test('rabbitmq, given a timeout request', async (t) => {
  const error = await t.throws(rpc('sample.worker5', { hello: 'world' }));

  t.is(error.message, 'Job timeout.');
});

test.after(async () => { amqp.close(); });
