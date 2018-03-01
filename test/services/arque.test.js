import test from 'ava';
import _ from 'lodash';
import request from '../../tools/arque';
import Arque from '../../services/arque';

const amqp = new Arque();

async function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

test.before(async () => {
  amqp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    ctx.benchmark = Date.now() - start;
  });
});

test.after(async () => {
  await amqp.stop();
});

test('rabbitmq, given single worker with single message', async t => {
  const message = {hello: 'world'};

  await amqp.route('sample.worker1', async ctx => {
    ctx.response.body = ctx.request.body;
  });
  const {body, code} = await request('sample.worker1', message);

  t.is(code, 'success');
  t.deepEqual(body, message);
});

test('rabbitmq, given single worker with multiple messages', async t => {
  const message = {hello: 'world'};

  await amqp.route('sample.worker2', async ctx => {
    const time = 1000 * Math.random();
    await delay(time);
    ctx.response.body = Object.assign({}, time, ctx.request.body);
  });

  const result = await Promise.all(_.times(5, async () => request('sample.worker2', message, 10000)));

  t.is(result.length, 5);
});

test('rabbitmq, given multiple worker with single message', async t => {
  const message = {hello: 'world'};
  const responses = [];

  await Promise.all(
    _.times(5, async () => amqp.route('sample.worker3', async ctx => {
      responses.push(ctx);
    })),
  );

  await request('sample.worker3', message);

  t.is(responses.length, 1);
});

test('rabbitmq, given multiple worker with multiple messages', async t => {
  const message = {hello: 'world'};
  const responses = [];

  await Promise.all(
    _.times(5, async () => amqp.route('sample.worker4', async ctx => {
      responses.push(ctx.body);
      return ctx.body;
    })),
  );

  const result = await Promise.all(_.times(5, async () => request('sample.worker4', message)));

  t.is(responses.length, 5);
  t.is(result.length, 5);
});

test('rabbitmq, given a timeout request', async t => {
  const error = await t.throws(request('sample.worker5', {hello: 'world'}));

  t.is(error.message, 'Request timeout.');
});
