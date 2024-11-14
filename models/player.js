// models/player.js

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    species: {
        type: String,
        required: true
    },
    heightCm: {
        type: Number,
        required: true
    },
    weightKg: {
        type: Number,
        required: true
    },
    isDrafted: {
        type: Boolean,
        required: true
    },
    yards: {
        type: Number,
        required: true
    },
    touchdowns: {
        type: Number,
        required: true
    },
    interceptions: {
        type: Number,
        required: true
    }
});

/* I got this from chatGPT, hope it works, remove and lmk if it does not work pls */

// calculates the value of fantasyPoints based off the yards, touchdowns, and interceptions
playerSchema.virtual('fantasyPoints').get(function() {
    return (this.yards / 10) + (this.touchdowns * 6) - (this.interceptions * 2);
});

module.exports = mongoose.model('Player', playerSchema);
