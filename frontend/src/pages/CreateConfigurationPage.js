import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/Modal.css';
import './css/CreateConfigurationPage.css';

const CreateConfigurationPage = ({ isModal, workspaceNameProp, importedDataProp, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const stateFromLocation = location.state || {};
    const workspaceName = isModal ? workspaceNameProp : stateFromLocation.workspaceName;
    const initialImportedData = isModal ? importedDataProp : (stateFromLocation.importedData || stateFromLocation.importedDataFromState);

    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [priorityOrder, setPriorityOrder] = useState([]);
    const [importedData, setImportedData] = useState(initialImportedData || null);

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
                    metrics: orderedMetrics,
                    entries: importedData.entries
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

    // 3. Define the inner content separately so we can conditionally wrap it
    const content = (
        <div className="create-workspace-container" style={isModal ? { padding: 0, margin: 0, maxWidth: '100%', boxShadow: 'none' } : {}}>

            {/* If Modal, add a Header with Close Button */}
            {isModal && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create New Configuration</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                </div>
            )}

            {!isModal && <h2>Create configuration for workspace <em>{workspaceName}</em></h2>}

            <p>Select max 6 metrics:</p>

            <div className="metrics-grid" style={isModal ? { maxHeight: '50vh', overflowY: 'auto', padding: '5px' } : {}}>
                {metrics.map(metric => {
                    const selected = selectedMetrics[metric.id];

                    const cardClass = isModal
                        ? `metric-card-lg ${selected ? 'selected' : ''}`
                        : `metric-card metric-card-2 ${selected ? 'selected' : ''}`;

                    return (
                        <div
                            key={metric.id}
                            className={cardClass}
                            onClick={() => toggleMetric(metric)}
                            style={isModal ? { boxSizing: 'border-box', cursor: 'pointer' } : {}}
                        >
                            {isModal && (
                                <div style={{ marginRight: '12px', marginTop: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!selected}
                                        readOnly
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                </div>
                            )}

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>{metric.name}</h4>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>{metric.description}</p>

                                {selected && (
                                    <div className="scale-select" onClick={e => e.stopPropagation()} style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <label style={{ marginRight: '8px', fontWeight: '500', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Scale:</label>
                                        <select
                                            value={selected.scale}
                                            onChange={e => handleScaleChange(metric.id, e.target.value)}
                                            style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem', width: '100%' }}
                                        >
                                            <option value="1-5">1-5</option>
                                            <option value="0-1">0/1</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="form-actions" style={isModal ? { marginTop: '0' } : { marginTop: '20px' }}>
                {isModal && <button className="secondary-button" onClick={onClose} style={{marginRight: '10px'}}>Cancel</button>}
                <button onClick={openPriorityModal} className="primary-button">Continue</button>
            </div>


            {showModal && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-content" style={{overflow: 'auto'}}>
                        <h3>Set priority of the metrics</h3>
                        <p>Use the arrows to move the highest priority metric to the top.</p>

                        <div className="priority-list">
                            {priorityOrder.map((metric, index) => (
                                <div key={metric.id} className="priority-item">
                                    <span className="priority-item-name">{index + 1}. {metric.name}</span>
                                    <div className="move-buttons">
                                        <button onClick={() => moveMetric(index, 'up')} disabled={index === 0}>↑</button>
                                        <button onClick={() => moveMetric(index, 'down')} disabled={index === priorityOrder.length - 1}>↓</button>
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
    );

    if (isModal) return content;

    return (
        <MainLayout>
            {content}
        </MainLayout>
    );
};

export default CreateConfigurationPage;
