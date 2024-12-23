const mongoose = require('mongoose')

// If nesting is used, this shouldn't need an import

const teamSchema = new mongoose.Schema(
    {
        team_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Array of team member IDs, 
        // use .populate to fill info for both owner and team members
        // - Jordan
        teamName: {type: String, required: true },
        motto: {type: String, required: true },
        description: {type: String, required: false },
        playingStyle: {type: String, required: true },
        totalFantasyPoints: {type: Number, default: 0} 
        // We might calculate this on front end instead
    },
    { timestamps: true }
)

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        hashedPassword: {
            type: String,
            required: true
        },
        profilePicUrl: {
            type: String,
            default: 'https://img.freepik.com/premium-photo/dynamic-football-cartoons-bold-minimalist-helmet-clipart-with-thick-outlines_983420-23124.jpg'
        },
        /* Nests a teamSchema object DIRECTLY into the user schema for easier access. */
        team: teamSchema
        // Only one team allowed per user. But brackets [] would allow user to have multiple teams. 
        // If we want multiple teams, we should decide BEFORE initializing database
        // Otherwise we will need to burn it down and re-initialize, then refactor users.js again
    },
    { timestamps: true }
)

/* Prevents hashed password from being sent back in API responses */

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword
    }
})

/* I got this from chatGPT, hope it works, remove and lmk if it does not work pls
if it doesn't we calculate fantasy points on the front end */

// Should calculate the value of team's fantasyPoints based off the individual values


const User = mongoose.model('User', userSchema)

module.exports = User