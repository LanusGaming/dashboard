import { Download, Upload } from "lucide-react"
import { formats, formatMetric, getMetricComponent } from "../utils/formatting"
import styles from "./DashboardContainer.module.css"

export default function DashboardContainer({ containerSummary }) {
    const name = containerSummary.ContainerName
    const status = containerSummary.Status
    const cpu = getMetricComponent(formatMetric(containerSummary.CpuPercent, formats.cpu))
    const memory = getMetricComponent(formatMetric(containerSummary.MemoryBytes, formats.memory))
    const networkRx = getMetricComponent(formatMetric(containerSummary.NetworkRxBytesPerSecond, formats.network))
    const networkTx = getMetricComponent(formatMetric(containerSummary.NetworkTxBytesPerSecond, formats.network))
    const uptime = getMetricComponent(formatMetric(containerSummary.UptimeSeconds, formats.uptime))

    const statusClasses = {
        running: styles.running,
        exited: styles.exited,
        paused: styles.paused,
        restarting: styles.restarting,
    }

    return (
        <div className={[styles.container, statusClasses[status] ?? styles.unknown].join(' ')} role="row">
            <div role="cell">
                <button>{name}</button>
            </div>
            <div role="cell">
                <span className={[styles.statusIndicator, statusClasses[containerSummary.Status] ?? styles.unknown].join(' ')}>{containerSummary.Status}</span>
            </div>
            <div role="cell">
                <span>{status === 'exited' ? '-' : cpu}</span>
            </div>
            <div role="cell">
                <span>{status === 'exited' ? '-' : memory}</span>
            </div>
            <div role="cell">
                {status === 'exited' ? '-' :
                    <div className={styles.network}>
                        <div>
                            <Download />
                            <span>{networkRx}</span>
                        </div>
                        <div>
                            <Upload />
                            <span>{networkTx}</span>
                        </div>
                    </div>
                }
            </div>
            <div role="cell">
                <span>{status === 'exited' ? '-' : uptime}</span>
            </div>
        </div>
    )
}