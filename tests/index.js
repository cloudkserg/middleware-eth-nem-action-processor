/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv/config');

const config = require('../config'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  Web3 = require('web3'),
  net = require('net'),
  expect = require('chai').expect,
  accountModel = require('../models/accountModel'),
  depositModel = require('./helpers/models/depositModel'),
  setHash = require('./helpers/models/setHashModel'),
  nem = require('nem-sdk').default,
  _ = require('lodash'),
  timeBonus = require('../services/actions/timeBonusAction'),
  welcomeBonus = require('../services/actions/welcomeBonusAction'),
  xemBonus = require('../services/actions/xemBonusAction'),
  aggregateModule = require('./helpers/aggregateModule'),
  generateEvents = require('./helpers/generateEvents'),
  nemUserApi = require('./helpers/nemUserApi');

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);
mongoose.connect(config.mongo.data.uri, {useMongoClient: true});

const web3 = new Web3();
const provider = new Web3.providers.IpcProvider(config.web3.uri, net);
let accounts;

describe('core/nem processor', function () {

  before(async () => {
    web3.setProvider(provider);
    accounts = await Promise.promisify(web3.eth.getAccounts)();
    await generateEvents(accounts[0], provider);

    const keyPair = nem.crypto.keyPair.create(config.nem.privateKey);
    const address = nem.model.address.toAddress(keyPair.publicKey.toString(), config.nem.network);

    const query = {
      address: accounts[0],
      nem: address
    };

    await accountModel.findOneAndUpdate({address: query.address}, query, {upsert: true});
    
    ctx.checkerPid = spawn('node', ['tests/utils/proxyChecker.js'], {
      env: process.env, stdio: 'ignore'
    });
    await Promise.delay(5000);
  });

  after(async () => {
    await accountModel.remove();
    await depositModel.remove();
    await setHash.remove();
    await mongoose.disconnect();
    await web3.currentProvider.connection.end();
    await ctx.checkerPid.kill();
  });

  it('test aggregate data base', async () => {
    await Promise.delay(60000);
    let result = await aggregateModule();
    expect(result.depositSets.length).to.be.above(0);
    expect(result.welcomeBonusSets.length).to.be.above(0);
    expect(result.accounts.length).to.be.above(0);
  });

  it('test welcome bonus action', async () => {
    await Promise.delay(1000);

    const keyPair = nem.crypto.keyPair.create(config.nem.privateKey);
    const address = nem.model.address.toAddress(keyPair.publicKey.toString(), config.nem.network);
    let result = await welcomeBonus(accounts[0], 1, address);
    expect(result.code).to.be.equal(1);
    await Promise.delay(60000);
    const tx = await nemUserApi.getTx(result.transactionHash.data);
    const mosaic = _.get(tx, 'mosaics.0') || _.get(tx, 'otherTrans.mosaics.0');
    expect(mosaic.quantity / 100).to.be.equal(1);
  });

  it('test time bonus action', async () => {
    await Promise.delay(60000 * 2);

    const keyPair = nem.crypto.keyPair.create(config.nem.privateKey);
    const address = nem.model.address.toAddress(keyPair.publicKey.toString(), config.nem.network);
    const currentBonus = 15 * Math.pow(10, 6);
    const maxPrevBonus = 10 * Math.pow(10, 6);
    let result = await timeBonus(accounts[0], maxPrevBonus, currentBonus, address);
    expect(result.code).to.be.equal(1);
    await Promise.delay(60000);
    const tx = await nemUserApi.getTx(result.transactionHash.data);
    const mosaic = _.get(tx, 'mosaics.0') || _.get(tx, 'otherTrans.mosaics.0');
    expect(mosaic.quantity / 100).to.be.equal((currentBonus - maxPrevBonus) / config.nem.timeBonus.timeDivisibility * config.nem.timeBonus.rate);
  });

  it('test xem bonus action', async () => {
    await Promise.delay(1000);

    const keyPair = nem.crypto.keyPair.create(config.nem.privateKey);
    const address = nem.model.address.toAddress(keyPair.publicKey.toString(), config.nem.network);
    const balance = await nemUserApi.getNemBalance(address);

    let result = await xemBonus(address, 0);
    expect(result.code).to.be.equal(1);
    await Promise.delay(60000);
    const tx = await nemUserApi.getTx(result.transactionHash.data);
    const mosaic = _.get(tx, 'mosaics.0') || _.get(tx, 'otherTrans.mosaics.0');
    expect(mosaic.quantity / 100).to.be.equal(_.floor(balance / (config.nem.xemBonus.xemDivisibility * config.nem.xemBonus.rate) * config.nem.divisibillity / 100, 2));

  });

});
