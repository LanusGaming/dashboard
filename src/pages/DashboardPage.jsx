import { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { api } from '../api/client'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containers, setContainers] = useState([])

    useEffect(() => {
        const es = new EventSource('/api/containers/stream');

        es.onmessage = (event) => {
            const containerData = JSON.parse(event.data)
            setContainers(prevContainers => (
                containerData.map(container => {
                    const prevContainer = prevContainers.find(prevContainer => container.ContainerId === prevContainer.ContainerId)
                    return {
                        ...container,
                        PrevNetworkRxBytes: prevContainer == null ? container.NetworkRxBytes : prevContainer.NetworkRxBytes,
                        PrevNetworkTxBytes: prevContainer == null ? container.NetworkTxBytes : prevContainer.NetworkTxBytes
                    }
                })
            ))
        }

        es.onerror = () => {
            // for error handling
        }

        return () => es.close()
    }, []);

    return (
        <main className={styles.dashboardPage}>
            <section className={styles.systemStats}>
                <h2>System</h2>
                <div>
                    <div className={styles.metrics}>
                        <header>
                            <h3>CPU</h3>
                            <span>34%</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                    <div className={styles.metrics}>
                        <header>
                            <h3>Memory</h3>
                            <span>61%</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                    <div className={styles.metrics}>
                        <header>
                            <h3>Network</h3>
                            <span>1.2 MB/s</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.containerStats}>
                <h2>Containers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>CPU</th>
                            <th>Memory</th>
                            <th>Network</th>
                            <th>Uptime</th>
                        </tr>
                    </thead>
                    <tbody>
                        {containers.map(c => (
                            <tr key={c.containerId} className={styles.container}>
                                <th>{c.containerName}</th>
                                <th>running</th>
                                <th>{(Math.round(c.cpuPercent * 100.0) / 100.0).toFixed(2)} %</th>
                                <th>{Math.round(c.memoryBytes / 1000000.0)} MB</th>
                                <th>{Math.round(c.networkRxBytes / 8000.0)} KB/s</th>
                                <th>14d 2h</th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    )
}