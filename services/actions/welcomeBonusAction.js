/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.welcomeBonusAction'});

module.exports = async (address, amount, nemAddress) => {

  log.info(`Running welcomeBonus ${address}`);

  let result = await nemServices.makeBonusTransfer(nemAddress, amount * config.nem.divisibillity, 'Welcome Bonus');
  await accountModel.findOneAndUpdate({address: address}, {$set: {welcomeBonusSent: true}, $inc: {transferLimit: 1}});
  return result;

};
