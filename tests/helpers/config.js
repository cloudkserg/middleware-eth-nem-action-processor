/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv').config();

const config = {
    nem_address: process.env.NEM_ADDRESS,
    maxXemAmount: 0,
    currentAmount: process.env.CURRENT_AMOUNT || 0,
    depositMaxAmount: process.env.DEPOSIT_MAX_AMOUNT || 2000000,
    amount: process.env.AMMOUNT_TEST || 1,
    bonusTimes: process.env.BONUS_TIMES || 220
};

module.exports = config;
