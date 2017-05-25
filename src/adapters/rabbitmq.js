/* globals Routes, Adapter, Resources */
import uuid from 'uuid';
import Promise from 'bluebird';
import amqp from 'amqplib';
import _ from 'lodash';
import debug from 'debug';

const logger = debug('rabbitmq');

export class RabbitMQ {

  /**
   * Rabbit application constructor
   * @param {object} channel
   */
  constructor(connection, channel) {
    this.channel = channel;
    this.connection = connection;
  }

  /**
   * Creates a listener for rabbit based requests
   * @param {string} route
   * @param {function} event
   */
  async subscribe(route, event) {
    await this.channel.assertQueue(route, { durable: true, exclusive: false });

    this.channel.prefetch(1);

    this.channel.consume(route, async (request) => {
      let buffer;

      try {
        const response = await event(JSON.parse(request.content.toString()));
        buffer = (response) ?
          new Buffer(JSON.stringify({ code: 'success', body: response })) :
          new Buffer(JSON.stringify({ code: 'success' }));
      } catch (err) {
        logger(err);
        buffer = new Buffer(JSON.stringify({ code: 'invalid_request', message: err.message }));
      }

      this.channel.sendToQueue(
        request.properties.replyTo, buffer,
        { correlationId: request.properties.correlationId },
      );

      this.channel.ack(request);
    });
  }

  async publish(route, request, time) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { reject(new Error('request_timeout')); }, time || 30000);
      const id = uuid.v4();

      this.channel.assertQueue('', { exclusive: true })
        .then((callback) => {
          this.channel.assertQueue(route, { durable: true })
            .then(() => {
              this.channel.sendToQueue(
                route,
                new Buffer(JSON.stringify({ body: request })),
                { correlationId: id, replyTo: callback.queue },
              );

              this.channel.consume(callback.queue, (message) => {
                if (message.properties.correlationId === id) {
                  const response = JSON.parse(message.content.toString());
                  if (response.code === 'invalid_request') reject(new Error(response.message));
                  clearTimeout(timeout);
                  resolve(response);
                }
              }, { noAck: true });
            });
        });
    });
  }

  close() { this.connection.close(); }
}

export default {
  async start() {
    try {
      const {
        RABBIT_HOST = 'localhost',
        RABBIT_VHOST = '',
        RABBIT_USER = 'guest',
        RABBIT_PASSWORD = 'guest',
      } = process.env;

      const routes = Routes.filter(route => route.type === 'amqp');
      const rabbit = await amqp.connect(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);
      const channel = await rabbit.createChannel();

      Adapter.RabbitMQ = new RabbitMQ(rabbit, channel);

      await Promise.all(_.map(routes, async (route) => {
        const resource = _.get(Resources, route.resource);

        if (!resource) {
          logger(`${route.resource} not found`);
          throw new Error('Resource not found');
        }

        await Adapter.RabbitMQ.subscribe(route.api, resource);
      }));
    } catch (err) { logger(err); throw err; }
  },

  async stop() { Adapter.RabbitMQ.close(); },
};
