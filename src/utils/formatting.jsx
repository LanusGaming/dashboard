export const formats = {
    cpu: [{ unit: "%", max: 1 }],
    memory: [{ unit: "B", max: 1000, wholeNumber: true }, { unit: "KB", max: 1000 }, { unit: "MB", max: 1000 }, { unit: "GB", max: 1 }],
    network: [{ unit: "B/s", max: 1000, wholeNumber: true }, { unit: "KB/s", max: 1000 }, { unit: "MB/s", max: 1000 }, { unit: "GB/s", max: 1 }],
    uptime: [{ unit: "secs", max: 60, wholeNumber: true }, { unit: "mins", max: 60, wholeNumber: true }, { unit: "hrs", max: 24, wholeNumber: true }, { unit: "days", max: 30, wholeNumber: true }, { unit: "months", max: 12, wholeNumber: true }, { unit: "years", max: 1, wholeNumber: true }]
}

// Keeps ~3 significant digits above 1 (123, 12.3, 1.23), capped at 2 decimals below 1 (0.12, 0.01) so tiny values don't grow extra decimal places.
function decimalPlaces(value) {
    if (value < 1) return 2
    return Math.max(0, 2 - Math.floor(Math.log10(value)))
}

function toDisplayValue(value, unit) {
    const decimals = unit.wholeNumber ? 0 : decimalPlaces(Math.abs(value))
    return value.toFixed(decimals)
}

export function formatMetric(value, format, reference) {
    let relativeValue = value * 1.0
    let relativeReference = reference == null ? relativeValue : reference * 1.0

    for (const unit of format) {
        if (relativeReference < unit.max)
            return { value: toDisplayValue(relativeValue, unit), unit: unit.unit }
        else {
            relativeValue /= unit.max
            relativeReference /= unit.max
        }
    }

    return { value: toDisplayValue(relativeValue, format.at(-1)), unit: format.at(-1).unit }
}

export function getMetricComponent({ value, unit }) {
    return <span>
        {value}
        <span style={{ opacity: "50%", fontSize: "0.8em" }}>{unit}</span>
    </span>
}
