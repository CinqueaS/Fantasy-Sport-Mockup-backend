// models/team.js

const teamSchema = new mongoose.Schema(
    {
        /* Array of Objects */
        /* Should populate with copies of each team member as user drafts players */
        /* Alternatively, we can:
        1. make this an array of player IDs, might be easier IDK
        2. Make this have multiple parents in the form of player IDs, similar to #1
        3. Simply make the  */
        /* - Jordan */
        team_members: [{
        type: Object,
        required: false
    }],
        owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
    );


module.exports = mongoose.model('Team', teamSchema);