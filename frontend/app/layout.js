import './globals.css'

export const metadata = {
    title: 'Sensor Dashboard',
    description: 'Real-time sensor monitoring dashboard',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
