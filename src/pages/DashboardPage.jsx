import { useEffect, useState } from 'react'
import { api } from '../api/client'
import DashboardSystemMetrics from "../components/DashboardSystemMetrics"
import DashboardContainerMetrics from "../components/DashboardContainerMetrics"
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containers, setContainers] = useState([])

    useEffect(() => {
        const es = new EventSource('/api/containers/stream');

        es.onmessage = (event) => {
            const containerData = JSON.parse(event.data)
            setContainers(prevContainers => {
                const lastSnapshot = prevContainers[prevContainers.length - 1]

                const newSnapshot = containerData.map(container => {
                    const prevContainer = lastSnapshot?.find(pc => pc.ContainerId === container.ContainerId)
                    if (!prevContainer)
                        return { ...container, NetworkRxBytesPerSecond: 0, NetworkTxBytesPerSecond: 0 }

                    const secondsSinceLastUpdate =
                        (new Date(container.RecordedAt).getTime() - new Date(prevContainer.RecordedAt).getTime()) / 1000.0

                    return {
                        ...container,
                        NetworkRxBytesPerSecond: (container.NetworkRxBytes - prevContainer.NetworkRxBytes) / secondsSinceLastUpdate,
                        NetworkTxBytesPerSecond: (container.NetworkTxBytes - prevContainer.NetworkTxBytes) / secondsSinceLastUpdate,
                    }
                })

                return [...prevContainers, newSnapshot].slice(-11)
            })
        }

        es.onerror = (event) => { console.log(event) }

        return () => es.close()
    }, []);

    return (
        <main className={styles.dashboardPage}>
            <DashboardSystemMetrics containers={containers.at(-1)} />
            <DashboardContainerMetrics containers={containers.at(-1)} />
        </main>
    )
}