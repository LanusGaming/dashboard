function formatMetric(value, unit) {
    return <span>
        {value}
        <span style={{ opacity: "50%", fontSize: "0.8em" }}>{unit}</span>
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