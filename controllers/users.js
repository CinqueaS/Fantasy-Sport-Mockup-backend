const express = require('express')
const router = express.Router()
// Add bcrypt and the user model
const bcrypt = require('bcrypt') // bcrypt will encrypt passwords for security purposes
const jwt = require('jsonwebtoken') // Web token
const User = require('../models/user') // import User model

// We will salt the password with this many random characters
const SALT_LENGTH = 12


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
        })
        // Automatically signs said user in
        const token = jwt.sign(
            { username: user.username, _id: user._id },
            process.env.JWT_SECRET
          );

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
      const user = await User.findOne({ username: existingUserName });
      // If user exists, AND their entered password matches the hashed password, let them in

      if (user && bcrypt.compareSync(existingUserPassword, user.hashedPassword)) {
        const token = jwt.sign(
            {username: user.username, _id: user._id},
            process.env.JWT_SECRET
        )
        res.status(200).json({ token })

      } else { // Otherwise, don't let them in
        res.status(401).json({ error: 'Invalid username or password.' });
      }

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  })

module.exports = router