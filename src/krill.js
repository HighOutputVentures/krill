import _ from 'lodash';
import Promise from 'bluebird';

export default class {
  constructor() {
    this.store = {};
    this.store.modules = {};
  }

  set({ key, value }) {
    this.store[key] = value;
  }

  get(key) {
    return this.store[key];
  }

  async start() {
    const {
      bootloaders = [],
      adapters = [],
      routes = [],
      conf = {},
      resources = {},
    } = this.store;

    /* load bootloaders */
    await Promise.all(bootloaders);

    /* start adapters */
    await Promise.all(_.map(adapters, async (adapter) => {
      const Module = require(`./adapters/${adapter}`).default;

      this.store.modules[adapter] = new Module();
      await this.store.modules[adapter].start({
        conf,
        routes: routes.filter(route => route.type === 'amqp'),
        resources,
      });
    }));
  }

  async stop() {
    const { adapters = [] } = this.store;

    await Promise.all(_.map(adapters, async (adapter) => {
      await this.store.modules[adapter].stop();
    }));
  }
}
