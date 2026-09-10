const express = require('express')
const router = express.Router()
const { checkPermission } = require('./checkPermission')
const pool = require('../db')

router.route('/')
    .get(checkPermission('view_sensors'), async (req, res) => {
        try {
            const sensors = await pool.query('SELECT * FROM sensors')
            res.json(sensors.rows)
        } catch (error) {
            console.error('Error fetching sensors:', error)
            res.status(500).send('Error fetching sensors')
        }
    })
    
// router.route('/:id')
//     .get(checkPermission('view_sensor'), async (req, res) => {
//         try {
//             const sensor = await pool.query('SELECT * FROM sensors WHERE id = $1', [req.params.id])
//             if (sensor.rows.length === 0) {
//                 return res.status(404).send('Sensor not found')
//             }
//             res.json(sensor.rows[0])
//         }
//         catch (error) {
//             console.error('Error fetching sensor:', error)
//             res.status(500).send('Error fetching sensor')
//         }
//     })


//     .post(checkPermission('create_sensor'), async (req, res) => {
//         try {
//             const result = await pool.query(
//                 'INSERT INTO sensors (id) VALUES ($1) RETURNING *',
//                 [req.params.id]
//             )
//             res.status(201).json(result.rows[0])
//         } catch (error) {
//             console.error('Error creating sensor:', error)
//             res.status(500).send('Error creating sensor')
//         }
//     })
//     .delete(checkPermission('delete_sensor'), async (req, res) => {
//         try {
//             await pool.query('DELETE FROM sensors WHERE id = $1', [req.params.id])
//             res.status(200).send('Sensor deleted')
//         } catch (error) {
//             console.error('Error deleting sensor:', error)
//             res.status(500).send('Error deleting sensor')
//         }
//     })

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
// .put(checkPermission('update_sensor_readings'), async (req, res) => {
//     res.send(`Sensor readings update ${req.params.id}`)
// })
// .delete(checkPermission('delete_sensor_readings'), async (req, res) => {
//     res.send(`Sensor readings delete ${req.params.id}`)
// })

module.exports = router