import { Download, Upload } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formats, formatMetric, getMetricComponent } from "../utils/formatting"
import styles from "./DashboardSystemMetrics.module.css"

function MetricChart({ data, format }) {
    const min = Math.min(...data.map(d => d.value))
    const max = Math.max(...data.map(d => d.value))

    const unit = formatMetric(max, format).unit
    const formattedData = data.map(d => ({ value: formatMetric(d.value, format, max).value, recordedAt: d.recordedAt }))

    return (
        <ResponsiveContainer width="100%" height={100}>
            <LineChart data={formattedData}>
                <XAxis dataKey="recordedAt" />
                <YAxis domain={[min, max]} unit={unit} />
                <Tooltip />
                <Line type="monotone" dataKey="value" dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default function DashboardSystemMetrics({ containerSnapshots }) {
    const systemMetricSnapshots = []

    for (const snapshot of containerSnapshots) {
        if (snapshot.length === 0) continue

        const systemCpu = snapshot.reduce((sum, c) => sum + c.CpuPercent, 0.0)
        const systemMemory = snapshot.reduce((sum, c) => sum + c.MemoryBytes, 0)
        const systemNetworkRx = snapshot.reduce((sum, c) => sum + c.NetworkRxBytesPerSecond, 0.0)
        const systemNetworkTx = snapshot.reduce((sum, c) => sum + c.NetworkTxBytesPerSecond, 0.0)

        systemMetricSnapshots.push({
            recordedAt: new Date(snapshot[0].RecordedAt).toLocaleTimeString(),
            systemCpu,
            systemMemory,
            systemNetworkRx,
            systemNetworkTx
        })
    }

    const latestSnapshot = systemMetricSnapshots.at(-1)

    return (
        <section className={styles.systemMetrics}>
            <h2>System</h2>
            <div>
                <div className={styles.metric}>
                    <header>
                        <h3>CPU</h3>
                        <span>{getMetricComponent(formatMetric(latestSnapshot?.systemCpu ?? 0, formats.cpu))}</span>
                    </header>
                    <div>
                        <MetricChart data={systemMetricSnapshots.map(snapshot => ({
                            recordedAt: snapshot.recordedAt,
                            value: snapshot.systemCpu
                        }))} format={formats.cpu} />
                    </div>
                </div>
                <div className={styles.metric}>
                    <header>
                        <h3>Memory</h3>
                        <span>{getMetricComponent(formatMetric(latestSnapshot?.systemMemory ?? 0, formats.memory))}</span>
                    </header>
                    <div>
                        <MetricChart data={systemMetricSnapshots.map(snapshot => ({
                            recordedAt: snapshot.recordedAt,
                            value: snapshot.systemMemory
                        }))} format={formats.memory} />
                    </div>
                </div>
                <div className={styles.metric}>
                    <header>
                        <h3>Network</h3>
                        <span><Download />{getMetricComponent(formatMetric(latestSnapshot?.systemNetworkRx ?? 0, formats.network))}</span>
                        <span><Upload />{getMetricComponent(formatMetric(latestSnapshot?.systemNetworkTx ?? 0, formats.network))}</span>
                    </header>
                    <div>
                        <MetricChart data={systemMetricSnapshots.map(snapshot => ({
                            recordedAt: snapshot.recordedAt,
                            value: snapshot.systemNetworkRx
                        }))} format={formats.network} />
                    </div>
                </div>
            </div>
        </section>
    )
}