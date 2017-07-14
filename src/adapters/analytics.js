import request from 'request-promise';

class Analytics {
  constructor(appId) {
    this.appId = appId;
  }

  async identity(users) {
    await request('https://heapanalytics.com')
      .post('/api/add_user_properties')
      .set('content-type', 'application/json')
      .data({ app_id: this.appId, users });
  }

  async track(events) {
    await request('https://heapanalytics.com')
      .post('/api/track')
      .set('content-type', 'application/json')
      .data({ app_id: this.appId, events });
  }
}

export default function () {
  const { HEAP_KEY = '' } = process.env;
  return new Analytics(HEAP_KEY);
}
