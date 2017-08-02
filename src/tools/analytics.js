import request from 'request-promise';
import debug from 'debug';

const logger = debug('analytics');

class Analytics {
  constructor(appId) {
    this.appId = appId;
  }

  async identity(users) {
    try {
      logger(JSON.stringify({ app_id: this.appId, users }));
      await request({
        uri: 'https://heapanalytics.com/api/add_user_properties',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ app_id: this.appId, users }),
      });
    } catch (err) { logger(err); }
  }

  async track(events) {
    try {
      logger(JSON.stringify({ app_id: this.appId, events }));
      await request({
        uri: 'https://heapanalytics.com/api/track',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ app_id: this.appId, events }),
      });
    } catch (err) { logger(err); }
  }
}

export default function () {
  const { HEAP_KEY = '' } = process.env;
  return new Analytics(HEAP_KEY);
}
