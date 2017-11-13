/* globals krill */
import Arque from 'arque';
import debug from 'debug';

const {
  RABBIT_HOST = 'localhost',
  RABBIT_VHOST = '',
  RABBIT_USER = 'guest',
  RABBIT_PASSWORD = 'guest',
  RABBIT_PORT = '5672',
} = process.env;

if (!global.krill) global.krill = {};
if (!global.krill.arque) global.krill.arque = new Arque(`amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}/${RABBIT_VHOST}`);
if (!global.krill.clients) global.krill.clients = {};

const logger = debug('rabbitmq');

export default async function (route, body, timeout = 6000) {
  if (!krill.clients[route]) {
    krill.clients[route] = await krill.arque.createClient({ job: route, timeout });
  }

  const response = await krill.clients[route]({ body });

  if (response.code === 'invalid_request') {
    logger(`route: ${route}, request: ${JSON.stringify(body, null, 2)}, error: ${response.body}`);
    const error = new Error(response.body);
    error.name = 'RabbitMQAdapterError';
    throw error;
  }

  return response;
};
