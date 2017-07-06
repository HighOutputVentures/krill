import mailgun from 'mailgun-js';
import debug from 'debug';
import forEach from 'lodash/forEach';
import MailQueue from './mailqueue';

const { MAILGUN_KEY = '', APP_MODE = 'testing' } = process.env;
const logger = debug('mailgun');
const mailer = mailgun({ apiKey: MAILGUN_KEY, domain: 'identifi.com' });

export default function (emails, prefetch, delay) {
  if (APP_MODE === 'testing') return;

  const queue = new MailQueue({ emails, prefetch, delay });
  queue.on('dispatch', (data) => {
    forEach(data.dispatch, (email) => {
      mailer.messages.send(email, (err) => { if (err) logger(err); });
    });
  });
  queue.dispatch();
}
