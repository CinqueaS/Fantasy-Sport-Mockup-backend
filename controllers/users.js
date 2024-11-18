const express = require('express')
const router = express.Router()
// Add bcrypt and the user model
const bcrypt = require('bcrypt') // bcrypt will encrypt passwords for security purposes
const jwt = require('jsonwebtoken') // Web token
const User = require('../models/user.js') // import User model

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
      const foundUsers = await User.find() // Locates and spits out ALL user objects
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
      const foundUser = await User.findById(targetUserID)

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
        }).populate('team_id')

        // Should populate the team information after user is created
        const populatedUser = await User.findById(user._id).populate('team_id')

        // Automatically signs said user in
        const token = jwt.sign(
            { username: user.username, _id: user._id },
            process.env.JWT_SECRET
          )

        res.status(201).json({ populatedUser, token })

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
        const populatedUser = await User.findById(user._id).populate('team_id')

        /* res.status(200).json({ populatedUser, token }) */ //This would include the user's team data I guess
        res.status(200).json({ token })

      } else { // Otherwise, don't let them in
        res.status(401).json({ error: 'Invalid username or password.' })
      }

    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

module.exports = router