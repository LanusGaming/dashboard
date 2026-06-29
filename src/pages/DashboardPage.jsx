import { useEffect, useState } from 'react'
import { Download, Upload, ArrowDownAZ, ArrowDownZA, ArrowDown10, ArrowDown01, ArrowDownUp, ArrowDownWideNarrow, ArrowDownNarrowWide } from 'lucide-react'
import { api } from '../api/client'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containers, setContainers] = useState([])
    const [sortMetric, setSortMetric] = useState({ value: "status", asc: true })
    const [sortAlphabeticallyAscending, setSortAlphabeticallyAscending] = useState(true)

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

    function flipSortMetric(metric, defaultAscending) {
        if (sortMetric.value === metric)
            setSortMetric(prev => ({ value: metric, asc: !prev.asc }))
        else
            setSortMetric({ value: metric, asc: defaultAscending })
    }

    function sortContainers() {
        function compareStatus(a, b) {
            if (a === b)
                return 0

            const statuses = ["created", "restarting", "removing", "running", "paused", "exited", "dead"]

            for (const status of statuses) {
                if (a === status)
                    return -1
                if (b === status)
                    return 1
            }

            return 0
        }

        return [...containers].sort((a, b) => {
            let statusEquality = compareStatus(a.Status, b.Status) * (sortMetric.value === "status" && !sortMetric.asc ? -1 : 1)

            if (statusEquality !== 0) return statusEquality

            let equality = 0
            switch (sortMetric.value) {
                case "cpu":
                    equality = a.CpuPercent - b.CpuPercent
                    break;
                case "memory":
                    equality = a.MemoryBytes - b.MemoryBytes
                    break;
                case "networkRx":
                    equality = (a.NetworkRxBytes - a.PrevNetworkRxBytes) - (b.NetworkRxBytes - b.PrevNetworkRxBytes)
                    break;
                case "networkTx":
                    equality = (a.NetworkTxBytes - a.PrevNetworkTxBytes) - (b.NetworkTxBytes - b.PrevNetworkTxBytes)
                    break;
                case "uptime":
                    equality = a.UptimeSeconds - b.UptimeSeconds
                    break;
            }

            if (equality !== 0) return equality * (sortMetric.asc ? 1 : -1)
            return a.ContainerName.localeCompare(b.ContainerName) * (sortAlphabeticallyAscending ? 1 : -1)
        })
    }

    function formatMetric(value, unit) {
        return <span>
            {value}
            <span className={styles.unit}>{unit}</span>
        </span>
    }

    function formatCpuPercent(cpuPercent) {
        return formatMetric((Math.round(cpuPercent * 100.0) / 100.0).toFixed(2), '%')
    }

    function formatMemoryBytes(memoryBytes) {
        const memoryGB = memoryBytes / 1000000000.0
        return memoryGB >= 1.0
            ? formatMetric((memoryGB).toFixed(2), 'GB')
            : formatMetric(Math.round(memoryGB * 1000), 'MB')
    }

    function formatNetworkBytes(networkBytes) {
        const networkMB = networkBytes / 1000000.0
        return networkMB >= 1.0
            ? formatMetric((networkMB).toFixed(2), 'MB/s')
            : networkMB * 1000 >= 1.0
                ? formatMetric(Math.round(networkMB * 1000), 'KB/s')
                : formatMetric(Math.round(networkBytes), 'B/s')
    }

    function formatUptimeSeconds(uptimeSeconds) {
        const formats = [{ unit: "secs", max: 60 }, { unit: "mins", max: 60 }, { unit: "hrs", max: 24 }, { unit: "days", max: 30 }, { unit: "months", max: 12 }, { unit: "years", max: 1 }]

        let uptime = uptimeSeconds
        for (const format of formats) {
            if (uptime < format.max)
                return formatMetric(Math.floor(uptime), format.unit)
            else
                uptime /= format.max
        }

        return formatMetric(Math.floor(uptime), formats[-1].unit)
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
    const systemNetworkTx = formatNetworkBytes(containers.reduce((sum, c) => sum + (c.NetworkTxBytes - c.PrevNetworkTxBytes) / c.MillisSinceLastUpdate * 1000, 0))

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
                            <span><Download />{systemNetworkRx}</span>
                            <span><Upload />{systemNetworkTx}</span>
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
                                <th><span>
                                    <h3>Name</h3>
                                    <button onClick={() => setSortAlphabeticallyAscending(prev => !prev)}>
                                        {sortAlphabeticallyAscending
                                            ? <ArrowDownAZ />
                                            : <ArrowDownZA />
                                        }
                                    </button>
                                </span></th>
                                <th><span>
                                    <h3>Status</h3>
                                    <button onClick={() => flipSortMetric("status", false)}>
                                        {sortMetric.value === "status" && !sortMetric.asc
                                            ? <ArrowDown01 />
                                            : <ArrowDown10 />
                                        }
                                    </button>
                                </span></th>
                                <th><span>
                                    <h3>CPU</h3>
                                    <button onClick={() => flipSortMetric("cpu", false)}>
                                        {sortMetric.value !== "cpu"
                                            ? <ArrowDownUp />
                                            : sortMetric.asc
                                                ? <ArrowDownNarrowWide />
                                                : <ArrowDownWideNarrow />
                                        }
                                    </button>
                                </span></th>
                                <th><span>
                                    <h3>Memory</h3>
                                    <button onClick={() => flipSortMetric("memory", false)}>
                                        {sortMetric.value !== "memory"
                                            ? <ArrowDownUp />
                                            : sortMetric.asc
                                                ? <ArrowDownNarrowWide />
                                                : <ArrowDownWideNarrow />
                                        }
                                    </button>
                                </span></th>
                                <th><span>
                                    <h3>Network</h3>
                                    <button onClick={() => flipSortMetric("networkRx", false)}>
                                        {sortMetric.value !== "networkRx"
                                            ? <ArrowDownUp />
                                            : sortMetric.asc
                                                ? <ArrowDownNarrowWide />
                                                : <ArrowDownWideNarrow />
                                        }
                                    </button>
                                </span></th>
                                <th><span>
                                    <h3>Uptime</h3>
                                    <button onClick={() => flipSortMetric("uptime", true)}>
                                        {sortMetric.value !== "uptime"
                                            ? <ArrowDownUp />
                                            : sortMetric.asc
                                                ? <ArrowDownNarrowWide />
                                                : <ArrowDownWideNarrow />
                                        }
                                    </button>
                                </span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortContainers().map(c => (
                                <tr key={c.ContainerId} className={[styles.container, statusClasses[c.Status] ?? styles.unknown].join(' ')}>
                                    <th>{c.ContainerName}</th>
                                    <th><span className={[styles.statusIndicator, statusClasses[c.Status] ?? styles.unknown].join(' ')}>{c.Status}</span></th>
                                    <th>{c.Status === 'exited' ? '-' : formatCpuPercent(c.CpuPercent)}</th>
                                    <th>{c.Status === 'exited' ? '-' : formatMemoryBytes(c.MemoryBytes)}</th>
                                    <th className={styles.network}>
                                        {c.Status === 'exited' ? '-' :
                                            <div>
                                                <div>
                                                    <Download />
                                                    <span>{formatNetworkBytes((c.NetworkRxBytes - c.PrevNetworkRxBytes) / c.MillisSinceLastUpdate * 1000)}</span>
                                                </div>
                                                <div>
                                                    <Upload />
                                                    <span>{formatNetworkBytes((c.NetworkTxBytes - c.PrevNetworkTxBytes) / c.MillisSinceLastUpdate * 1000)}</span>
                                                </div>
                                            </div>
                                        }
                                    </th>
                                    <th>{c.Status === 'exited' ? '-' : formatUptimeSeconds(c.UptimeSeconds)}</th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}