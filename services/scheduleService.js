/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Ping IPFS by specified time in config
 * @module services/scheduleService
 * @see module:config
 */

const schedule = require('node-schedule'),
  accountModel = require('../models/accountModel'),
  _ = require('lodash'),
  bunyan = require('bunyan'),
  config = require('../config'),
  Promise = require('bluebird'),
  welcomeBonusAction = require('./actions/welcomeBonusAction'),
  timeBonusAction = require('./actions/timeBonusAction'),
  xemBonusAction = require('./actions/xemBonusAction'),
  log = bunyan.createLogger({name: 'plugins.nem_action_processor.scheduleService'});

module.exports = () => {

  let isPending = false;

  schedule.scheduleJob(config.schedule.job, async () => {

    if (isPending)
      return log.info('still sending bonuses...');

    isPending = true;
    log.info('sending bonuses...');
    const accounts = await accountModel.find({nem: {$ne: null}});
    const filtered = await accountModel.aggregate([
      {
        $lookup: {
          from: 'sethashes',
          localField: 'address',
          foreignField: 'key',
          as: 'sethash'
        }
      },
      {
        $lookup: {
          from: 'deposits',
          localField: 'address',
          foreignField: 'who',
          as: 'deposit'
        }
      },
      {
        $project: {
          address: '$address',
          nem: '$nem',
          deposit: '$deposit',
          deposit_count: {$size: '$deposit'},
          sethash: '$sethash',
          sethash_count: {$size: '$sethash'},
          transferLimit: '$transferLimit',
          welcomeBonusSent: '$welcomeBonusSent',
          maxTimeDeposit: '$maxTimeDeposit',
          maxFoundDeposit: {$max: '$deposit.amount'},
          maxDepEq: {
            $lte: [
              {$ifNull: [{$max: '$deposit.amount'}, 0]},
              {$ifNull: [{$max: '$maxTimeDeposit'}, 0]}
            ]
          }
        }
      },
      {
        $match: {
          $or: [
            {sethash_count: {$gt: 0}, welcomeBonusSent: {$ne: true}},
            {deposit_count: {$gt: 0}, maxDepEq: false}
          ]
        }
      }
    ]);

    const welcomeBonusSets = _.filter(filtered, item => !item.welcomeBonusSent && (item.transferLimit || 0) < config.nem.transferLimit);
    const depositSets = _.filter(filtered, item => !item.maxDepEq && (item.transferLimit || 0) < config.nem.transferLimit);
    const xemSets = _.uniqBy(accounts, 'nem').filter(item => (item.transferLimit || 0) < config.nem.transferLimit);

    let welcomeBonusResult,
      depositBonusResult,
      xemBonusResult;

    if (config.bonusSwitch.welcomeBonus)
      welcomeBonusResult = await Promise.mapSeries(welcomeBonusSets, async set => {
        return await welcomeBonusAction(set.address, config.nem.welcomeBonus.amount, set.nem).catch(e => log.error(e));
      });

    if (config.bonusSwitch.timeBonus)
      depositBonusResult = await Promise.mapSeries(depositSets, async set => {
        return await timeBonusAction(set.address, set.maxTimeDeposit, set.maxFoundDeposit, set.nem).catch(e => log.error(e));
      });

    if (config.bonusSwitch.xemBonus)
      xemBonusResult = await Promise.mapSeries(xemSets, async set => {
        return await xemBonusAction(set.nem, set.maxXemAmount).catch(e => log.error(e));
      });

    if (_.compact(welcomeBonusResult).length !== welcomeBonusSets.length ||
      _.compact(depositBonusResult).length !== depositSets.length ||
      _.compact(xemBonusResult).length !== xemSets.length)
      log.info('some of bonues hasn\'t been processed!');
    else
      log.info('bonuses has been sent!');

    isPending = false;

  });

};
