/**
 * Chronobank/eth-nem-action-processor configuration
 * @module config
 * @returns {Object} Configuration
 */

require('dotenv').config();
const _ = require('lodash');

const config = {
  systemRabbit: {
    url: process.env.SYSTEM_RABBIT_URI || process.env.RABBIT_URI || 'amqp://localhost:5672',
    exchange: process.env.SYSTEM_RABBIT_EXCHANGE || 'internal',
    serviceName: process.env.SYSTEM_RABBIT_SERVICE_NAME || 'system' 
  },
  checkSystem: process.env.CHECK_SYSTEM || true,
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth'
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth'
    }
  },
  schedule: {
    job: process.env.SCHEDULE_NEM_JOB || '30 * * * * *'
  },
  nem: {
    network: process.env.NEM_NETWORK ? parseInt(process.env.NEM_NETWORK) : -104,
    mosaic: process.env.NEM_MOSAIC_NAME || 'cb:minutes',
    divisibillity: 100,
    txFee: process.env.NEM_TX_FEE,
    host: process.env.NEM_HOST || 'http://localhost',
    port: process.env.NEM_PORT || 7890,
    privateKey: process.env.NEM_PRIVATE_KEY || 'secret_key',
    password: process.env.NEM_PASSWORD || '',
    actions: process.env.NEM_ACTIONS ? _.chain(process.env.NEM_ACTIONS)
      .split(',').defaults([]).value() : ['welcomeBonus', 'timeBonus'],
    welcomeBonus: {
      amount: 1
    },
    timeBonus: {
      rate: process.env.NEM_BONUS_RATE || 60,
      timeDivisibility: 100000000 //1 time
    }
  }
};

module.exports = config;
