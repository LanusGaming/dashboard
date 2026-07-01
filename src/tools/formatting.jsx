import styles from "../pages/DashboardPage.module.css"

export const statusClasses = {
    running: styles.running,
    exited: styles.exited,
    paused: styles.paused,
    restarting: styles.restarting,
}

function formatMetric(value, unit) {
    return <span className={styles.metric}>
        {value}
        <span className={styles.unit}>{unit}</span>
    </span>
}

export function formatCpuPercent(cpuPercent) {
    return formatMetric((Math.round(cpuPercent * 100.0) / 100.0).toFixed(2), '%')
}

export function formatMemoryBytes(memoryBytes) {
    const memoryGB = memoryBytes / 1000000000.0
    return memoryGB >= 1.0
        ? formatMetric((memoryGB).toFixed(2), 'GB')
        : formatMetric(Math.round(memoryGB * 1000), 'MB')
}

export function formatNetworkBytes(networkBytes) {
    const networkMB = networkBytes / 1000000.0
    return networkMB >= 1.0
        ? formatMetric((networkMB).toFixed(2), 'MB/s')
        : networkMB * 1000 >= 1.0
            ? formatMetric(Math.round(networkMB * 1000), 'KB/s')
            : formatMetric(Math.round(networkBytes), 'B/s')
}

export function formatUptimeSeconds(uptimeSeconds) {
    const formats = [{ unit: "secs", max: 60 }, { unit: "mins", max: 60 }, { unit: "hrs", max: 24 }, { unit: "days", max: 30 }, { unit: "months", max: 12 }, { unit: "years", max: 1 }]

    let uptime = uptimeSeconds
    for (const format of formats) {
        if (uptime < format.max)
            return formatMetric(Math.floor(uptime), format.unit)
        else
            uptime /= format.max
    }

    return formatMetric(Math.floor(uptime), formats[formats.length - 1].unit)
}

export function sortContainers(containers, sortMetric, sortAlphabeticallyAscending) {
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
                equality = a.NetworkRxBytesPerSecond - b.NetworkRxBytesPerSecond
                break;
            case "networkTx":
                equality = a.NetworkTxBytesPerSecond - b.NetworkTxBytesPerSecond
                break;
            case "uptime":
                equality = a.UptimeSeconds - b.UptimeSeconds
                break;
        }

        if (equality !== 0) return equality * (sortMetric.asc ? 1 : -1)
        return a.ContainerName.localeCompare(b.ContainerName) * (sortAlphabeticallyAscending ? 1 : -1)
    })
}