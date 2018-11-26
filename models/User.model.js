var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, lowercase: true, unique: true, required: true, match: [/^[a-z0-9_-]{3,15}$/, 'is invalid']},
    hash: {type: String, required: true},
    salt: {type: String, required: true}, 
    create_date: {type: Date, required: true, default: Date.now()},
    last_seen: Date
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

module.exports = mongoose.model('User', UserSchema);