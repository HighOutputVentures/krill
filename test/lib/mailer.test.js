import test from 'ava';

test.skip('Given valid email request', t => {
  const mailer = require('../../src/lib/mailer').default;
  mailer([{
    from: 'Identifi <noreply@identifi.com>',
    subject: 'Identifi Test Email',
    to: 'arjay@highoutput.io',
    text: 'sample email'
  }], 1, 1, function (err) {
    if (err) t.fail();
    t.end();
  });
});
