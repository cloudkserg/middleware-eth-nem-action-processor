require('dotenv/config');

const config = require('../config'),
  mongoose = require('mongoose'),
  request = require('request-promise'),
  Promise = require('bluebird'),
  expect = require('chai').expect,
  net = require('net'),
  nem = require('nem-sdk').default,
  amqp = require('amqplib'),
  _ = require('lodash'),
  accountModel = require('../models/accountModel'),
  ctx = {};

mongoose.Promise = Promise; // Use custom Promises
mongoose.connect(config.mongo.accounts.uri, {useMongoClient: true});

describe('core/action processor', function () {

  before(async () => {

    ctx.amqpInstance = await amqp.connect(config.rabbit.url);
    ctx.amqpchannel = await ctx.amqpInstance.createChannel();

    try {
      await ctx.amqpchannel.assertExchange('events', 'topic', {durable: false});
    } catch (e) {
      ctx.amqpchannel = await ctx.amqpInstance.createChannel();
    }

  });

  after(() => {
    ctx.amqpInstance.close();
    return mongoose.disconnect();
  });

  it('add account to mongo', async () => {

    let rBytes = nem.crypto.nacl.randomBytes(32);
    let privateKey = nem.utils.convert.ua2hex(rBytes);
    let keyPair = nem.crypto.keyPair.create(privateKey);

    ctx.account = {
      address: `0x${_.map(new Array(40), item=> _.random(0, 9)).join('')}`,
      nem: nem.model.address.toAddress(keyPair.publicKey.toString(), config.nem.network)
    };

    return await new accountModel(ctx.account).save();
  });

  it('get initial balance of account', async () => {

    let data = await request({
      uri: `${config.nem.host}:${config.nem.port}/account/mosaic/owned?address=${ctx.account.nem}`,
      json: true
    });

    ctx.account.mosaic = _.chain(data)
      .get('data')
      .find(mosaic =>
      _.get(mosaic, 'mosaicId.namespaceId') === 'cb' &&
      _.get(mosaic, 'mosaicId.name') === 'minutes')
      .get('quantity', 0)
      .value();

  });

  it('send deposit event', async () => {
    ctx.amqpchannel.publish('events', `${config.rabbit.serviceName}_chrono_sc.deposit`, new Buffer(JSON.stringify({
      name: 'Deposit',
      payload: {
        who: ctx.account.address,
        amount: 100000000 * 0.017
      }
    })));
  });

  it('check that bonus has been sent', async () => {
    await Promise.delay(20000);
    let result = await accountModel.findOne({address: ctx.account.address});
    expect(parseInt(result.maxTimeDeposit)).to.be.above(0);
  });


  it('check the account\'s balance', async () => {
    await Promise.delay(60000 * 2);

    let data = await request({
      uri: `${config.nem.host}:${config.nem.port}/account/mosaic/owned?address=${ctx.account.nem}`,
      json: true
    });

    let mosaic = _.chain(data)
      .get('data')
      .find(mosaic =>
      _.get(mosaic, 'mosaicId.namespaceId') === 'cb' &&
      _.get(mosaic, 'mosaicId.name') === 'minutes')
      .get('quantity', 0)
      .value();

    expect(mosaic).to.be.above(ctx.account.mosaic);

  });


});
