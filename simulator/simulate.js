const mqtt = require('mqtt')
require('dotenv').config()
const pool = require('../db')


// MQTT connection (matches the broker config used in app.js / docker-compose)
const protocol = 'mqtt'
const host = process.env.MQTT_HOST || 'localhost'
const port = process.env.MQTT_PORT || '1883'
const username = process.env.MQTT_USERNAME || 'emqx'
const password = process.env.MQTT_PASSWORD
const clientId = `simulator_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

const MIN_INTERVAL_MS = 1000
const MAX_INTERVAL_MS = 5000
const SPIKE_PROBABILITY = 0.05

// Per-sensor state that readings wander from, so values look continuous
// instead of independently random on every tick. Populated once the sensor
// ids are fetched from the database, right before publishing starts.
const sensorState = {}

function nextValue(current, drift, min, max) {
    const value = current + (Math.random() - 0.5) * drift
    return Math.min(max, Math.max(min, value))
}

function buildReading(sensorId) {
    const state = sensorState[sensorId]
    const isSpike = Math.random() < SPIKE_PROBABILITY

    state.temperature = nextValue(state.temperature, 0.6, 15, 35)
    state.vibration = nextValue(state.vibration, 0.05, 0, 1)
    state.battery = Math.max(0, state.battery - Math.random() * 0.05)
    if (state.battery <= 0) {
        // simulate a battery swap/recharge
        state.battery = 100 
    }

    let temperature = state.temperature
    let vibration = state.vibration
    if (isSpike) {
        temperature += 10 + Math.random() * 10
        vibration += 1 + Math.random() * 2
    }

    return {
        sensorId,
        timestamp: new Date().toISOString(),
        temperature: Number(temperature.toFixed(2)),
        vibration: Number(vibration.toFixed(3)),
        battery: Number(state.battery.toFixed(1))
    }
}

function scheduleSensor(client, sensorId) {
    const publishAndReschedule = () => {
        const reading = buildReading(sensorId)
        const topic = `sensors/${sensorId}/readings`
        const payload = JSON.stringify(reading)

        client.publish(topic, payload, { qos: 0 }, (err) => {
            if (err) {
                console.error(`[${sensorId}] publish failed:`, err.message)
            } else {
                console.log(`[${sensorId}] ->`, payload)
            }
        })

        const nextDelay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)
        const timer = setTimeout(publishAndReschedule, nextDelay)
        timer.unref()
    }

    publishAndReschedule()
}

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username,
    password,
    reconnectPeriod: 1000,
})

client.on('connect', async () => {
    const { rows } = await pool.query('SELECT id FROM sensors')
    const sensorIds = rows.map((row) => row.id)

    for (const id of sensorIds) {
        sensorState[id] = {
            temperature: 20 + Math.random() * 5,
            vibration: 0.2 + Math.random() * 0.3,
            battery: 80 + Math.random() * 20,
        }
    }

    console.log(`Simulator connected to ${connectUrl}, publishing ${sensorIds.length} sensors`)
    for (const sensorId of sensorIds) {
        scheduleSensor(client, sensorId)
    }
})

client.on('error', (err) => {
    console.error('Connection error:', err.message)
})

client.on('reconnect', () => {
    console.log('Reconnecting to broker...')
})

process.on('SIGINT', () => {
    console.log('\nShutting down simulator...')
    client.end(false, {}, () => process.exit(0))
})
