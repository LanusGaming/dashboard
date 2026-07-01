import { useEffect, useState } from 'react'
import DashboardSystemMetrics from "../components/DashboardSystemMetrics"
import DashboardContainerMetrics from "../components/DashboardContainerMetrics"
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containerSummarySnapshots, setContainerSummarySnapshots] = useState([])

    useEffect(() => {
        const es = new EventSource('/api/containers/stream');

        es.onmessage = (event) => {
            const containerSummaries = JSON.parse(event.data)
            setContainerSummarySnapshots(prevContainerSummarySnapshots => {
                const lastSnapshot = prevContainerSummarySnapshots.at(-1)

                const newSnapshot = containerSummaries.map(containerSummary => {
                    const prevContainerSummary = lastSnapshot?.find(summary => summary.ContainerId === containerSummary.ContainerId)
                    if (!prevContainerSummary)
                        return { ...containerSummary, NetworkRxBytesPerSecond: 0, NetworkTxBytesPerSecond: 0 }

                    const secondsSinceLastSummary =
                        (new Date(containerSummary.RecordedAt).getTime() - new Date(prevContainerSummary.RecordedAt).getTime()) / 1000.0

                    if (secondsSinceLastSummary <= 0)
                        return { ...containerSummary, NetworkRxBytesPerSecond: 0, NetworkTxBytesPerSecond: 0 }

                    // Byte counters reset when a container restarts, so a negative delta means "no traffic" rather than a real rate.
                    const rxDelta = Math.max(0, containerSummary.NetworkRxBytes - prevContainerSummary.NetworkRxBytes)
                    const txDelta = Math.max(0, containerSummary.NetworkTxBytes - prevContainerSummary.NetworkTxBytes)

                    return {
                        ...containerSummary,
                        NetworkRxBytesPerSecond: rxDelta / secondsSinceLastSummary,
                        NetworkTxBytesPerSecond: txDelta / secondsSinceLastSummary,
                    }
                })

                return [...prevContainerSummarySnapshots, newSnapshot].slice(-11)
            })
        }

        es.onerror = (event) => { console.log(event) }

        return () => es.close()
    }, []);

    return (
        <main className={styles.dashboardPage}>
            <DashboardSystemMetrics containerSnapshots={containerSummarySnapshots} />
            <DashboardContainerMetrics containerSummaries={containerSummarySnapshots.at(-1)} />
        </main>
    )
}