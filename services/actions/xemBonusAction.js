/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'nemActionProcessor.xemBonusAction'}),
  config = require('../../config'),
  _ = require('lodash'),
  accountModel = require('../../models/accountModel'),
  nemServices = require('../nemServices');

module.exports = async (nemAddress, maxXemAmount) => {
  log.info(`XemBonus run for ${nemAddress}`);

  const balances = await nemServices.getHistoricalBalance(nemAddress, config.nem.xemBonus.window.start, config.nem.xemBonus.window.end);

  const maxBalance = _.chain(balances)
    .orderBy('balance')
    .head()
    .get('balance', 0)
    .value();

  const transferAmount = (maxBalance - maxXemAmount) / (config.nem.xemBonus.xemDivisibility * config.nem.xemBonus.rate) * config.nem.divisibillity;
  if (transferAmount >= 1) {
    const result = await nemServices.makeBonusTransfer(nemAddress, transferAmount, 'Xem Bonus');
    await accountModel.updateMany({nem: nemAddress}, {$set: {maxXemAmount: maxBalance}, $inc: {transferLimit: 1}});
    return result;
  }
  return 1;
};
