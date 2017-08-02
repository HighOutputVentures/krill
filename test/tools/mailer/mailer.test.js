import test from 'ava';
import mailer from '../../../src/tools/mailer';

test.skip('Given valid email request', (t) => {
  mailer([{
    from: 'Identifi <noreply@identifi.com>',
    subject: 'Identifi Test Email',
    to: 'arjay@highoutput.io',
    text: 'sample email',
  }],
  1,
  1,
  (err) => {
    if (err) t.fail();
    t.end();
  });
});
