/* globals Adapter */
import sendgrid from 'sendgrid';
import debug from 'debug';

const { SENDGRID_KEY = '' } = process.env;
const logger = debug('sendgrid');

class Mailer {
  constructor() {
    this.mailer = sendgrid(SENDGRID_KEY);
  }

  /**
  * Sends an email using sendgrid
  * @param {String} object.from
  * @param {String} object.subject
  * @param {String} object.to
  * @param {String} object.content
  */
  async send({ from, subject, to, content, type = 'text/plain' }) {
    try {
      logger(`
        from: ${from},
        to: ${to},
        subject: ${subject},
        type: ${type},
        content: ${content}
      `);

      const request = this.mailer.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [{ to: [{ email: to }], subject }],
          from: { email: from },
          content: [{ type, value: content }],
        },
      });
      await this.mailer.API(request);
    } catch (err) { logger(err); throw err; }
  }
}

export default {
  async start() {
    Adapter.Sendgrid = new Mailer();
  },

  async stop() { /* noop */ },
};
