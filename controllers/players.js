const Player = require('../models/player.js')
const express = require('express')
const router = express.Router()

/* write out controller functions here */

/* The index-slash ('/') is being used because we are ALREADY inside of '/players' */

/* Not using JWT token, so no auth required to create player object */

// CREATE - POST - /players
// Creates a new player object for the API

router.post('/', async (req, res) => {
    // res.json({ message: 'Create route'})
    let newPlayerObject = req.body
    try {
        // Create a new player with the data from req.body
        const createdPlayer = await Player.create(newPlayerObject)
        res.status(201).json(createdPlayer) // 201 Created
    } catch (error) { // Error handling
        res.status(500).json({ error: error.message })
    }
})

// READ - GET - /players
// Reads the contents of the route. a GET route
router.get('/', async (req, res) => {
    // res.json({ message: 'Index route'})
    try {
        const foundPlayers = await Player.find().populate('owner_id') // Locates and spits out ALL player objects
        res.status(200).json(foundPlayers)
    } catch (error) {
        res.status(500).json({ error: error.message }) // 500 Internal Server Error
    }
})

// READ - GET - /players/:playerId
// SHOW route, shows a specific player
router.get('/:playerId', async (req, res) => {
    
    let targetPlayerID = req.params.playerId

    try {
        // Add query to find a single player
        const foundPlayer = await Player.findById(targetPlayerID).populate('owner_id')

        // If no player, show an error
        if (!foundPlayer) {
            res.status(404)
            throw new Error(`Player with ID of ${targetPlayerID} not found, therefore, cannot be shown`)
          }
        res.status(200).json(foundPlayer) // 200 OK

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

// DELETE - DELETE - /players/:playerId
// Deletes the given player by targetting its ID
router.delete('/:playerId', async (req, res) => {

    let targetPlayerID = req.params.playerId

    try {
        // Add query to find a single player
        const deletionTargetPlayer = await Player.findByIdAndDelete(targetPlayerID)

        // If no player, show an error
        if (!deletionTargetPlayer) {
            res.status(404)
            throw new Error(`Player with ID of ${targetPlayerID} not found, therefore, cannot be deleted`)
          }
        res.status(200).json(`${deletionTargetPlayer.name} (ID of ${targetPlayerID}) has been DELETED`) // 200 OK

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

// UPDATE - PUT - /players/:playerId
// Updates the information of an existing player
router.put('/:playerId', async (req, res) => {

    let targetPlayerID = req.params.playerId
    let newPlayerData = req.body

    try {
        // Add { new: true } as the third argument, to reload the updated player object
        const foundPlayer = await Player.findByIdAndUpdate(targetPlayerID, newPlayerData, { new: true, })
        if (!foundPlayer) {
            res.status(404)
            throw new Error(`Player with ID of ${targetPlayerID} not found, therefore, cannot be UPDATED`)
        }

        // Recalculates fantasy points if any of the score values are updated
        updatedPlayer = await updateFantasyPoints(foundPlayer, newPlayerData)
        res.status(200).json(updatedPlayer)


    } catch (error) {
        // Add code for errors
        if (res.statusCode === 404) {
            res.json({ error: error.message })
        } else {
            res.status(500).json({ error: error.message })
        }
    }
})



async function updateFantasyPoints(foundPlayer, newPlayerData) {

    // if the yards, touchdowns, or interceptions were updated, will recalculate fantasyPoints
    foundPlayer.yards = newPlayerData.yards || foundPlayer.yards 
    foundPlayer.touchdowns = newPlayerData.touchdowns || foundPlayer.touchdowns
    foundPlayer.interceptions = newPlayerData.interceptions || foundPlayer.interceptions

    totalPoints = (foundPlayer.yards / 10) + (foundPlayer.touchdowns * 6) - (foundPlayer.interceptions * 2)
    foundPlayer.fantasyPoints = totalPoints
    // Saves again to update fantasyPoints
    // Must rename player variable
    const updatedPlayer = await foundPlayer.save()
    return updatedPlayer
}


// Export the router at the bottom of the file
module.exports = router