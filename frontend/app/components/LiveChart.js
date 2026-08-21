'use client'

import { Line } from 'react-chartjs-2'
import {
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const options = { animation: false, responsive: true }

export default function LiveChart({ sensorId, readings }) {
    const data = {
        labels: readings.map((r) => new Date(r.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: `${sensorId} temperature (°C)`,
                data: readings.map((r) => r.temperature),
                borderColor: '#38bdf8',
                backgroundColor: '#38bdf8',
                tension: 0.3,
            },
        ],
    }

    return (
        <section className="live-chart">
            <h2>Live: {sensorId}</h2>
            {readings.length === 0 ? <p>Waiting for data...</p> : <Line data={data} options={options} />}
        </section>
    )
}
