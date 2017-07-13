import request from 'request-promise';

class Analytics {
  constructor(appId) {
    this.appId = appId;
  }

  async identity(users) {
    await request({
      uri: 'https://heapanalytics.com/api/add_user_properties',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { app_id: this.appId, users },
    });
  }

  async track(events) {
    await request({
      uri: 'https://heapanalytics.com/api/track',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { app_id: this.appId, events },
    });
  }
}

export default function () {
  const { HEAP_KEY = '' } = process.env;
  return new Analytics(HEAP_KEY);
}
