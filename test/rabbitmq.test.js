import test from 'ava';
import amqp from 'amqplib';
import _ from 'lodash';
import uuid from 'uuid';
import { RabbitMQ } from '../src/adapters/rabbitmq';

const Adapter = {};
async function delay(time) {
  return new Promise((resolve) => { setTimeout(resolve, time); });
}

test.before(async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  Adapter.RabbitMQ = new RabbitMQ(connection, channel);
});

test('rabbitmq, given single worker with single message', async (t) => {
  const message = { hello: 'world' };

  await Adapter.RabbitMQ.subscribe('sample.worker1', async ({ body }) => body);
  const { body } = await Adapter.RabbitMQ.publish('sample.worker1', message);

  t.deepEqual(message, body);
});

test('rabbitmq, given single worker with multiple messages', async (t) => {
  const message = { hello: 'world' };

  await Adapter.RabbitMQ.subscribe('sample.worker2', async ({ body }) => {
    const time = 1000 * Math.random();
    await delay(time);
    return { time, ...body };
  });

  const result = await Promise.all(_.times(5, async () => Adapter.RabbitMQ.publish('sample.worker2', message, 10000)));

  t.is(result.length, 5);
});

test('rabbitmq, given multiple worker with single message', async (t) => {
  const message = { hello: 'world' };
  const responses = [];

  await Promise.all(
    _.times(5, async () => Adapter.RabbitMQ.subscribe('sample.worker3', async (ctx) => {
      responses.push(ctx);
    })),
  );

  await Adapter.RabbitMQ.publish('sample.worker3', message);

  t.is(responses.length, 1);
});

test('rabbitmq, given multiple worker with multiple messages', async (t) => {
  const message = { hello: 'world' };
  const responses = [];

  await Promise.all(
    _.times(5, async () => Adapter.RabbitMQ.subscribe('sample.worker4', async (ctx) => {
      responses.push(ctx.body);
      return ctx.body;
    })),
  );

  const result = await Promise.all(_.times(5, async () => Adapter.RabbitMQ.publish('sample.worker4', { id: uuid.v4(), ...message })));

  t.is(responses.length, 5);
  t.is(result.length, 5);
});

test('rabbitmq, given a timeout request', async (t) => {
  const error = await t.throws(Adapter.RabbitMQ.publish('sample.worker5', { hello: 'world' }));

  t.is(error.message, 'request_timeout');
});

test.after(async () => { Adapter.RabbitMQ.close(); });
