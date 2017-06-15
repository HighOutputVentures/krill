import request from 'request-promise';
import qs from 'querystring';

const { AMPLITUDE_KEY } = process.env;

export default {
  async start() {
    Adapter.Amplitude = async ({ event }) => {
      await request('https://api.amplitude.com')
        .post('/httpapi')
        .set('content-type', 'application/x-www-form-urlencoded')
        .data(`api_key=${AMPLITUDE_KEY}&event=${JSON.stringify(event)}`);
    };
  },

  async stop() { /* noop */ },
};
