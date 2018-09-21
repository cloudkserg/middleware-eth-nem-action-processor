'use strict';

const mongoose = require('mongoose'),
  messages = require('../../../factories/messages/addressMessageFactory');

require('mongoose-long')(mongoose);

const SetHash = new mongoose.Schema({
    self: {
        type: String,
        unique: true,
        required: true,
        validate: [a=>  /^(0x)?[0-9a-fA-F]{40}$/.test(a), messages.wrongAddress]
    },
    key: {
        type: String,
        unique: true,
        required: true,
        validate: [a=>  /^(0x)?[0-9a-fA-F]{40}$/.test(a), messages.wrongAddress]
    },
    oldHash: {type: String, unique: true, index: true},
    newHash: {type: String, unique: true, index: true},
    controleIndexHash: {type: String, unique: true, index: true},
    network: {type: String},
    created: {type: Date, required: true, default: Date.now},
    __v: {type: Number, unique: true, index: true}
})

module.exports = mongoose.model('Sethash', SetHash);