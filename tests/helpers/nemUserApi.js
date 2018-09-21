/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv/config');

const nem = require('nem-sdk').default,
  config = require('../../config'),
  _ = require('lodash');

const getMosaicBalance = async (address) => {

  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port);
  const nemAccount = await nem.com.requests.account.mosaics.owned(endpoint, address);
  const mosaic = config.nem.mosaic.split(':')[1];

  return _.chain(nemAccount.data)
    .find(data => data.mosaicId.name === mosaic)
    .get('quantity')
    .value();

};

const getNemBalance = async (address) => {

  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port);
  const nemAccount = await nem.com.requests.account.data(endpoint, address);
  return nemAccount.account.balance;
};

const getTx = async (hash) => {

  const endpoint = nem.model.objects.create('endpoint')(config.nem.host, config.nem.port);
  const tx = await nem.com.requests.transaction.byHash(endpoint, hash);
  return tx.transaction;
};


module.exports = {
  getMosaicBalance,
  getNemBalance,
  getTx
};
