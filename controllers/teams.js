const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Team = require('../models/user.js');
const router = express.Router();

// ========== Public Routes ===========

/* Some routes MIGHT need to be moved here, but don't do it until we get errors on front end */

// ========= Protected Routes =========

router.use(verifyToken);

/* I think every route under this will only execute if someone is logged in
If problems arise for guest users, move the relevent path ABOVE verify token into public routes */

// CREATE a new team, automatically sets owner to whoever is logged in

router.post('/', async (req, res) => {
    try {
      req.body.owner_id = req.user._id;
      const team = await Team.create(req.body);
      team._doc.owner_id = req.user;
      res.status(201).json(team);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
});

/* Access ALL teams... if you are logged in */

router.get('/', async (req, res) => {
    try {
        const teams = await Team.find({})
        .populate('owner_id')
        .populate('team_member_ids')
        .sort({ createdAt: 'desc' });
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* Access SPECIFIC team by its own ID */

router.get('/:teamId', async (req, res) => {
    try {
      const team = await Team.findById(req.params.teamId).populate('owner_id').populate('team_member_ids');
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json(error);
    }
});

/* UPDATE a specific team by its ID 
Only works if you are logged in as its owner */

router.put('/:teamId', async (req, res) => {
    try {
      // Find the team:
      const team = await Team.findById(req.params.teamId);
  
      // Check permissions:
      if (!team.owner_id.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      // Update team:
      const updatedTeam = await Team.findByIdAndUpdate(
        req.params.teamId,
        req.body,
        { new: true }
      );
  
      // Append req.user to the owner_id property:
      updatedTeam._doc.owner_id = req.user;
  
      // Issue JSON response:
      res.status(200).json(updatedTeam);
    } catch (error) {
      res.status(500).json(error);
    }
});

/* DELETE a team from the database by its ID 
Only works if you are logged in as its owner */

router.delete('/:teamId', async (req, res) => {
    try {
      const team = await Team.findById(req.params.teamId);
  
      if (!team.owner_id.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      const deletedTeam = await Team.findByIdAndDelete(req.params.teamId);
      res.status(200).json(deletedTeam);
    } catch (error) {
      res.status(500).json(error);
    }
});
  

module.exports = router;

