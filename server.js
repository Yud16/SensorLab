require('dotenv').config()

const http = require('http')
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const mqtt = require('mqtt')
const pool = require('./db')

const app = express()
app.use(cors())

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3001',
    },
})

io.on('connection', (socket) => {
    console.log('Dashboard connected:', socket.id)
    socket.on('disconnect', () => {
        console.log('Dashboard disconnected:', socket.id)
    })
})

// MQTT TCP Connection
const protocol = 'mqtt'
const host = process.env.MQTT_HOST || 'localhost'
const port = process.env.MQTT_PORT || '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true, 
    connectTimeout: 4000,
    username: process.env.MQTT_USERNAME || 'emqx',
    password: process.env.MQTT_PASSWORD || 'public',
    reconnectPeriod: 1000,
})

app.use(function(req, res, next) {
    //publish
    req.mqttPublish = function(topic, message) {
        client.publish(topic, message)
    }
    //subscribe
    req.mqttSubscribe = function(topic, callback) {
        client.subscribe(topic)
        client.on('message', function(receivedTopic, message) {
            if (receivedTopic === topic) {
                callback(message.toString())
            }
    })
}
next()
})

// Subbing to a topic
client.on('connect', async () => {
    console.log('Connected')
    const { rows } = await pool.query('SELECT id FROM sensors')
    for (const { id: sensorId } of rows) {
        client.subscribe(`sensors/${sensorId}/readings`)
    }
})



app.get('/', (req, res) => {
    //req.mqttPublish('test', 'hello mqtt!')
    res.send('MQTT working')
})

client.on('message', async (topic, payload) => {
    let data
    try {
        data = JSON.parse(payload.toString())
    } catch (error) {
        console.error('Error parsing JSON:', error)
        return
    }
    try {
        await pool.query(
            'INSERT INTO sensor_readings ("time", sensor_id, temperature, vibration, battery) VALUES ($1, $2, $3, $4, $5)',
            [data.timestamp, data.sensorId, data.temperature, data.vibration, data.battery]
        )
        console.log('Data inserted into database')
        io.emit('reading', data)
    } catch (error) {
        console.error('Error inserting data into database:', error)
    }
})

client.on('error', (err)=>{
    console.error('Connection error: ', err)
    client.end()
})
client.on('reconnect', (error) => {
  console.error('reconnect failed', error)
})

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const userId = req.header('x-user-id')
        if (userId) {
            req.user = { id: Number(userId) }
        }
        next()
    })
}

const sensorRouter = require('./routes/sensors')

app.use('/sensors', sensorRouter)

httpServer.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})
