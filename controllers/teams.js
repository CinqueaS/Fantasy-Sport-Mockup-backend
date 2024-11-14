// controllers/teams.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Team = require('../models/team.js');
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);

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

router.get('/', async (req, res) => {
    try {
        const teams = await Team.find({})
        .populate('owner_id')
        .sort({ createdAt: 'desc' });
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json(error);
    }
});

// controllers/teams.js

router.get('/:teamId', async (req, res) => {
    try {
      const team = await Team.findById(req.params.teamId).populate('owner_id');
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json(error);
    }
});

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

