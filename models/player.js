const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gender: { type: String, required: true },
        position: { type: String, required: true },
        species: { type: String, default: "Human" },
        owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

        isDrafted: { type: Boolean, default: false }, // DO NOT provide when making new object, or always make false
        isSupernatural: { type: Boolean, required: true },

        heightCm: { type: Number, required: true },
        weightKg: { type: Number, required: true },

        yards: { type: Number, required: true },
        touchdowns: { type: Number, required: true },
        interceptions: { type: Number, required: true },
        
        fantasyPoints: { type: Number } // Calculated dynamically, do not include when creating or updating a player
    },
    { timestamps: true }
)

// calculates the value of fantasyPoints based off the yards, touchdowns, and interceptions
// Only triggers when doc us created, see controllers/players.js for whenever doc is updated
// I got this from chatGPT, but ironed it out after looking it up on Mongoose database (JJC)

playerSchema.pre("save", function (next) {
    totalPoints = (this.yards / 10) + (this.touchdowns * 6) - (this.interceptions * 2)
    this.fantasyPoints = totalPoints
    next()
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
