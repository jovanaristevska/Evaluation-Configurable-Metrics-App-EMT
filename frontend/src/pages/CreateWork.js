import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/CreateWorkspacePage.css';

const CreateWork = () => {
    const navigate = useNavigate();

    const [workspaceName, setWorkspaceName] = useState('');
    const [configurations, setConfigurations] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState({});

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdWorkspace, setCreatedWorkspace] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allAvailableMetrics, setAllAvailableMetrics] = useState([]);
    const [editingMetrics, setEditingMetrics] = useState([]);

    useEffect(() => {
        fetch('/api/configurations')
            .then(res => res.json())
            .then(data => setConfigurations(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!selectedConfigId) {
            setMetrics([]);
            setSelectedMetrics({});
            return;
        }
        fetch(`/api/configurations/${selectedConfigId}/metrics`)
            .then(res => res.json())
            .then(data => {
                setMetrics(data);
                setSelectedMetrics({});
            })
            .catch(err => console.error(err));
    }, [selectedConfigId]);

    const handleMetricSelection = (metricId) => {
        setSelectedMetrics(prev => {
            if (prev[metricId]) {
                const { [metricId]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [metricId]: { scale: '1-5' }
            };
        });
    };

        const handleStartEditing = () => {
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                setAllAvailableMetrics(data);
                setEditingMetrics(metrics);
                setIsEditModalOpen(true);
            })
            .catch(err => console.error("Failed to fetch all metrics", err));
    };

    const handleScaleChange = (metricId, scale) => {
        setSelectedMetrics(prev => ({
            ...prev,
            [metricId]: { ...prev[metricId], scale }
        }));
    };

    const handleContinue = () => {
        if (!createdWorkspace) {
            alert("Workspace not ready yet, please wait.");
            return;
        }
        setShowSuccessModal(false);
        navigate('/evaluate', {
            state: {
                workspace: createdWorkspace,
                selectedMetrics: formatMetricsForEvaluation(metrics)
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!workspaceName) return alert('Please enter a workspace name');
        if (!selectedConfigId) return alert('Please select a configuration');

        const workspaceData = {
            name: workspaceName,
            configurationId: selectedConfigId
        };

        fetch('/api/workspaces', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workspaceData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to create workspace');
                return res.json();
            })
            .then(createdWorkspace => {
                setCreatedWorkspace(createdWorkspace);
                setShowSuccessModal(true);
            })
            .catch(err => alert(err.message));
    };

    const formatMetricsForEvaluation = (metricsArray) => {
        return metricsArray.reduce((acc, metric, index) => {
            acc[metric.id] = {
                metric,
                scale: metric.scale || "1-5",
                importanceRank: index + 1
            };
            return acc;
        }, {});
    };

    const handleMetricEditToggle = (metric) => {
        setEditingMetrics(prev => {
            const isSelected = prev.some(m => m.id === metric.id);
            if (isSelected) {
                return prev.filter(m => m.id !== metric.id);
            } else {
                return [...prev, metric];
            }
        });
    };

    const handleSaveAsNewConfiguration = async () => {
        if (!workspaceName || workspaceName.trim() === '') {
            alert("Please enter a name for the workspace first.");
            return;
        }

        const newConfigName = `${workspaceName.trim()} - config`;

        const newConfigurationData = {
            workspaceName: workspaceName.trim(),
            configurationName: newConfigName,
            metrics: editingMetrics.map((metric, index) => ({
                metricId: metric.id,
                scale: metric.scale || '1-5',
                position: index
            }))
        };

        try {
            const response = await fetch('/api/configurations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newConfigurationData)
            });

            if (!response.ok) {
                if (response.status === 409) {
                    const errorMessage = await response.text();
                    alert(errorMessage);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create configuration');
                }
                return;
            }

            const createdWorkspaceObject = await response.json();
            console.log("Добиен објект од /api/configurations:", createdWorkspaceObject);

            if (!createdWorkspaceObject || !createdWorkspaceObject.id) {
                throw new Error("Server response did not include the full workspace details with an ID.");
            }

            if (createdWorkspaceObject.configuration && createdWorkspaceObject.configuration.id) {
                setConfigurations(prev => [...prev, createdWorkspaceObject.configuration]);
                setSelectedConfigId(createdWorkspaceObject.configuration.id);
            }

            setIsEditModalOpen(false);

            setCreatedWorkspace(createdWorkspaceObject);

            setShowSuccessModal(true);


        } catch (error) {
            console.error('Error saving new configuration:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <MainLayout>
            <div className="create-workspace-container">
                <h2>Create New Workspace</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="workspace-name">Workspace Name</label>
                        <input
                            id="workspace-name"
                            type="text"
                            value={workspaceName}
                            onChange={e => setWorkspaceName(e.target.value)}
                            required
                            placeholder="Enter workspace name"
                        />
                    </div>

                    <div className="button-container">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => navigate('/create-configuration', {
                                state: {
                                    workspaceName,
                                    returnTo: '/evaluate'
                                }
                            })}
                        >
                            Create your configuration
                        </button>
                    </div>
                    <div className="configurations-list">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3>Select an existing configuration: </h3>

                        </div>

                        {configurations.length === 0 && <p>Loading configurations...</p>}
                        <ul>
                            {configurations.map(cfg => (
                                <li
                                    key={cfg.id}
                                    className={cfg.id === selectedConfigId ? 'selected-config' : ''}
                                    onClick={() => setSelectedConfigId(cfg.id)}
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: cfg.id === selectedConfigId ? 'bold' : 'normal',
                                        padding: '8px',
                                        borderBottom: '1px solid #ccc'
                                    }}
                                >
                                    {cfg.name || `Configuration #${cfg.id}`}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {selectedConfigId && (
                        <div className="metrics-selection">
                            <h3>Metrics in this configuration:</h3>
                            <div className="metrics-grid">
                                {metrics.map(metric => (
                                    <div
                                        key={metric.id}
                                        className="metric-card"
                                        style={{
                                            border: '1px solid #ccc',
                                            padding: '10px',
                                            margin: '5px',
                                            borderRadius: '4px',
                                            backgroundColor: '#f9f9f9',
                                        }}
                                    >
                                        <h4>{metric.name}</h4>
                                        <p>{metric.description}</p>
                                        <select
                                            value={metric.scale}
                                            disabled
                                            style={{
                                                marginTop: '8px',
                                                color: '#999',
                                                backgroundColor: '#f0f0f0',
                                                cursor: 'not-allowed',
                                                width: '120px',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            <option value="1-5">1 to 5</option>
                                            <option value="0-1">0 or 1</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                                 <button
                                                                    type="button"
                                                                    onClick={handleStartEditing}
                                                                    style={{
                                                                        backgroundColor: '#6e6d6c',
                                                                        color: 'white',
                                                                        padding: '10px 15px',
                                                                        border: 'none',
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    Edit configuration
                                                                </button>
                                                            </div>
                        </div>
                    )}

                    <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="primary-button">
                            Create Workspace
                        </button>
                    </div>
                </form>

                {showSuccessModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Workspace successfully created!</h3>
                            <button onClick={handleContinue}>Continue to Evaluation</button>
                        </div>
                    </div>
                )}
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{width: '600px', maxHeight: '80vh'}}>
                            <h3>Edit Configuration and Save as New</h3>
                            <p>Select metrics for the new configuration. The original configuration will not be
                                changed.</p>

                            <div className="metrics-grid"
                                 style={{maxHeight: '50vh', overflowY: 'auto', marginBottom: '20px'}}>
                                {allAvailableMetrics.map(metric => {
                                    const isSelected = editingMetrics.some(m => m.id === metric.id);
                                    return (
                                        <div
                                            key={metric.id}
                                            className={`metric-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleMetricEditToggle(metric)}
                                            style={{
                                                border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
                                                padding: '10px',
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#e7f3ff' : '#fff'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                readOnly
                                                checked={isSelected}
                                                style={{marginRight: '10px'}}
                                            />
                                            <label>{metric.name}</label>
                                            <p style={{
                                                fontSize: '12px',
                                                color: '#666',
                                                marginTop: '5px'
                                            }}>{metric.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="form-actions" style={{justifyContent: 'flex-end'}}>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleSaveAsNewConfiguration}
                                >
                                    Save as New Configuration
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default CreateWork;