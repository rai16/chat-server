var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, lowercase: true, unique: true, required: true, match: [/^[a-z0-9_-]{3,15}$/, 'is invalid']},
    hash: String,
    salt: String, 
    create_date: {type: Date, required: true, default: Date.now()},
    last_seen: Date
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = (password) => {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
}

UserSchema.methods.setPassword = (password) => {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
}

module.exports = mongoose.model('User', UserSchema);