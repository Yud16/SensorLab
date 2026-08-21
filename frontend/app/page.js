'use client'

import { useEffect, useState } from 'react'
import { socket } from '../lib/socket'
import SensorGrid from './components/SensorGrid'
import LiveChart from './components/LiveChart'
import HistoricalView from './components/HistoricalView'

const SENSOR_IDS = ['sensor-01', 'sensor-02', 'sensor-03', 'sensor-04', 'sensor-05']
const MAX_POINTS = 50

export default function Home() {
    const [readingsBySensor, setReadingsBySensor] = useState({})
    const [selectedSensor, setSelectedSensor] = useState(SENSOR_IDS[0])
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        function handleReading(reading) {
            setReadingsBySensor((prev) => {
                const existing = prev[reading.sensorId] || []
                const updated = [...existing, reading].slice(-MAX_POINTS)
                return { ...prev, [reading.sensorId]: updated }
            })
        }

        socket.on('reading', handleReading)
        return () => {
            socket.off('reading', handleReading)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <main className="dashboard">
            <h1>Sensor Dashboard</h1>
            <SensorGrid
                sensorIds={SENSOR_IDS}
                readingsBySensor={readingsBySensor}
                now={now}
                selectedSensor={selectedSensor}
                onSelectSensor={setSelectedSensor}
            />
            <LiveChart
                sensorId={selectedSensor}
                readings={readingsBySensor[selectedSensor] || []}
            />
            <HistoricalView sensorIds={SENSOR_IDS} />
        </main>
    )
}
