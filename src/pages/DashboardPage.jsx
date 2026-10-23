import { useEffect, useState } from 'react'
import { Download, Upload, ArrowDownAZ, ArrowDownZA, ArrowDown10, ArrowDown01, ArrowDownUp, ArrowDownWideNarrow, ArrowDownNarrowWide } from 'lucide-react'
import { api, getAccessToken } from '../api/client'
import { formatCpuPercent, formatMemoryBytes, formatNetworkBytes, formatUptimeSeconds, sortContainers } from "../tools/formatting"
import DashboardContainer from "../components/DashboardContainer"
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containers, setContainers] = useState([])
    const [sortMetric, setSortMetric] = useState({ value: "status", asc: true })
    const [sortAlphabeticallyAscending, setSortAlphabeticallyAscending] = useState(true)

    useEffect(() => {
        const es = new EventSource(`/api/containers/stream?access_token=${getAccessToken()}`);

        es.onmessage = (event) => {
            // Network rates (NetworkRx/TxBytesPerSecond) come from the API, computed between its samples
            const containerData = JSON.parse(event.data)
            setContainers(prevContainers => [...prevContainers, containerData].slice(-11))
        }

        es.onerror = () => { /** for error handling */ }

        return () => es.close()
    }, []);

    function flipSortMetric(metric, defaultAscending) {
        if (sortMetric.value === metric)
            setSortMetric(prev => ({ value: metric, asc: !prev.asc }))
        else
            setSortMetric({ value: metric, asc: defaultAscending })
    }

    const systemCpu = formatCpuPercent(containers.length > 0 ? containers[containers.length - 1].reduce((sum, c) => sum + c.CpuPercent, 0.0) : 0)
    const systemMemory = formatMemoryBytes(containers.length > 0 ? containers[containers.length - 1].reduce((sum, c) => sum + c.MemoryBytes, 0) : 0)
    const systemNetworkRx = formatNetworkBytes(containers.length > 0 ? containers[containers.length - 1].reduce((sum, c) => sum + c.NetworkRxBytesPerSecond, 0) : 0)
    const systemNetworkTx = formatNetworkBytes(containers.length > 0 ? containers[containers.length - 1].reduce((sum, c) => sum + c.NetworkTxBytesPerSecond, 0) : 0)

    return (
        <main className={styles.dashboardPage}>
            <section className={styles.systemStats}>
                <h2>System</h2>
                <div>
                    <div className={styles.systemMetric}>
                        <header>
                            <h3>CPU</h3>
                            <span>{systemCpu}</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                    <div className={styles.systemMetric}>
                        <header>
                            <h3>Memory</h3>
                            <span>{systemMemory}</span>
                        </header>
                        <div>
                            Graph
                        </div>
                    </div>
                    <div className={styles.systemMetric}>
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
                <div role="table">
                    <div className={styles.tableHead} role="row">
                        <button onClick={() => setSortAlphabeticallyAscending(prev => !prev)} role="columnheader">
                            <h3>Name</h3>
                            {sortAlphabeticallyAscending
                                ? <ArrowDownAZ />
                                : <ArrowDownZA />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("status", false)} role="columnheader">
                            <h3>Status</h3>
                            {sortMetric.value === "status" && !sortMetric.asc
                                ? <ArrowDown01 />
                                : <ArrowDown10 />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("cpu", false)} role="columnheader">
                            <h3>CPU</h3>
                            {sortMetric.value !== "cpu"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("memory", false)} role="columnheader">
                            <h3>Memory</h3>
                            {sortMetric.value !== "memory"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("networkRx", false)} role="columnheader">
                            <h3>Network</h3>
                            {sortMetric.value !== "networkRx"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("uptime", true)} role="columnheader">
                            <h3>Uptime</h3>
                            {sortMetric.value !== "uptime"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                    </div>
                    {containers.length > 0 && sortContainers(containers[containers.length - 1], sortMetric, sortAlphabeticallyAscending).map(c => (
                        <DashboardContainer key={c.ContainerId} container={c} />
                    ))}
                </div>
            </section>
        </main>
    )
}