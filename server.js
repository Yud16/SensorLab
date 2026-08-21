const express = require('express')
const mqtt = require('mqtt')

const app = express()

// MQTT TCP Connection
const protocol = 'mqtt'
const host = 'localhost'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true, 
    connectTimeout: 4000,
    username: 'emqx',
    password: 'public',
    reconnectPeriod: 1000,
})

// Subbing to a topic
client.on('connect', ()=>{
    console.log('Connected')
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

app.get('/', (req, res) => {
    req.mqttPublish('test', 'hello mqtt!')

    req.mqttSubscribe('test', (message) => {
        console.log('Received message:', message)
    })

    res.send('MQTT working')
})

client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString())
})

client.on('error', (err)=>{
    console.error('Connection error: ', err)
    client.end()
})
client.on('reconnect', (error) => {
  console.error('reconnect failed', error)
})



// app.use(express.static("public"))
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())
// app.set('view engine', 'ejs')



// const userRouter = require('./routes/users')

// app.use('/users', userRouter)

// function logger(req, res, next) {
//     console.log(req.originalUrl)
//     next()
// }

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})
