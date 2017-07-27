import Arque from 'arque';

export default function (opts) {
  const arque = new Arque(opts);

  return async (route, body, timeout) => {
    const request = await arque.createClient({
      job: route,
      timeout: timeout || 6000,
    });
    const response = await request({ body });

    request.close();
    return response;
  };
}
