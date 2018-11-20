var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, unique: true, required: true},
    name: String,
    create_date: {type: Date, required: true, default: Date.now()},
    is_active: Boolean,
    last_seen: Date
});

module.exports = mongoose.model('User', UserSchema);