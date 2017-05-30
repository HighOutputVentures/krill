/* globals Routes, Adapter, Resources */
import Promise from 'bluebird';
import _ from 'lodash';
import debug from 'debug';
import Arque from 'arque';

const logger = debug('rabbitmq');

export class RabbitMQ {

  /**
   * Rabbit application constructor
   * @param {object} arque
   */
  constructor(arque) {
    this.arque = arque;
  }

  /**
   * Creates a listener for rabbit based requests
   * @param {string} route
   * @param {function} resource
   */
  async subscribe(route, resource) {
    await this.arque.createWorker({ job: route, concurrency: 1 }, async (message) => {
      let code;
      let response;

      try {
        response = await resource(message);
        code = 'success';
      } catch (err) {
        code = 'invalid_request';
        response = err.message;

        logger(`route: ${route}, request: ${JSON.stringify(message, null, 2)}, error: ${err.message}`);
      }

      return { body: response, code };
    });
  }

  async publish(route, request, timeout = 5000) {
    const client = await this.arque.createClient({ job: route, timeout });
    const response = await client({ body: request });

    if (response.code === 'invalid_request') {
      const error = new Error(response.body);
      error.name = 'RabbitMQAdapterError';

      logger(`route: ${route}, request: ${JSON.stringify(request, null, 2)}, error: ${response.body}`);
      throw error;
    }

    return response;
  }

  close() {
    this.arque.close();
  }
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
      const arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}/${RABBIT_VHOST}`);

      Adapter.RabbitMQ = new RabbitMQ(arque);

      await Promise.all(_.map(routes, async (route) => {
        const resource = _.get(Resources, route.resource);

        if (!resource) {
          logger(`Resource: ${route.resource} not found`);

          const error = new Error(`Resource: ${route.resource} not found`);
          error.name = 'RabbitMQAdapterError';

          throw error;
        }

        await Adapter.RabbitMQ.subscribe(route.api, resource);
      }));
    } catch (err) {
      logger(err);
      throw err;
    }
  },

  async stop() {
    Adapter.RabbitMQ.close();
  },
};
