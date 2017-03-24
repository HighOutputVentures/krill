/* globals Adapter */

import _ from 'lodash';
import Promise from 'bluebird';
import { Cluster, N1qlQuery } from 'couchbase';
import debug from 'debug';

const adapter = {};
const logger = debug('couchbase');

class Bucket {

  /**
   * Couchbase bucket constructor
   * @param {Couchbase} cluster
   * @param {object} opts
   * @param {string} name
   */
  constructor(cluster, name) {
    this.name = name;
    this.cluster = cluster;
    this.bucket = cluster.openBucket(this.name);
    this.manager = this.bucket.manager();
  }

  /**
   * Returns the MutateInBuilder function
   * @param {string} key
   * @param {object} options
   * @returns {*|MutateInBuilder}
   */
  mutateIn(key, options) {
    return this.bucket.mutateIn(key, options);
  }

  /**
   * Insert data to couchbase with its respective key
   * @param {string} key
   * @param {object} data
   * @param {object} options
   * @returns {Promise}
   */
  async insert(key, data, options = {}) {
    const response = await new Promise((resolve, reject) => {
      this.bucket.insert(key, data, options, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Updates data to couchbase with its respective key
   * @param {string} key
   * @param {object} data
   * @param {object} options
   * @returns {Promise}
   */
  async upsert(key, data, options = {}) {
    const response = await new Promise((resolve, reject) => {
      this.bucket.upsert(key, data, options, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Get the json data given its respective id
   * @param {string} key
   * @param {object} options
   * @returns {Promise}
   */
  async get(key, options = {}) {
    const response = await new Promise((resolve, reject) => {
      this.bucket.get(key, options, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Run a query in the bucket using n1ql
   * @param {string} query
   * @param {object} params
   * @returns {Promise}
   */
  async query(query, params = []) {
    const consistency = N1qlQuery.fromString(query).consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    const response = await new Promise((resolve, reject) => {
      this.bucket.query(consistency, params, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Deletes a document in the bucket
   * @param {string} key
   * @param {object} options
   * @returns {Promise}
   */
  async remove(key, options = {}) {
    const response = await new Promise((resolve, reject) => {
      this.bucket.remove(key, options, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Deletes all the documents in the bucket,
   * similar to TRUNCATE in SQL
   * @returns {Promise}
   */
  async flush() {
    await new Promise((resolve, reject) => {
      this.manager.flush((err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });
  }

  /**
   * Disconnects the bucket connection
   */
  disconnect() {
    this.bucket.disconnect();
  }
}

class Couchbase {

  constructor(opts = {}) {
    this.opts = _.defaults(opts, {
      host: 'localhost',
      port: 8091,
      user: 'Administrator',
      password: '',
    });

    this.cluster = new Cluster(`couchbase://${this.opts.host}:${this.opts.port}`);
    this.manager = this.cluster.manager(this.opts.user, this.opts.password);
  }

  /**
   * Connect to an existing bucket
   * @param {string} name
   * @returns {Bucket}
   */
  openBucket(name) {
    return new Bucket(this.cluster, name);
  }

  /**
   * Creates the bucket and returns true if success
   * @param {string} name
   * @param {object} opts
   * @returns {Promise}
   */
  async createBucket(name, opts = {}) {
    const response = await new Promise((resolve, reject) => {
      this.manager.createBucket(name, opts, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Delete the bucket and returns true if success
   * @param {string} name
   * @returns {Promise}
   */
  async removeBucket(name) {
    const response = await new Promise((resolve, reject) => {
      this.manager.removeBucket(name, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }

  /**
   * Run a query in the cluster N1QL
   * @param {string} query
   * @param {object|array} params
   * @returns {Promise}
   */
  async query(query, params = {}) {
    const response = await new Promise((resolve, reject) => {
      this.cluster.query(N1qlQuery.fromString(query), params, (err, result) => {
        if (err) { logger(err); reject(err); }
        resolve(result);
      });
    });

    return response;
  }
}

adapter.start = async () => {
  const {
    COUCHBASE_CLUSTER_HOST,
    COUCHBASE_CLUSTER_PORT,
    COUCHBASE_CLUSTER_USER,
    COUCHBASE_CLUSTER_PASSWORD,
    COUCHBASE_BUCKET_NAME,
  } = process.env;

  const cluster = new Couchbase({
    host: COUCHBASE_CLUSTER_HOST,
    port: COUCHBASE_CLUSTER_PORT,
    user: COUCHBASE_CLUSTER_USER,
    password: COUCHBASE_CLUSTER_PASSWORD,
  });

  Adapter.Couchbase = cluster.openBucket(COUCHBASE_BUCKET_NAME);
};

adapter.stop = async () => {
  Adapter.Couchbase.disconnect();
};

export default adapter;
