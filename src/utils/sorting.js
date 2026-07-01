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