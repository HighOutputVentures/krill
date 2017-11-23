import mailgun from 'mailgun-js';
import debug from 'debug';
import forEach from 'lodash/forEach';
import MailQueue from './queue';

const { MAILGUN_KEY = '', MAILGUN_DOMAIN = '', APP_MODE = 'testing' } = process.env;

const logger = debug('mailgun');

export default function (emails, prefetch, delay, callback) {
  if (APP_MODE === 'testing') return;

  const mailer = mailgun({ apiKey: MAILGUN_KEY, domain: MAILGUN_DOMAIN });
  const error = [];
  const queue = new MailQueue({ emails, prefetch, delay });

  queue.on('dispatch', (data) => {
    forEach(data.dispatched, (email) => {
      logger(`dispatching email subject ${email.subject} to ${email.to} from ${email.from}`);
      mailer.messages().send(email, (err) => {
        if (err) {
          logger(`status: ${err.statusCode}, message: ${err.message}`);
          error.push(err);
        }
      });
    });
  });

  queue.on('done', () => {
    if (typeof callback === 'function') {
      callback((error.length !== 0 ? undefined : error));
    }
  });

  queue.dispatch();
}
