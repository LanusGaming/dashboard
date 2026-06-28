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
                        PrevNetworkTxBytes: prevContainer == null ? container.NetworkTxBytes : prevContainer.NetworkTxBytes,
                        RecordedAt: new Date(container.RecordedAt),
                        MillisSinceLastUpdate: prevContainer == null ? Number.MAX_VALUE : new Date(container.RecordedAt) - prevContainer.RecordedAt,
                    }
                })
            ))
        }

        es.onerror = () => {
            // for error handling
        }

        return () => es.close()
    }, []);

    function formatCpuPercent(cpuPercent) {
        return `${(Math.round(cpuPercent * 100.0) / 100.0).toFixed(2)}%`
    }

    function formatMemoryBytes(memoryBytes) {
        const memoryGB = memoryBytes / 1000000000.0
        return memoryGB >= 1.0 ? `${(memoryGB).toFixed(2)}GB` : `${Math.round(memoryGB * 1000)}MB`
    }

    function formatNetworkBytes(networkBytes) {
        const networkMB = networkBytes / 1000000.0
        return networkMB >= 1.0
            ? `${(networkMB).toFixed(2)}MB/s`
            : networkMB * 1000 >= 1.0
                ? `${Math.round(networkMB * 1000)}KB/s`
                : `${Math.round(networkBytes)} B/s`
    }

    function formatUptimeSeconds(uptimeSeconds) {
        const formats = [{ unit: "secs", max: 60 }, { unit: "mins", max: 60 }, { unit: "hrs", max: 24 }, { unit: "days", max: 30 }, { unit: "months", max: 12 }, { unit: "years", max: 1 }]

        let uptime = uptimeSeconds
        for (const format of formats) {
            if (uptime < format.max)
                return Math.floor(uptime) + format.unit
            else
                uptime /= format.max
        }

        return Math.floor(uptime) + formats[-1].unit
    }

    const statusClasses = {
        running: styles.running,
        exited: styles.exited,
        paused: styles.paused,
        restarting: styles.restarting,
    };

    const systemCpu = formatCpuPercent(containers.reduce((sum, c) => sum + c.CpuPercent, 0.0))
    const systemMemory = formatMemoryBytes(containers.reduce((sum, c) => sum + c.MemoryBytes, 0))
    const systemNetworkRx = formatNetworkBytes(containers.reduce((sum, c) => sum + (c.NetworkRxBytes - c.PrevNetworkRxBytes) / c.MillisSinceLastUpdate * 1000, 0))

    return (
        <main className={styles.dashboardPage}>
            <section className={styles.systemStats}>
                <h2>System</h2>
                <div>
                    <div className={styles.metrics}>
                        <header>
                            <h3>CPU</h3>
                            <span>{systemCpu}</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                    <div className={styles.metrics}>
                        <header>
                            <h3>Memory</h3>
                            <span>{systemMemory}</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                    <div className={styles.metrics}>
                        <header>
                            <h3>Network</h3>
                            <span>{systemNetworkRx}</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.containerStats}>
                <h2>Containers</h2>
                <div>
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
                                <tr key={c.ContainerId} className={styles.container}>
                                    <th>{c.ContainerName}</th>
                                    <th><span className={[styles.statusIndicator, statusClasses[c.Status] ?? styles.unknown].join(' ')}>{c.Status}</span></th>
                                    <th>{formatCpuPercent(c.CpuPercent)}</th>
                                    <th>{formatMemoryBytes(c.MemoryBytes)}</th>
                                    <th>{formatNetworkBytes((c.NetworkRxBytes - c.PrevNetworkRxBytes) / c.MillisSinceLastUpdate * 1000)} | {formatNetworkBytes((c.NetworkTxBytes - c.PrevNetworkTxBytes) / c.MillisSinceLastUpdate * 1000)}</th>
                                    <th>{formatUptimeSeconds(c.UptimeSeconds)}</th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}