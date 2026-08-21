'use client'

// Live readings arrive over the socket as raw MQTT payloads, keyed by
// "timestamp" -- not the "time" column name the REST/DB rows use.
const STALE_MS = 10000

export default function SensorGrid({ sensorIds, readingsBySensor, now, selectedSensor, onSelectSensor }) {
    return (
        <section className="sensor-grid">
            {sensorIds.map((id) => {
                const readings = readingsBySensor[id] || []
                const latest = readings[readings.length - 1]
                const isOnline = latest ? now - new Date(latest.timestamp).getTime() < STALE_MS : false

                return (
                    <button
                        key={id}
                        type="button"
                        className={`sensor-card${id === selectedSensor ? ' selected' : ''}`}
                        onClick={() => onSelectSensor(id)}
                    >
                        <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
                        <span className="sensor-id">{id}</span>
                        <span className="sensor-value">
                            {latest ? `${latest.temperature.toFixed(1)}°C` : 'No data'}
                        </span>
                        <span className="sensor-updated">
                            {latest ? new Date(latest.timestamp).toLocaleTimeString() : '--'}
                        </span>
                    </button>
                )
            })}
        </section>
    )
}
