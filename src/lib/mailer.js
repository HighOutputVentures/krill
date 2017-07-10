import mailgun from 'mailgun-js';
import debug from 'debug';
import forEach from 'lodash/forEach';
import MailQueue from './mailqueue';

const { MAILGUN_KEY = '', MAILGUN_DOMAIN = '', APP_MODE = 'testing' } = process.env;
const logger = debug('mailgun');
const mailer = mailgun({ apiKey: MAILGUN_KEY, domain: MAILGUN_DOMAIN });

export default function (emails, prefetch, delay) {
  if (APP_MODE === 'testing') return;

  const queue = new MailQueue({ emails, prefetch, delay });
  queue.on('dispatch', (data) => {
    forEach(data.dispatch, (email) => {
      logger(`dispatching ${email}`);
      mailer.messages.send(email, (err, body) => {
        if (err) logger(err);
        logger(body);
      });
    });
  });
  queue.dispatch();
}
