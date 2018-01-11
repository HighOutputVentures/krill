const EventEmitter = require('events');

module.exports = class extends EventEmitter {
  constructor(options) {
    super();

    this.emails = (options.constructor === Array) ?
      options : (options.emails || []);
    this.delay = options.delay || 1;
    this.prefetch = options.prefetch || 1;
  }

  dispatch() {
    this.emit('start');
    if (this.emails.length === 0) {
      this.emit('done');
      return;
    }

    let bulk = (this.prefetch > this.emails.length) ? this.emails.length : this.prefetch;
    let dispatched = this.emails.splice(0, bulk);

    this.emit('dispatch', {dispatched});

    const next = () => {
      setTimeout(() => {
        if (this.emails.length === 0) {
          this.emit('done');
          return;
        }

        bulk = (this.prefetch > this.emails.length) ? this.emails.length : this.prefetch;
        dispatched = this.emails.splice(0, bulk);

        this.emit('dispatch', {dispatched});

        if (this.emails.length > 0) {
          next();
          return;
        }

        this.emit('done');
      }, this.delay * 1000);
    };
    next();
  }
};
