const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')

/* Importing JWT, user, and profiles routes */
const testJWTRouter = require('./controllers/test-jwt')
const usersRouter = require('./controllers/users')
const profilesRouter = require('./controllers/profiles')
const playersRouter = require('./controllers/players.js')

const PORT = process.env.PORT ? process.env.PORT : 3000 

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

app.use(express.json())
app.use(cors())

// Inserting JWT, users, and profiles routes

// GET http://localhost:3000/test-jwt
// GET http://localhost:3000/users
// GET http://localhost:3000/profiles/:userId
app.get('/', (req, res) => {
  res.send(`This is the sportsball backend... You shouldn't be here!`)
})
app.use('/test-jwt', testJWTRouter)
app.use('/users', usersRouter)
app.use('/profiles', profilesRouter)
app.use('/players', playersRouter)

app.listen(PORT, () => {
    console.log('The express app is ready!')
})
