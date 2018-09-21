/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */
const _ = require('lodash'),
  accountModel = require('../../models/accountModel');

module.exports = async () => {
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

  const welcomeBonusSets = _.filter(filtered, item => !item.welcomeBonusSent);
  const depositSets = _.filter(filtered, item => !item.maxDepEq);

  return {
    welcomeBonusSets: welcomeBonusSets,
    depositSets: depositSets,
    accounts: accounts
  };
};
