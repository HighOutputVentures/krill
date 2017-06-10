import test from 'ava';
import _ from 'lodash';
import supertest from 'supertest';

const request = supertest('http://localhost:8080');

test('bechmark http endpoints', async(t) => {
  await Promise.all(_.times(200, async () => {
    await request[_.sample(['post', 'get', 'patch', 'delete'])]('/endpoint')
      .send({ data: {} });
  }));

  t.pass();
});
