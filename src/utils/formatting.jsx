export const formats = {
    cpu: [{unit: "%", max: 1, precision: 2}],
    memory: [{unit: "B", max: 1000, precision: 1}, {unit: "KB", max: 1000, precision: 3}, {unit: "MB", max: 1000, precision: 3}, {unit: "GB", max: 1, precision: 3}],
    network: [{unit: "B/s", max: 1000, precision: 1}, {unit: "KB/s", max: 1000, precision: 3}, {unit: "MB/s", max: 1000, precision: 3}, {unit: "GB/s", max: 1, precision: 3}],
    uptime: [{unit: "secs", max: 60, precision: 1}, {unit: "mins", max: 60, precision: 1}, {unit: "hrs", max: 24, precision: 1}, {unit: "days", max: 30, precision: 1}, {unit: "months", max: 12, precision: 1}, {unit: "years", max: 1, precision: 1}]
}

export function formatMetric(value, format, reference) {
    let relativeValue = value * 1.0
    let relativeReference = reference == null ? relativeValue : reference * 1.0

    for (const unit of format) {
        if (relativeReference < unit.max)
            return { value: relativeValue.toPrecision(unit.precision), unit: unit.unit }
        else {
            relativeValue /= unit.max
            relativeReference /= unit.max
        }
    }

    return { value: relativeValue.toPrecision(format.at(-1).precision), unit: format.at(-1).unit }
}

export function getMetricComponent({ value, unit }) {
    return <span>
        {value}
        <span style={{ opacity: "50%", fontSize: "0.8em" }}>{unit}</span>
    </span>
}