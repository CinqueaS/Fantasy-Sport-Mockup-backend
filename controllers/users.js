const express = require('express')
const router = express.Router() 
const verifyToken = require('../middleware/verify-token.js') // Protecting team creation and deletion paths
// Add bcrypt and the user model
const bcrypt = require('bcrypt') // bcrypt will encrypt passwords for security purposes
const jwt = require('jsonwebtoken') // Web token
const User = require('../models/user.js') // import User model
const Player = require('../models/player.js') // import Player model

// We will salt the password with this many random characters
const SALT_LENGTH = 12


/* ================= PUBLIC INFO ROUTES ===================== */

/* GET  and SHOW routes for users, to make API calls in relation to teams and public info easier 
http://localhost:3000/users
http://localhost:3000/users/:userId */

// READ - GET - /users
// Reads the contents of the route. a GET route
router.get('/', async (req, res) => {
  try {
      const foundUsers = await User.find().populate('team.team_member_ids') // Locates and spits out ALL user objects
      /* Populates each individual team member into an array  */
      res.status(200).json(foundUsers)
  } catch (error) {
      res.status(500).json({ error: error.message }) // 500 Internal Server Error
  }
})

// READ - GET - /users/:userId
// SHOW route, shows a specific user
router.get('/:userId', async (req, res) => {
  let targetUserID = req.params.userId

  try {
      // Add query to find a single user
      const foundUser = await User.findById(targetUserID).populate('team.team_member_ids')

      // If no user, show an error
      if (!foundUser) {
          res.status(404)
          throw new Error(`User with ID of ${targetUserID} not found, therefore, cannot be shown`)
        }
      res.status(200).json(foundUser) // 200 OK

    } catch (error) {
      // Add error handling code for 404 errors
      if (res.statusCode === 404) {
          res.json({ error: error.message })
        } else {
          // Add else statement to handle all other errors
          res.status(500).json({ error: error.message })
        }
    }
})


/* =========== SIGN IN AND SIGN UP ROUTES ================== */

/* User sign up route, creates user object */
/* POST http://localhost:3000/users/signup */

router.post('/signup', async (req, res) => {
    const newUserName = req.body.username
    const newUserPassword = req.body.password
    try {
        // First checks if a username is already taken 
        const userInDatabase = await User.findOne({ username: newUserName })
        if (userInDatabase) {
            return res.status(400).json({error:'Username already taken.'})
        }

        // Create a new user w/ hashed password
        const user = await User.create({
            username: newUserName,
            hashedPassword: bcrypt.hashSync(newUserPassword, SALT_LENGTH)
        })/* .populate('team_id') */

        // Should populate the team information after user is created
        /* const populatedUser = await User.findById(user._id).populate('team_id') */

        // Automatically signs said user in
        const token = jwt.sign(
            { username: user.username, _id: user._id },
            process.env.JWT_SECRET
          )

        res.status(201).json({ user, token })

    } catch (error) { // error handling
        res.status(400).json({ error: error.message })
    }
})

/* User sign in route, logs into existing user object */
/* POST http://localhost:3000/users/signin */

router.post('/signin', async (req, res) => {
    const existingUserName = req.body.username
    const existingUserPassword = req.body.password

    try {
      const user = await User.findOne({ username: existingUserName })
      // If user exists, AND their entered password matches the hashed password, let them in

      if (user && bcrypt.compareSync(existingUserPassword, user.hashedPassword)) {
        const token = jwt.sign(
            {username: user.username, _id: user._id},
            process.env.JWT_SECRET
        )

        // Populate the team field on sign-in
        // IDK where to attach this - JJC
        /* const populatedUser = await User.findById(user._id).populate('team_id') */

        /* res.status(200).json({ populatedUser, token }) */ //This would include the user's team data I guess
        res.status(200).json({ token })

      } else { // Otherwise, don't let them in
        res.status(401).json({ error: 'Invalid username or password.' })
      }

    } catch (error) {
      res.status(400).json({ error: error.message })
    }
})


/* ============= TEAM ROUTES =================== */

router.use(verifyToken)

/* If we are nesting teamSchema into the user without ID, these routes will allow creation, update, and deletion of teams */

/* POSTS a team object inside of a user! Anyone with any account can do this! */

// THIS IS FUNCTIONAL

router.post('/:userId/teams', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    const result = await preventCrossProfileModification(res, req.user, user, `create a team`)
    if (result) return result

    user.team = req.body
    await user.save()

    // Find the newly created team:
    const newTeam = user.team

    // Respond with the newTeam:
    res.status(201).json(newTeam)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* UPDATE a team within a user by it's own id
ANYONE can do this as it stands */

// THIS IS FUNCTIONAL

router.put('/:userId/teams/:teamId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    const result = await preventCrossProfileModification(res, req.user, user, `update a team`)
    if (result) return result

    const team = user.team

    team.teamName = req.body.teamName || team.teamName
    team.motto = req.body.motto || team.motto
    team.description = req.body.description || team.description
    team.playingStyle = req.body.playingStyle || team.playingStyle

    await user.save()
    res.status(200).json({ message: `Updated ${user.username}'s team!` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* ADD a team member to the user's team array */

router.put('/:userId/teams/:teamId/addplayer/:playerId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    const result = await preventCrossProfileModification(res, req.user, user, `add a player`)
    if (result) return result


    const player = await Player.findById(req.params.playerId)
    const team = user.team

    team.teamName = req.body.teamName || team.teamName
    team.motto = req.body.motto || team.motto
    team.description = req.body.description || team.description
    team.playingStyle = req.body.playingStyle || team.playingStyle
   
    if (player) {
      player.owner_id = req.params.userId
      team.team_member_ids.push(req.params.playerId)
      player.isDrafted = true
      team.totalFantasyPoints = await updateFantasyPoints(team)
      }
    await user.save()
    await player.save()
      
    res.status(200).json({ message: `Added ${player.name} to ${user.username}'s team!` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* And this will remove a player */

router.put('/:userId/teams/:teamId/removeplayer/:playerId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    
    const result = await preventCrossProfileModification(res, req.user, user, `remove a player`)
    if (result) return result


    const player = await Player.findById(req.params.playerId)
    const team = user.team

    /* team.team_member_ids.remove({ _id: req.params.playerId }) */

    if (player) {
      player.isDrafted = false
      player.owner_id = null
      team.team_member_ids.remove({ _id: req.params.playerId })
      team.totalFantasyPoints = await updateFantasyPoints(team)
    }

    await user.save()
    await player.save()

    res.status(200).json({ message: `Removed ${player.name} to ${user.username}'s team!` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* DELETE a team within a user by it's own id. By removing it from the team array
ANYONE can do this as it stands */

router.delete('/:userId/teams/:teamId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    const result = await preventCrossProfileModification(res, req.user, user, `delete a team`)
    if (result) return result

    const players = await Player.find({ owner_id: req.params.userId })

    for (player of players) {
      player.isDrafted = false
      player.owner_id = null
      await player.save()
    }

    user.team.deleteOne({ _id: req.params.teamId })

    await user.save()

    res.status(200).json({ message: `Deleted ${user.username}'s team!` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

async function updateFantasyPoints(foundTeam) {
  let sum = 0
  const teamMemberIds = foundTeam.team_member_ids

  for (teamMemberId of teamMemberIds) {
    player = await Player.findById(teamMemberId)
    points = player.fantasyPoints
    sum += points
    console.log(player)
    console.log(typeof player.fantasyPoints)
  }

  return sum
}

async function preventCrossProfileModification(res, loggedUser, victimUser, action) {
  if (!victimUser._id.equals(loggedUser._id)) {
    return res.status(403).send(`Stop! ${loggedUser.username}! You have violated the law! You are on ${victimUser.username}'s profile! You are not allowed to ${action} for ${victimUser.username}! Please shove off, ${loggedUser.username}!`)
  }
}

module.exports = router