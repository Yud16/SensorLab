'use client'

import { useState } from 'react'
import { Line } from 'react-chartjs-2'

const RANGES = [
    { label: 'Last 1 minute', value: '1 minute' },
    { label: 'Last 10 minutes', value: '10 minutes' },
    { label: 'Last hour', value: '1 hour' },
    { label: 'Last 24 hours', value: '24 hours' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL
const options = { animation: false, responsive: true }

export default function HistoricalView({ sensorIds }) {
    const [sensorId, setSensorId] = useState(sensorIds[0])
    const [range, setRange] = useState(RANGES[0].value)
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function fetchHistory() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/sensors/${sensorId}/readings?since=${encodeURIComponent(range)}`)
            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`)
            }
            const json = await res.json()
            setRows(json.slice().reverse())
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const data = {
        labels: rows.map((r) => new Date(r.time).toLocaleString()),
        datasets: [
            {
                label: `${sensorId} temperature (°C)`,
                data: rows.map((r) => r.temperature),
                borderColor: '#f97316',
                backgroundColor: '#f97316',
                tension: 0.3,
            },
        ],
    }

    return (
        <section className="historical-view">
            <h2>Historical view</h2>
            <div className="historical-controls">
                <select value={sensorId} onChange={(e) => setSensorId(e.target.value)}>
                    {sensorIds.map((id) => (
                        <option key={id} value={id}>
                            {id}
                        </option>
                    ))}
                </select>
                <select value={range} onChange={(e) => setRange(e.target.value)}>
                    {RANGES.map((r) => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={fetchHistory} disabled={loading}>
                    {loading ? 'Loading...' : 'Load'}
                </button>
            </div>
            {error && <p className="error">{error}</p>}
            {rows.length > 0 && <Line data={data} options={options} />}
        </section>
    )
}
