function MetricList({ metrics, configId }) {
    return (
        <div>
            <h3>Metrics in Configuration {configId}</h3>
            <ul>
                {metrics.map(metric => (
                    <li key={metric.id}>
                        {metric.position}. {metric.name} (Range: {metric.minValue}-{metric.maxValue})
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default MetricList;
