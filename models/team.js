const mongoose = require('mongoose')

/* THIS FILE IS OBSOLETE IF NESTING IN user.js WORKS CORRECTLY */

const teamSchema = new mongoose.Schema(
    {
        team_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Array of team member IDs, 
        owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // use .populate to fill info for both owner and team members
        // - Jordan
        teamName: {type: String, required: true },
        motto: {type: String, required: true },
        description: {type: String, required: true },
        playingStyle: {type: String, required: true },
        /* totalFantasyPoints: {type: Number, required: true } */
        // We might calculate this on front end instead
    },
    { timestamps: true }
)

/* I got this from chatGPT, hope it works, remove and lmk if it does not work pls
if it doesn't we calculate fantasy points on the front end */

// Should calculate the value of team's fantasyPoints based off the individual values

/* 
teamSchema.virtual('totalFantasyPoints').get(function() {
    let total = 0
    for (member of this.team_member_ids) {
        total += member.fantasyPoints
    }
    return total
})
 */


/* module.exports = mongoose.model('Team', teamSchema) */