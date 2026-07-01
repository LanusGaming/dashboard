import { Download, Upload } from "lucide-react"
import { formatCpuPercent, formatMemoryBytes, formatNetworkBytes, formatUptimeSeconds } from "../tools/formatting"
import styles from "./DashboardContainer.module.css"

export default function DashboardContainer({ container }) {
    const name = container.ContainerName
    const status = container.Status
    const cpu = formatCpuPercent(container.CpuPercent)
    const memory = formatMemoryBytes(container.MemoryBytes)
    const networkRx = formatNetworkBytes(container.NetworkRxBytesPerSecond)
    const networkTx = formatNetworkBytes(container.NetworkTxBytesPerSecond)
    const uptime = formatUptimeSeconds(container.UptimeSeconds)

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
                <span className={[styles.statusIndicator, statusClasses[container.Status] ?? styles.unknown].join(' ')}>{container.Status}</span>
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