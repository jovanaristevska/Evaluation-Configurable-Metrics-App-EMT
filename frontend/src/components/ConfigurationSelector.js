function ConfigurationSelector({ configurations, metricsMap, onSelect }) {
    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {configurations.map(cfg => (
                <li key={cfg.id} style={{ marginBottom: '1rem' }}>
                    <button onClick={() => onSelect(cfg.id)} style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {cfg.name}
                    </button>
                    <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.25rem' }}>
                        {metricsMap[cfg.id]?.map(m => m.name).join(', ') || 'Loading metrics...'}
                    </div>
                </li>
            ))}
        </ul>
    );
}
