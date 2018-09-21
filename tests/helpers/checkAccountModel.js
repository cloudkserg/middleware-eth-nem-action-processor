/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const accountModel = require('../../models/accountModel'),
    config = require('./config');

module.exports = async (address) => {
    return await accountModel.find({
        address: address
    });
}