const express = require('express')
const router = express.Router()
const pool = require('../db')

router.get('/', (req, res) => {
    res.send('Sensor readings list')
})


router.post('/', (req, res) => {
    console.log(req.body.username)
    const isValid = false
    if (isValid) {
        users.push({ firstName: req.body.username })
        res.redirect(`/users/${users.length - 1}`)
    } else {
        console.log("err")
        res.render('users/new', { firstName: req.body.username })
    }
    res.send(
        "Hi"
    )
})

router.route("/:id/readings")
.get(async (req, res) => {
    console.log(req.user)
    try {
        const timeSince = req.query.since || null
        const result = await pool.query(
            'SELECT * FROM sensor_readings WHERE sensor_id = $1 AND time > Now() - $2::INTERVAL ORDER BY time DESC',
            [req.params.id, timeSince || '1 day']
        )
        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching sensor readings:', error)
        res.status(500).send('Error fetching sensor readings')
    }
})
.put((req, res) => {
    res.send(`Sensor readings update ${req.params.id}`)
})
.delete((req, res) => {
    res.send(`Sensor readings delete ${req.params.id}`)
})

module.exports = router