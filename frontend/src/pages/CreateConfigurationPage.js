import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/Modal.css';

const CreateConfigurationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { workspaceName } = location.state || {};

    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [priorityOrder, setPriorityOrder] = useState([]);

    useEffect(() => {
        fetch('/api/metrics')
            .then(res => res.json())
            .then(setMetrics)
            .catch(err => console.error('Error fetching metrics:', err));
    }, []);

    const toggleMetric = (metric) => {
        setSelectedMetrics(prev => {
            const isSelected = !!prev[metric.id];
            if (isSelected) {
                const { [metric.id]: _, ...rest } = prev;
                return rest;
            }
            if (Object.keys(prev).length >= 6) return prev;
            return { ...prev, [metric.id]: { ...metric, scale: '1-5' } };
        });
    };

    const handleScaleChange = (metricId, scale) => {
        setSelectedMetrics(prev => ({
            ...prev,
            [metricId]: { ...prev[metricId], scale }
        }));
    };

    const openPriorityModal = () => {
        if (Object.keys(selectedMetrics).length === 0) {
            alert('Select at least one metric');
            return;
        }
        setPriorityOrder(Object.values(selectedMetrics));
        setShowModal(true);
    };

    const moveMetric = (index, direction) => {
        const newOrder = [...priorityOrder];
        const item = newOrder[index];

        if (direction === 'up' && index > 0) {
            newOrder[index] = newOrder[index - 1];
            newOrder[index - 1] = item;
        } else if (direction === 'down' && index < newOrder.length - 1) {
            newOrder[index] = newOrder[index + 1];
            newOrder[index + 1] = item;
        }
        setPriorityOrder(newOrder);
    };


    const confirmPriority = async () => {
        try {
            const orderedMetrics = priorityOrder.map((m, idx) => ({
                metricId: m.id,
                position: idx + 1,
                scale: m.scale
            }));

            const response = await fetch('/api/workspaces/with-new-configuration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceName,
                    configurationName: `${workspaceName}-config`,
                    metrics: orderedMetrics
                })
            });

            if (!response.ok) throw new Error('Failed to create workspace');
            const createdWorkspace = await response.json();

            navigate('/evaluate', {
                state: {
                    workspace: createdWorkspace,
                    selectedMetrics: priorityOrder.reduce((acc, m, idx) => ({
                        ...acc,
                        [m.id]: { metric: m, scale: m.scale, importanceRank: idx + 1 }
                    }), {})
                }
            });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <MainLayout>
            <div className="create-workspace-container">
                <h2>Create configuration for workspace <em>{workspaceName}</em></h2>
                <p>Select max 6 metrics:</p>

                <div className="metrics-grid">
                    {metrics.map(metric => {
                        const selected = selectedMetrics[metric.id];
                        return (
                            <div key={metric.id} className={`metric-card metric-card-2 ${selected ? 'selected' : ''}`} onClick={() => toggleMetric(metric)}>
                                <h4>{metric.name}</h4>
                                <p>{metric.description}</p>
                                {selected && (
                                    <div className="scale-select" onClick={e => e.stopPropagation()}>
                                        <label>Rating Scale:    </label>
                                        <div className="custom-select-wrapper">
                                            <select value={selected.scale} onChange={e => handleScaleChange(metric.id, e.target.value)}>
                                                <option value="1-5">1 to 5</option>
                                                <option value="0-1">0 or 1</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                    <button onClick={openPriorityModal} className="primary-button">Continue</button>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Set priority of the metrics</h3>
                            <p>Use the arrows to move the highest priority metric to the top.</p>

                            <div className="priority-list">
                                {priorityOrder.map((metric, index) => (
                                    <div key={metric.id} className="priority-item">
                                        <span className="priority-item-name">{index + 1}. {metric.name}</span>
                                        <div className="move-buttons">
                                            <button onClick={() => moveMetric(index, 'up')} disabled={index === 0}>
                                                ↑
                                            </button>
                                            <button onClick={() => moveMetric(index, 'down')} disabled={index === priorityOrder.length - 1}>
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button onClick={() => setShowModal(false)} className="secondary-button">Cancel</button>
                                <button onClick={confirmPriority} className="primary-button">Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default CreateConfigurationPage;
