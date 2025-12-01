import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import '../App.css';

const GenerateWorkspacePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const importedData = location.state?.importedData || null;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allAvailableMetrics, setAllAvailableMetrics] = useState([]);
    const [editingMetrics, setEditingMetrics] = useState([]);


    const formFields = [
        { id: 'workspaceName', label: 'Workspace Name', type: 'text', placeholder: 'e.g., Support Bot Accuracy Test' },
        { id: 'description', label: 'Evaluation Goal / Description', type: 'text', placeholder: "e.g., 'Check for politeness and factual accuracy'" },
        { id: 'type', label: 'Type', type: 'text', placeholder: "e.g., 'Conversational AI'" },
        { id: 'domain', label: 'Domain', type: 'text', placeholder: "e.g., 'E-commerce Customer Support'" }
    ];

    const initialFormData = formFields.reduce((acc, field) => {
        acc[field.id] = '';
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialFormData);

    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMetrics, setSelectedMetrics] = useState({});
    const [createdWorkspace, setCreatedWorkspace] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    const handleFetchMetrics = async () => {
        if (!formData.description || !formData.type || !formData.domain) {
            alert("Please fill in the Description, Type, and Domain fields first.");
            return;
        }
        setLoading(true);
        setError(null);
        setMetrics([]);
        try {
            const timer = new Promise(resolve => setTimeout(resolve, 3000));
            const fetchMetrics = fetch('/metrics.json').then(res => res.json());
            const [metricsData] = await Promise.all([fetchMetrics, timer]);
            setMetrics(metricsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMetric = (metric) => {
        setSelectedMetrics(prev => {
            const newSelection = { ...prev };
            if (newSelection[metric.id]) {
                delete newSelection[metric.id];
            } else {
                if (Object.keys(newSelection).length >= 6) {
                    alert("You can select a maximum of 6 metrics.");
                    return prev;
                }
                newSelection[metric.id] = { ...metric, scale: '1-5' };
            }
            return newSelection;
        });
    };

    const handleScaleChange = (metricId, newScale) => {
        setSelectedMetrics(prev => ({
            ...prev,
            [metricId]: { ...prev[metricId], scale: newScale }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isFormValid = formFields.every(field => formData[field.id].trim() !== '');
        if (!isFormValid) {
            alert('Please complete all fields.');
            return;
        }
        if (!importedData) {
            alert('Please import a JSON file first.');
            return;
        }
        if (Object.keys(selectedMetrics).length === 0) {
            alert('Please select at least one metric.');
            return;
        }

        const payload = {
            ...formData,
            workspaceName: formData.workspaceName,
            configurationName: `${formData.workspaceName} - Generated Config`,
            entries: importedData.entries,
            metrics: Object.values(selectedMetrics).map((m, i) => ({
                metricId: m.id, scale: m.scale, position: i
            })),
        };

        try {
            const res = await fetch('/api/workspaces/with-new-configuration', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            setCreatedWorkspace(await res.json());
            setShowSuccessModal(true);
        } catch (err) {
            alert(`Error creating workspace: ${err.message}`);
        }
    };

    const handleContinue = () => {
        setShowSuccessModal(false);
        const formattedMetrics = Object.entries(selectedMetrics).reduce((acc, [id, metric], index) => {
            acc[id] = { metric, scale: metric.scale, importanceRank: index + 1 };
            return acc;
        }, {});
        navigate('/evaluate', { state: { workspace: createdWorkspace, selectedMetrics: formattedMetrics, questionsAndAnswers: importedData?.entries } });
    };

    const handleStartEditing = async () => {
        try {
            const res = await fetch('/api/metrics');
            const data = await res.json();
            setAllAvailableMetrics(data);
            setEditingMetrics(Object.values(selectedMetrics));
            setIsEditModalOpen(true);
        } catch (err) {
            alert("Failed to load metrics.");
        }
    };

    const handleMetricEditToggle = (metric) => {
        setEditingMetrics(prev => {
            const exists = prev.some(m => m.id === metric.id);
            return exists
                ? prev.filter(m => m.id !== metric.id)
                : [...prev, { ...metric, scale: metric.scale || '1-5' }];
        });
    };

    const handleSaveAsNewConfiguration = async () => {
        if (editingMetrics.length === 0) {
            return alert("You must select at least one metric.");
        }

        const payload = {
            ...formData,
            configurationName: `${formData.workspaceName} - Custom Config`,
            entries: importedData.entries,
            metrics: editingMetrics.map((m, i) => ({
                metricId: m.id,
                scale: m.scale || "1-5",
                position: i
            }))
        };

        try {
            const res = await fetch('/api/workspaces/with-new-configuration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            const created = await res.json();
            setCreatedWorkspace(created);
            setIsEditModalOpen(false);
            setShowSuccessModal(true);

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };


    return (
        <MainLayout>
            <div className="page-container">
                <div className="form-container">
                    <h1 className="form-title">Generate New Metrics</h1>
                    <p className="form-subtitle">Describe your evaluation goal to generate a set of relevant metrics.</p>

                    <form onSubmit={handleSubmit}>
                        {formFields.map(field => (
                            <div className="form-group" key={field.id}>
                                <label htmlFor={field.id}>{field.label}</label>
                                <input
                                    id={field.id}
                                    type={field.type}
                                    value={formData[field.id]}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={field.placeholder}
                                />
                            </div>
                        ))}

                        <div className="fetch-section">
                            <button type="button" onClick={handleFetchMetrics} disabled={loading} className="primary-button">
                                {loading ? 'Generating...' : 'Generate Metrics'}
                            </button>
                            {loading && <div className="spinner"></div>}
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        {metrics.length > 0 && (
                            <div className="metrics-header">
                                <h3>Generated Metrics</h3>

                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={handleStartEditing}
                                >
                                    Edit and Save as New
                                </button>
                            </div>
                        )}

                        {metrics.length > 0 && (
                            <div className="metrics-grid">
                                {metrics.map(metric => {
                                    const isSelected = !!selectedMetrics[metric.id];
                                    return (
                                        <div key={metric.id} className={`metric-card ${isSelected ? 'selected' : ''}`} onClick={() => toggleMetric(metric)}>
                                            <h4>{metric.name}</h4>
                                            <p>{metric.description}</p>
                                            {isSelected && (
                                                <div className="scale-selector" onClick={(e) => e.stopPropagation()}>
                                                    <label htmlFor={`scale-${metric.id}`}>Scale:</label>
                                                    <select
                                                        id={`scale-${metric.id}`}
                                                        value={selectedMetrics[metric.id].scale}
                                                        onChange={(e) => handleScaleChange(metric.id, e.target.value)}
                                                    >
                                                        <option value="1-5">1 to 5</option>
                                                        <option value="0-1">0 or 1</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="secondary-button" onClick={() => navigate(-1)}>Back</button>
                            <button type="submit" className="primary-button" disabled={Object.keys(selectedMetrics).length === 0 || loading}>
                                Create & Continue
                            </button>
                        </div>
                    </form>
                </div>

                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '90%', maxWidth: '900px', maxHeight: '80vh' }}>
                            <h3>Edit and Save as New Configuration</h3>
                            <p>Select metrics for your custom configuration.</p>

                            <div className="metrics-grid modal-grid" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                {allAvailableMetrics.map(metric => {
                                    const isSelected = editingMetrics.some(m => m.id === metric.id);
                                    return (
                                        <div
                                            key={metric.id}
                                            className={`metric-card-lg ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleMetricEditToggle(metric)}
                                        >
                                            <input type="checkbox" readOnly checked={isSelected} className="metric-checkbox" />
                                            <div className="metric-card-content">
                                                <h4>{metric.name}</h4>
                                                <p>{metric.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="form-actions">
                                <button type="button" className="secondary-button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="button" className="primary-button" onClick={handleSaveAsNewConfiguration}>
                                    Save and Create Workspace
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Workspace Successfully Created!</h3>
                            <button onClick={handleContinue} className="primary-button">Continue to Evaluation</button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default GenerateWorkspacePage;
