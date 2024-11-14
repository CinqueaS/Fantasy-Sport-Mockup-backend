// models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    /* If this works right, should nest a teamSchema object DIRECTLY into the user schema for easier access. If not, just remove. */
    team: [teamSchema]
});

/* Prevents any part of schema (password) from being sent back in API responses */

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword;
    }
});

module.exports = mongoose.model('User', userSchema);
