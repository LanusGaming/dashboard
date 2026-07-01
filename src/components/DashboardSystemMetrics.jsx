import { Download, Upload } from 'lucide-react'
import { formatCpuPercent, formatMemoryBytes, formatNetworkBytes, formatUptimeSeconds } from "../tools/formatting"
import styles from "./DashboardSystemMetrics.module.css"

export default function DashboardSystemMetrics({ containers }) {
    const systemCpu = formatCpuPercent(containers?.reduce((sum, c) => sum + c.CpuPercent, 0.0) ?? 0.0)
    const systemMemory = formatMemoryBytes(containers?.reduce((sum, c) => sum + c.MemoryBytes, 0) ?? 0)
    const systemNetworkRx = formatNetworkBytes(containers?.reduce((sum, c) => sum + c.NetworkRxBytesPerSecond, 0.0) ?? 0.0)
    const systemNetworkTx = formatNetworkBytes(containers?.reduce((sum, c) => sum + c.NetworkTxBytesPerSecond, 0.0) ?? 0.0)

    return (
        <section className={styles.systemMetrics}>
            <h2>System</h2>
            <div>
                <div className={styles.metric}>
                    <header>
                        <h3>CPU</h3>
                        <span>{systemCpu}</span>
                    </header>
                    <div>
                        Graph
                    </div>
                </div>
                <div className={styles.metric}>
                    <header>
                        <h3>Memory</h3>
                        <span>{systemMemory}</span>
                    </header>
                    <div>
                        Graph
                    </div>
                </div>
                <div className={styles.metric}>
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
    )
}