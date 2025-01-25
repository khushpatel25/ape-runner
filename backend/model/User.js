const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    userName: {type:String, required: true, unique: true},
    currentScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    password: { type: String, required: true },
    firstTimeLogging: {type: Boolean, default: true}
});

module.exports = mongoose.model("User", UserSchema);
