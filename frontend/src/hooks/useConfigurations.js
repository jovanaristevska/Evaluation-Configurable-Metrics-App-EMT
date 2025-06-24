import { useState, useEffect } from 'react';

export function useConfigurations() {
    const [configurations, setConfigurations] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState(null);
    const [metricsMap, setMetricsMap] = useState({});
    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState({});

    useEffect(() => {
        fetch('/api/configurations')
            .then(res => res.json())
            .then(data => {
                setConfigurations(data);
                fetchAllMetrics(data);
            })
            .catch(err => console.error(err));
    }, []);

    const fetchAllMetrics = async (configs) => {
        const map = {};
        for (const cfg of configs) {
            try {
                const res = await fetch(`/api/configurations/${cfg.id}/metrics`);
                const data = await res.json();
                map[cfg.id] = data;
            } catch (error) {
                console.error('Error fetching metrics for config', cfg.id, error);
                map[cfg.id] = [];
            }
        }
        setMetricsMap(map);
    };

    useEffect(() => {
        if (!selectedConfigId) {
            setMetrics([]);
            setSelectedMetrics({});
            return;
        }

        const currentMetrics = metricsMap[selectedConfigId] || [];
        setMetrics(currentMetrics);

        const initialSelected = {};
        currentMetrics.forEach(metric => {
            initialSelected[metric.id] = { scale: '1-5' };
        });
        setSelectedMetrics(initialSelected);
    }, [selectedConfigId, metricsMap]);

    const selectConfiguration = (configId) => {
        setSelectedConfigId(configId);
    };

    return {
        configurations,
        selectedConfigId,
        metrics,
        metricsMap,
        selectedMetrics,
        setSelectedMetrics,
        selectConfiguration,
    };
}
