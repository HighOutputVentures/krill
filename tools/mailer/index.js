const mailgun = require('mailgun-js');
const debug = require('debug')('mailgun');
const forEach = require('lodash/forEach');
const MailQueue = require('./queue');

const {MAILGUN_KEY = '', MAILGUN_DOMAIN = '', APP_MODE = 'testing'} = process.env;

module.exports = function (emails, prefetch, delay, callback) {
  if (APP_MODE === 'testing') {
    return;
  }

  const mailer = mailgun({apiKey: MAILGUN_KEY, domain: MAILGUN_DOMAIN});
  const error = [];
  const queue = new MailQueue({emails, prefetch, delay});

  queue.on('dispatch', data => {
    forEach(data.dispatched, email => {
      debug(`dispatching email subject ${email.subject} to ${email.to} = require(${email.from}`);
      mailer.messages().send(email, err => {
        if (err) {
          debug(`status: ${err.statusCode}, message: ${err.message}`);
          error.push(err);
        }
      });
    });
  });

  queue.on('done', () => {
    if (typeof callback === 'function') {
      callback((error.length === 0 ? undefined : error));
    }
  });

  queue.dispatch();
};
