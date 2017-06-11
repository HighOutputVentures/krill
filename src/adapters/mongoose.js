/* globals Adapter */
import mongoose from 'mongoose';

export default {
  async start() {
    const {
      MONGO_USER = '',
      MONGO_PASS = '',
      MONGO_HOST = 'localhost',
      MONGO_DATABASE = '',
    } = process.env;

    Adapter.Moongose = mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DATABASE}`);
  },

  async stop() { await mongoose.disconnect(); },
};
