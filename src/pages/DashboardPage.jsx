import { useEffect, useState } from 'react'
import { Download, Upload, ArrowDownAZ, ArrowDownZA, ArrowDown10, ArrowDown01, ArrowDownUp, ArrowDownWideNarrow, ArrowDownNarrowWide } from 'lucide-react'
import { api } from '../api/client'
import DashboardSystemMetrics from "../components/DashboardSystemMetrics"
import DashboardContainer from "../components/DashboardContainer"
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const [containers, setContainers] = useState([])
    const [sortMetric, setSortMetric] = useState({ value: "status", asc: true })
    const [sortAlphabeticallyAscending, setSortAlphabeticallyAscending] = useState(true)

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

        es.onerror = () => { /** for error handling */ }

        return () => es.close()
    }, []);

    function flipSortMetric(metric, defaultAscending) {
        if (sortMetric.value === metric)
            setSortMetric(prev => ({ value: metric, asc: !prev.asc }))
        else
            setSortMetric({ value: metric, asc: defaultAscending })
    }

    

    return (
        <main className={styles.dashboardPage}>
            <DashboardSystemMetrics containers={containers.at(-1)} />
            <section className={styles.containerStats}>
                <h2>Containers</h2>
                <div className={styles.table} role="table">
                    <div className={styles.tableHead} role="row">
                        <button onClick={() => setSortAlphabeticallyAscending(prev => !prev)}>
                            <h3 role="columnheader">Name</h3>
                            {sortAlphabeticallyAscending
                                ? <ArrowDownAZ />
                                : <ArrowDownZA />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("status", false)}>
                            <h3 role="columnheader">Status</h3>
                            {sortMetric.value === "status" && !sortMetric.asc
                                ? <ArrowDown01 />
                                : <ArrowDown10 />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("cpu", false)}>
                            <h3 role="columnheader">CPU</h3>
                            {sortMetric.value !== "cpu"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("memory", false)}>
                            <h3 role="columnheader">Memory</h3>
                            {sortMetric.value !== "memory"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("networkRx", false)}>
                            <h3 role="columnheader">Network</h3>
                            {sortMetric.value !== "networkRx"
                                ? <ArrowDownUp />
                                : sortMetric.asc
                                    ? <ArrowDownNarrowWide />
                                    : <ArrowDownWideNarrow />
                            }
                        </button>
                        <button onClick={() => flipSortMetric("uptime", true)}>
                            <h3 role="columnheader">Uptime</h3>
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