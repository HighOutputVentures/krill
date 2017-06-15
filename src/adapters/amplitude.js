/* globals Adapter */
import request from 'request-promise';
import debug from 'debug';

const { AMPLITUDE_KEY } = process.env;
const logger = debug('amplitude');

export default {
  async start() {
    Adapter.Amplitude = async ({ event }) => {
      try {
        await request('https://api.amplitude.com')
          .post('/httpapi')
          .set('content-type', 'application/x-www-form-urlencoded')
          .data(`api_key=${AMPLITUDE_KEY}&event=${JSON.stringify(event)}`);
      } catch (err) {
        logger(`event: ${event}, ${err.message}`);
        const error = new Error(err.message);
        error.name = 'AmplitudeAdapterError';
        throw error;
      }
    };
  },

  async stop() { /* noop */ },
};
