var log = require('logger')('model-clients');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var SECRET_LENGTH = 48;

var client = Schema({
    name: String,
    description: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    secret: String,
    to: [String],
    has: {type: Object, default: {}},
    allowed: {type: Object, default: {}}
});

client.set('toJSON', {
    getters: true,
    //virtuals: false,
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

client.methods.verify = function (secret) {
    return this.secret === secret;
};

client.methods.refresh = function (cb) {
    var that = this;
    crypto.randomBytes(SECRET_LENGTH, function (err, buf) {
        if (err) {
            log.error(err);
            cb(err);
            return;
        }
        that.secret = buf.toString('hex');
        cb();
    });
};

client.pre('save', function (next) {
    this.refresh(function (err) {
        next(err);
    });
});

client.virtual('id').get(function () {
    return this._id;
});

/*
 user.statics.find = function (options, callback) {
 if (options.email) {
 this.findOne({
 email: email
 }, callback);
 return;
 }
 callback(null);
 };*/

module.exports = mongoose.model('Client', client);