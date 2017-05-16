/* globals Adapter */
import mongoose from 'mongoose';

export const adapter = {
  async start() {
    const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB } = process.env;
    Adapter.Moongose = mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DB}`);
  },

  async stop() { await mongoose.disconnect(); },
};
