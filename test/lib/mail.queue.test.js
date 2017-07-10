import test from 'ava';
import times from 'lodash/times';
import MailQueue from '../../src/lib/mailqueue';

test.cb('Array size: 20, prefetch: 5', t => {
  const emails = [];
  times(20, () => { emails.push({ from: 'Identifi <noreply@Identifi.com>', to: 'arjay@highoutput.com', content: 'sample email' }); });
  const queue = new MailQueue({ emails, prefetch: 5 });

  queue.on('dispatch', (data) => { t.is(data.dispatched.length, 5); });
  queue.on('done', t.end);
  queue.dispatch();
});

test.cb('Array size: 3, prefetch: 5', t => {
  const emails = [];
  times(3, () => { emails.push({ from: 'Identifi <noreply@Identifi.com>', to: 'arjay@highoutput.com', content: 'sample email' }); });
  const queue = new MailQueue({ emails, prefetch: 5 });

  queue.on('dispatch', (data) => { t.is(data.dispatched.length, 3); });
  queue.on('done', t.end);
  queue.dispatch();
});

test.cb('Array size: 1, prefetch: 5', t => {
  const queue = new MailQueue({ emails: [
    { from: 'Identifi <noreply@Identifi.com>', to: 'arjay@highoutput.com', content: 'sample email' },
  ], prefetch: 5 });

  queue.on('dispatch', (data) => { t.is(data.dispatched.length, 1); });
  queue.on('done', t.end);
  queue.dispatch();
});

test.cb('Array size: 1, prefetch: 1', t => {
  const queue = new MailQueue({ emails: [
    { from: 'Identifi <noreply@Identifi.com>', to: 'arjay@highoutput.com', content: 'sample email' },
  ], prefetch: 5 });

  queue.on('dispatch', (data) => { t.is(data.dispatched.length, 1); });
  queue.on('done', t.end);
  queue.dispatch();
});

test.cb('Array size: 0, prefetch: 5', t => {
  const queue = new MailQueue({ emails: [], prefetch: 5 });

  queue.on('dispatch', (data) => { t.fail(); });
  queue.on('done', t.end);
  queue.dispatch();
});
