var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    user_from: {type: Schema.ObjectId, ref: 'User'},
    user_to: {type: Schema.ObjectId, ref: 'User'},
    text: String,
    time: { type: Date, default: Date.now() }  
});

module.exports = mongoose.model('Message', MessageSchema);