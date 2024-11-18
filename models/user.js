const mongoose = require('mongoose')
const Team = require('./team.js') // Importing team schema if we are using ID instead of nesting

// If nesting is used, this shouldn't need an import

const teamSchema = new mongoose.Schema(
    {
        team_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Array of team member IDs, 
        /* owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, */
        // use .populate to fill info for both owner and team members
        // - Jordan
        teamName: {type: String, required: true },
        motto: {type: String, required: true },
        description: {type: String, required: true },
        playingStyle: {type: String, required: true },
        /* totalFantasyPoints: {type: Number } */
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
            // Picture source, https://www.freepik.com/premium-ai-image/dynamic-football-cartoons-bold-minimalist-helmet-clipart-with-thick-outlines_65166547.htm
            default: 'https://img.freepik.com/premium-photo/dynamic-football-cartoons-bold-minimalist-helmet-clipart-with-thick-outlines_983420-23124.jpg'
        },
        /* team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' } */
        /* Alternative method. If this works right, should nest a teamSchema object DIRECTLY into the user schema for easier access. */
        team: teamSchema
        // Only one team allowed per user. But brackets [] would allow user to have multiple teams. 
        // If we want multiple teams, we should decide BEFORE initializing database
        // Otherwise we will need to burn it down and re-initialize
    },
    { timestamps: true }
)

/* Prevents hashed password from being sent back in API responses */

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User