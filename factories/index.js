/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Bootstrap file for rescursive search for all factories
 * @returns {Object} factories
 */

const requireAll = require('require-all');

module.exports = requireAll({
  dirname     :  __dirname,
  filter      :  /(.+Factory)\.js$/,
  recursive: true
});
