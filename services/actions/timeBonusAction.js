/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.timeBonusAction'}),
  config = require('../../config'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices');

module.exports = async (address, currentAmount, depositMaxAmount, nemAddress) => {

  log.info(`TimeBonus run for ${address}`);

  if ((depositMaxAmount - currentAmount) / config.nem.timeBonus.timeDivisibility * config.nem.timeBonus.rate >= 1) {
    const transferAmount = (depositMaxAmount - currentAmount) / config.nem.timeBonus.timeDivisibility * config.nem.timeBonus.rate * config.nem.divisibillity;
    const result = await nemServices.makeBonusTransfer(nemAddress, transferAmount, 'Time Bonus');
    await accountModel.findOneAndUpdate({address: address}, {
      $set: {maxTimeDeposit: depositMaxAmount},
      $inc: {transferLimit: 1}
    });
    return result;
  }

  return 1;
};
