/* globals Adapter */
import request from 'request-promise';
import debug from 'debug';

const { AMPLITUDE_KEY } = process.env;
const logger = debug('amplitude');

export default {
  async start() {
    Adapter.Amplitude = async (event) => {
      try {
        await request({
          uri: 'https://api.amplitude.com/httpapi',
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: `api_key=${AMPLITUDE_KEY}&event=${JSON.stringify(event)}`,
          json: true,
        });
      } catch (err) {
        logger(`event: ${JSON.stringify(event)}, ${err.message}`);
        const error = new Error(err.message);
        error.name = 'AmplitudeAdapterError';
        throw error;
      }
    };
  },

  async stop() { /* noop */ },
};
