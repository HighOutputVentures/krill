/* globals krill */
import Arque from 'arque';
import debug from 'debug';

if (!global.krill) global.krill = {};
if (!global.krill.arque) global.krill.arque = new Arque('');
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
