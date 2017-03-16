/* globals Adapter */
import sendgrid from 'sendgrid';
import debug from 'debug';

const adapter = {};
const logger = debug('sendgrid');

class Mailer {
  constructor() {
    this.mailer = sendgrid(process.env.SENDGRID_KEY);
  }

  /**
  * Sends an email using sendgrid
  * @param {String} object.from
  * @param {String} object.subject
  * @param {String} object.to
  * @param {String} object.content
  */
  async send({ from, subject, to, content }) {
    try {
      const request = this.mailer.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [{ to: [{ email: to }], subject }],
          from: { email: from },
          content: [{ type: 'text/plain', value: content }],
        },
      });
      await this.mailer.API(request);
    } catch (err) { logger(err); throw err; }
  }
}

adapter.start = async () => {
  Adapter.Sendgrid = new Mailer();
};

adapter.stop = async () => {};

export default adapter;
