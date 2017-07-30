import Arque from 'arque';

global.krill = {};
if (!global.krill.arque) {
  global.krill.arque = new Arque('');
}

export function async (route, request, timeout = 6000) {
  if (!this.clients[route]) {
    this.clients[route] = await this.arque.createClient({ job: route, timeout });
  }

  const response = await this.clients[route]({ body: request });

  if (response.code === 'invalid_request') {
    logger(`route: ${route}, request: ${JSON.stringify(request, null, 2)}, error: ${response.body}`);
    const error = new Error(response.body);
    error.name = 'RabbitMQAdapterError';
    throw error;
  }

  return response;
};