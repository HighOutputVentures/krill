/* globals Adapter */
import MQSP from 'mqsp';

export default {
  async start() {
    const {
      MYSQL_USER,
      MYSQL_PASSWORD,
      MYSQL_HOST,
      MYSQL_DATABASE,
      MYSQL_CONNECTION_LIMIT,
    } = process.env;

    Adapter.MySQL = new MQSP({
      host: MYSQL_HOST || 'localhost',
      user: MYSQL_USER || 'root',
      password: MYSQL_PASSWORD || '',
      database: MYSQL_DATABASE || 'mysql',
      connectionLimit: parseInt(MYSQL_CONNECTION_LIMIT || 20, 0),
      waitForConnections: true,
      acquireTimeout: 30000,
      multipleStatements: true,
    });
  },

  async stop() { await Adapter.MySQL.close(); },
};
