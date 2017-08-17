var log = require('logger')('model-clients');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var types = require('validators').types;
var mongins = require('mongins');

var SECRET_LENGTH = 48;

var client = Schema({
    has: {type: Object, default: {}},
    secret: {type: String},
    name: {
        type: String,
        required: true,
        validator: types.string({
            length: 20
        })
    },
    description: {
        type: String,
        validator: types.string({
            length: 1000
        })
    },
    to: {
        type: [String],
        validator: types.array({
            max: 5,
            validator: types.url({
                field: 'to[*]'
            })
        })
    }
}, {collection: 'clients'});

client.plugin(mongins);
client.plugin(mongins.user);
client.plugin(mongins.createdAt);
client.plugin(mongins.updatedAt);

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

module.exports = mongoose.model('clients', client);