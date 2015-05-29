var mongoose = require('mongoose');

module.exports = mongoose.model('Client') || require('./model');