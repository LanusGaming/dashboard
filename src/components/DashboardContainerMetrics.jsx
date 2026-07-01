import { useState } from "react"
import { ArrowDownAZ, ArrowDownZA, ArrowDown10, ArrowDown01, ArrowDownUp, ArrowDownWideNarrow, ArrowDownNarrowWide } from 'lucide-react'
import { sortContainers } from "../utils/sorting"
import DashboardContainer from "../components/DashboardContainer"
import styles from "./DashboardContainerMetrics.module.css"

export default function DashboardContainerMetrics({ containerSummaries }) {
    const [sortMetric, setSortMetric] = useState({ value: "status", asc: true })
    const [sortAlphabeticallyAscending, setSortAlphabeticallyAscending] = useState(true)

    function flipSortMetric(metric, defaultAscending) {
        if (sortMetric.value === metric)
            setSortMetric(prev => ({ value: metric, asc: !prev.asc }))
        else
            setSortMetric({ value: metric, asc: defaultAscending })
    }

    return (
        <section className={styles.containerMetrics}>
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
                {containerSummaries != null && sortContainers(containerSummaries, sortMetric, sortAlphabeticallyAscending).map(containerSummary => (
                    <DashboardContainer key={containerSummary.ContainerId} containerSummary={containerSummary} />
                ))}
            </div>
        </section>
    )
}