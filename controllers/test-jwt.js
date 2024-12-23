const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken') // The JSON web token! 

/* Test route for Javascript Web Token */

/* GET http://localhost:3000/test-jwt/sign-token */

router.get('/sign-token', (req, res) => {
    /* Mock user object added, because no database is here yet */

    // Payload
  const user = {
    _id: 1,
    username: 'CajunSamurai',
    password: 'Password',
  }

  // Create a token using the sign method (Secret Key)
  const token = jwt.sign({ user }, process.env.JWT_SECRET)

  // Send the token back to the client, should be destructured, or it looks dumb on API
  res.json({ token })
})

// Verification token route, should respond with cooresponding user object
/* POST http://localhost:3000/test-jwt/verify-token */

/*  */
router.post('/verify-token', (req, res) => {
    // .split() removes the word "Bearer" from the token response, as well as the space between.
    // This is because the response is technically an array originally

    // Verify method
    try {

        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // Token and ENV secret key as arguements
        res.json({ decoded }) // Sends token

    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' })
    }
})

/* Exported to server.js file */

module.exports = router