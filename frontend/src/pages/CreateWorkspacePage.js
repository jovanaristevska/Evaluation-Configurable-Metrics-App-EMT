import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import CreateConfigurationPage from './CreateConfigurationPage'; // IMPORT THE COMPONENT
import './css/CreateWorkspacePage.css';
import '../App.css';

const CreateWorkspacePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const importedData = location.state?.importedData || null;

    const [workspaceName, setWorkspaceName] = useState('');
    const [configurations, setConfigurations] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState('');
    const [metrics, setMetrics] = useState([]);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdWorkspace, setCreatedWorkspace] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allAvailableMetrics, setAllAvailableMetrics] = useState([]);
    const [editingMetrics, setEditingMetrics] = useState([]);

    // NEW STATE for the Create Config Modal
    const [isCreateConfigModalOpen, setIsCreateConfigModalOpen] = useState(false);

    useEffect(() => {
        fetch('/api/configurations')
            .then(res => res.json())
            .then(data => setConfigurations(data))
            .catch(err => console.error("Failed to fetch configurations:", err));
    }, []);

    useEffect(() => {
        if (!selectedConfigId) {
            setMetrics([]);
            return;
        }
        fetch(`/api/configurations/${selectedConfigId}/metrics`)
            .then(res => res.json())
            .then(data => setMetrics(data))
            .catch(err => console.error("Failed to fetch metrics:", err));
    }, [selectedConfigId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!workspaceName) return alert('Please enter a workspace name.');
        if (!selectedConfigId) return alert('Please select a configuration.');
        if (!importedData) return alert('Please import a JSON file first.');

        const workspaceData = { name: workspaceName, configurationId: selectedConfigId, entries: importedData.entries };

        fetch(`/api/workspaces/import?configId=${selectedConfigId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(workspaceData)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to create workspace.');
                return res.json();
            })
            .then(created => {
                setCreatedWorkspace(created);
                setShowSuccessModal(true);
            })
            .catch(err => alert(err.message));
    };

    const formatMetricsForEvaluation = (metricsArray) => {
        return metricsArray.reduce((acc, metric, index) => {
            acc[metric.id] = { metric, scale: metric.scale || "1-5", importanceRank: index + 1 };
            return acc;
        }, {});
    };

    const handleContinue = () => {
        if (!createdWorkspace) return;
        setShowSuccessModal(false);
        const metricsForEval = createdWorkspace.configuration?.metrics || metrics;
        navigate('/evaluate', {
            state: {
                workspace: createdWorkspace,
                selectedMetrics: formatMetricsForEvaluation(metricsForEval)
            }
        });
    };

    const handleStartEditing = () => {
        if (!selectedConfigId) return;
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                setAllAvailableMetrics(data);
                setEditingMetrics(metrics);
                setIsEditModalOpen(true);
            })
            .catch(err => console.error("Failed to fetch all available metrics:", err));
    };

    const handleMetricEditToggle = (metric) => {
        setEditingMetrics(prev => {
            const isSelected = prev.some(m => m.id === metric.id);
            return isSelected ? prev.filter(m => m.id !== metric.id) : [...prev, metric];
        });
    };

    const handleSaveAsNewConfiguration = async () => {
        if (!workspaceName.trim()) {
            return alert("Please enter a workspace name first, as it's used to name the new configuration.");
        }
        if (editingMetrics.length === 0) {
            return alert("A configuration must have at least one metric.");
        }

        const newConfigName = `${workspaceName.trim()} - Custom Config`;

        const payload = {
            workspaceName: workspaceName.trim(),
            configurationName: newConfigName,
            metrics: editingMetrics.map((metric, index) => ({
                metricId: metric.id,
                scale: metric.scale || '1-5',
                position: index
            })),
            entries: importedData.entries
        };

        try {
            const response = await fetch('/api/configurations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to save configuration and create workspace.');
            }

            const createdWorkspaceObject = await response.json();

            if (createdWorkspaceObject.configuration) {
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
            <div className="form-container">
                <h2 className="form-title">Create a New Workspace</h2>
                <p className="form-subtitle">Use an existing configuration to evaluate your imported data.</p>

                {importedData && (
                    <div className="summary-card">
                        <p><strong>{importedData.entries.length}</strong> Q&A pairs imported successfully.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="workspace-form">
                    <div className="form-group">
                        <label htmlFor="workspace-name">Workspace Name</label>
                        <input
                            id="workspace-name"
                            type="text"
                            value={workspaceName}
                            onChange={e => setWorkspaceName(e.target.value)}
                            required
                            placeholder="e.g., Customer Service Bot V2 Test"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="configuration-select">Select Configuration</label>
                        <select
                            id="configuration-select"
                            value={selectedConfigId}
                            onChange={e => setSelectedConfigId(e.target.value)}
                            required
                        >
                            <option value="" disabled>-- Choose a configuration --</option>
                            {configurations.map(cfg => (
                                <option key={cfg.id} value={cfg.id}>{cfg.name || `Configuration #${cfg.id}`}</option>
                            ))}
                        </select>
                    </div>

                    <div className="divider">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setIsCreateConfigModalOpen(true)}> {/* CHANGED: Open Modal, do NOT navigate */}
                            Or, create a new configuration
                        </button>
                    </div>

                    {selectedConfigId && metrics.length > 0 && (
                        <div className="metrics-preview">
                            <div className="metrics-preview-header">
                                <h3>Metrics in this Configuration</h3>
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={handleStartEditing}>
                                    Edit and Save as New
                                </button>
                            </div>
                            <div className="metrics-grid">
                                {metrics.map(metric => (
                                    <div key={metric.id} className="metric-card-sm">
                                        <h4>{metric.name}</h4>
                                        <p>{metric.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="secondary-button" onClick={() => navigate(-1)}>Back</button>
                        <button type="submit" className="primary-button">Create Workspace</button>
                    </div>
                </form>

                {showSuccessModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Workspace Successfully Created!</h3>
                            <button onClick={handleContinue} className="primary-button">Continue to Evaluation</button>
                        </div>
                    </div>
                )}

                {/* NEW MODAL: Opens the CreateConfigurationPage inside here */}
                {isCreateConfigModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '90%', maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <CreateConfigurationPage
                                isModal={true}
                                workspaceNameProp={workspaceName}
                                importedDataProp={importedData}
                                onClose={() => setIsCreateConfigModalOpen(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Existing "Edit" modal remains here as well */}
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{width: '90%', maxWidth: '900px', maxHeight: '80vh'}}>
                            <h3>Edit and Save as New Configuration</h3>
                            <p>Select metrics for your new configuration. The original remains unchanged.</p>
                            <div className="metrics-grid modal-grid" style={{maxHeight: '50vh', overflowY: 'auto'}}>
                                {allAvailableMetrics.map(metric => {
                                    const isSelected = editingMetrics.some(m => m.id === metric.id);
                                    return (
                                        <div
                                            key={metric.id}
                                            className={`metric-card-lg ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleMetricEditToggle(metric)}
                                        >
                                            <input type="checkbox" readOnly checked={isSelected} className="metric-checkbox"/>
                                            <div className="metric-card-content">
                                                <h4>{metric.name}</h4>
                                                <p>{metric.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="form-actions" style={{marginTop: '0px'}}>
                                <button type="button" className="secondary-button" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="primary-button" onClick={handleSaveAsNewConfiguration}>
                                    Save and Create Workspace
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default CreateWorkspacePage;

