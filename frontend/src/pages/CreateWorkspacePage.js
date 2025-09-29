// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import './css/CreateWorkspacePage.css';
//
// const CreateWorkspacePage = () => {
//     const navigate = useNavigate();
//
//     const [workspaceName, setWorkspaceName] = useState('');
//     const [configurations, setConfigurations] = useState([]);
//     const [selectedConfigId, setSelectedConfigId] = useState();
//     const [metrics, setMetrics] = useState([]);
//     const [selectedMetrics, setSelectedMetrics] = useState({});
//
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const [createdWorkspace, setCreatedWorkspace] = useState(null);
//
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [allAvailableMetrics, setAllAvailableMetrics] = useState([]);
//     const [editingMetrics, setEditingMetrics] = useState([]);
//
//     const [importedData, setImportedData] = useState(null);
//     const [jsonError, setJsonError] = useState(null);
//
//     console.log("Selected configuration ID:", selectedConfigId);
//
//     useEffect(() => {
//         fetch('/api/configurations')
//             .then(res => res.json())
//             .then(data => setConfigurations(data))
//             .catch(err => console.error(err));
//     }, []);
//
//     useEffect(() => {
//         if (!selectedConfigId) {
//             setMetrics([]);
//             setSelectedMetrics({});
//             return;
//         }
//         fetch(`/api/configurations/${selectedConfigId}/metrics`)
//             .then(res => res.json())
//             .then(data => {
//                 setMetrics(data);
//                 setSelectedMetrics({});
//             })
//             .catch(err => console.error(err));
//     }, [selectedConfigId]);
//
//     const handleMetricSelection = (metricId) => {
//         setSelectedMetrics(prev => {
//             if (prev[metricId]) {
//                 const { [metricId]: _, ...rest } = prev;
//                 return rest;
//             }
//             return {
//                 ...prev,
//                 [metricId]: { scale: '1-5' }
//             };
//         });
//     };
//
//     const handleStartEditing = () => {
//         fetch('/api/metrics')
//             .then(res => res.json())
//             .then(data => {
//                 setAllAvailableMetrics(data);
//                 setEditingMetrics(metrics);
//                 setIsEditModalOpen(true);
//             })
//             .catch(err => console.error("Failed to fetch all metrics", err));
//     };
//
//     const handleScaleChange = (metricId, scale) => {
//         setSelectedMetrics(prev => ({
//             ...prev,
//             [metricId]: { ...prev[metricId], scale }
//         }));
//     };
//
//     const handleContinue = () => {
//         if (!createdWorkspace) {
//             alert("Workspace not ready yet, please wait.");
//             return;
//         }
//         //setShowSuccessModal(false);
//         console.log('Created workspace:', createdWorkspace); // додади ова
//         setShowSuccessModal(false);
//         navigate('/evaluate', {
//             state: {
//                 workspace: createdWorkspace,
//                 selectedMetrics: formatMetricsForEvaluation(metrics)
//             }
//         });
//     };
//
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!workspaceName) return alert('Please enter a workspace name');
//         if (!selectedConfigId) return alert('Please select a configuration');
//
//         if (!importedData || !importedData.entries || importedData.entries.length == 0) {
//             return alert('Please import a valid JSON file with entries');
//         }
//
//         const workspaceData = {
//             name: workspaceName,
//             configurationId: selectedConfigId,
//             entries: importedData.entries
//         };
//
//         // fetch('/api/workspaces/import', {
//         //     method: 'POST',
//         //     headers: {
//         //         'Content-Type': 'application/json'
//         //     },
//         //     body: JSON.stringify(workspaceData)
//         // })
//         fetch(`/api/workspaces/import?configId=${selectedConfigId}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(workspaceData)
//         })
//             .then(res => {
//                 if (!res.ok) throw new Error('Failed to create workspace');
//                 return res.json();
//             })
//             .then(createdWorkspace => {
//                 setCreatedWorkspace(createdWorkspace);
//                 setShowSuccessModal(true);
//             })
//             .catch(err => alert(err.message));
//     };
//
//
//     const formatMetricsForEvaluation = (metricsArray) => {
//         return metricsArray.reduce((acc, metric, index) => {
//             acc[metric.id] = {
//                 metric,
//                 scale: metric.scale || "1-5",
//                 importanceRank: index + 1
//             };
//             return acc;
//         }, {});
//     };
//
//     const handleMetricEditToggle = (metric) => {
//         setEditingMetrics(prev => {
//             const isSelected = prev.some(m => m.id === metric.id);
//             if (isSelected) {
//                 return prev.filter(m => m.id !== metric.id);
//             } else {
//                 return [...prev, metric];
//             }
//         });
//     };
//
//     const handleSaveAsNewConfiguration = async () => {
//         if (!workspaceName || workspaceName.trim() === '') {
//             alert("Please enter a name for the workspace first.");
//             return;
//         }
//
//         const newConfigName = `${workspaceName.trim()} - config`;
//
//         const newConfigurationData = {
//             workspaceName: workspaceName.trim(),
//             configurationName: newConfigName,
//             metrics: editingMetrics.map((metric, index) => ({
//                 metricId: metric.id,
//                 scale: metric.scale || '1-5',
//                 position: index
//             }))
//         };
//
//         try {
//             const response = await fetch('/api/configurations', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify(newConfigurationData)
//             });
//
//             if (!response.ok) {
//                 if (response.status === 409) {
//                     const errorMessage = await response.text();
//                     alert(errorMessage);
//                 } else {
//                     const errorData = await response.json();
//                     throw new Error(errorData.message || 'Failed to create configuration');
//                 }
//                 return;
//             }
//
//             const createdWorkspaceObject = await response.json();
//
//             if (!createdWorkspaceObject || !createdWorkspaceObject.id) {
//                 throw new Error("Server response did not include the full workspace details with an ID.");
//             }
//
//             if (createdWorkspaceObject.configuration && createdWorkspaceObject.configuration.id) {
//                 setConfigurations(prev => [...prev, createdWorkspaceObject.configuration]);
//                 setSelectedConfigId(createdWorkspaceObject.configuration.id);
//             }
//
//             setIsEditModalOpen(false);
//
//             setCreatedWorkspace(createdWorkspaceObject);
//
//             setShowSuccessModal(true);
//
//
//         } catch (error) {
//             console.error('Error saving new configuration:', error);
//             alert(`Error: ${error.message}`);
//         }
//     };
//
//     const handleJsonImport = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//
//         if (file.type !== "application/json") {
//             setJsonError("Please choose a JSON file.");
//             return;
//         }
//
//         try {
//             const text = await file.text();
//             const data = JSON.parse(text);
//
//             if (!data.entries || !Array.isArray(data.entries)) {
//                 setJsonError("Invalid JSON format: missing entries array.");
//                 return;
//             }
//
//             setImportedData(data);
//             setJsonError(null);
//             alert(`JSON imported successfully! Found ${data.entries.length} questions.`);
//         } catch (err) {
//             console.error(err);
//             setJsonError("Error parsing JSON.");
//         }
//     };
//
//
//     return (
//         <MainLayout>
//             <div className="create-workspace-container">
//                 <h2>Create New Workspace</h2>
//                 <div className="form-group">
//                     <label htmlFor="json-upload">Import JSON</label>
//                     <input
//                         id="json-upload"
//                         type="file"
//                         accept=".json"
//                         onChange={handleJsonImport}
//                     />
//                     {jsonError && <p style={{ color: "red" }}>{jsonError}</p>}
//                 </div>
//
//                 {importedData && (
//                     <div>
//                         <h3>Imported Q&A</h3>
//                         <ul>
//                             {importedData.entries.map((item, idx) => (
//                                 <li key={idx}>
//                                     <strong>Q:</strong> {item.question} <br/>
//                                     <strong>A:</strong> {item.answer} <br/>
//                                     <strong>М:</strong> {item.model}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 )}
//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label htmlFor="workspace-name">Workspace Name</label>
//                         <input
//                             id="workspace-name"
//                             type="text"
//                             value={workspaceName}
//                             onChange={e => setWorkspaceName(e.target.value)}
//                             required
//                             placeholder="Enter workspace name"
//                         />
//                     </div>
//
//                     <div className="button-container">
//                         <button
//                             type="button"
//                             className="primary-button"
//                             onClick={() => navigate('/create-configuration', {
//                                 state: {
//                                     workspaceName,
//                                     importedData,
//                                     returnTo: '/evaluate'
//                                 }
//                             })}
//                         >
//                             Create your configuration
//                         </button>
//                     </div>
//                     <div className="configurations-list">
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                             <h3>Select an existing configuration: </h3>
//
//                         </div>
//
//                         {configurations.length === 0 && <p>Loading configurations...</p>}
//                         <ul>
//                             {configurations.map(cfg => (
//                                 <li
//                                     key={cfg.id}
//                                     className={cfg.id === selectedConfigId ? 'selected-config' : ''}
//                                     onClick={() => setSelectedConfigId(cfg.id)}
//                                     style={{
//                                         cursor: 'pointer',
//                                         fontWeight: cfg.id === selectedConfigId ? 'bold' : 'normal',
//                                         padding: '8px',
//                                         borderBottom: '1px solid #ccc'
//                                     }}
//                                 >
//                                     {cfg.name || `Configuration #${cfg.id}`}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//
//                     {selectedConfigId && (
//                         <div className="metrics-selection">
//                             <h3>Metrics in this configuration:</h3>
//                             <div className="metrics-grid">
//                                 {metrics.map(metric => (
//                                     <div
//                                         key={metric.id}
//                                         className="metric-card"
//                                         style={{
//                                             border: '1px solid #ccc',
//                                             padding: '10px',
//                                             margin: '5px',
//                                             borderRadius: '4px',
//                                             backgroundColor: '#f9f9f9',
//                                         }}
//                                     >
//                                         <h4>{metric.name}</h4>
//                                         <p>{metric.description}</p>
//                                         <select
//                                             value={metric.scale}
//                                             disabled
//                                             style={{
//                                                 marginTop: '8px',
//                                                 color: '#999',
//                                                 backgroundColor: '#f0f0f0',
//                                                 cursor: 'not-allowed',
//                                                 width: '120px',
//                                                 padding: '4px',
//                                                 borderRadius: '4px',
//                                                 border: '1px solid #ccc',
//                                                 fontSize: '0.9rem',
//                                             }}
//                                         >
//                                             <option value="1-5">1 to 5</option>
//                                             <option value="0-1">0 or 1</option>
//                                         </select>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//                                                                  <button
//                                                                     type="button"
//                                                                     onClick={handleStartEditing}
//                                                                     style={{
//                                                                         backgroundColor: '#6e6d6c',
//                                                                         color: 'white',
//                                                                         padding: '10px 15px',
//                                                                         border: 'none',
//                                                                         borderRadius: '5px',
//                                                                         cursor: 'pointer',
//                                                                         fontWeight: 'bold'
//                                                                     }}
//                                                                 >
//                                                                     Edit configuration
//                                                                 </button>
//                                                             </div>
//                         </div>
//                     )}
//
//                     <div className="form-actions" style={{ marginTop: '20px' }}>
//                         <button
//                             type="button"
//                             className="secondary-button"
//                             onClick={() => navigate('/')}
//                         >
//                             Cancel
//                         </button>
//                         <button type="submit" className="primary-button">
//                             Create Workspace
//                         </button>
//                     </div>
//                 </form>
//
//                 {showSuccessModal && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Workspace successfully created!</h3>
//                             <button onClick={handleContinue}>Continue to Evaluation</button>
//                         </div>
//                     </div>
//                 )}
//                 {isEditModalOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content" style={{width: '600px', maxHeight: '80vh'}}>
//                             <h3>Edit Configuration and Save as New</h3>
//                             <p>Select metrics for the new configuration. The original configuration will not be
//                                 changed.</p>
//
//                             <div className="metrics-grid"
//                                  style={{maxHeight: '50vh', overflowY: 'auto', marginBottom: '20px'}}>
//                                 {allAvailableMetrics.map(metric => {
//                                     const isSelected = editingMetrics.some(m => m.id === metric.id);
//                                     return (
//                                         <div
//                                             key={metric.id}
//                                             className={`metric-card ${isSelected ? 'selected' : ''}`}
//                                             onClick={() => handleMetricEditToggle(metric)}
//                                             style={{
//                                                 border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
//                                                 padding: '10px',
//                                                 cursor: 'pointer',
//                                                 backgroundColor: isSelected ? '#e7f3ff' : '#fff'
//                                             }}
//                                         >
//                                             <input
//                                                 type="checkbox"
//                                                 readOnly
//                                                 checked={isSelected}
//                                                 style={{marginRight: '10px'}}
//                                             />
//                                             <label>{metric.name}</label>
//                                             <p style={{
//                                                 fontSize: '12px',
//                                                 color: '#666',
//                                                 marginTop: '5px'
//                                             }}>{metric.description}</p>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                             <div className="form-actions" style={{justifyContent: 'flex-end'}}>
//                                 <button
//                                     type="button"
//                                     className="secondary-button"
//                                     onClick={() => setIsEditModalOpen(false)}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="primary-button"
//                                     onClick={handleSaveAsNewConfiguration}
//                                 >
//                                     Save as New Configuration
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </MainLayout>
//     );
// };
//
// export default CreateWorkspacePage;

// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import './css/CreateWorkspacePage.css';
//
// const CreateWorkspacePage = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//
//     // Receive importedData and a potential JSON error from ChooseWorkspacePage via location state
//     const importedData = location.state?.importedData || null;
//     const jsonError = location.state?.jsonError || null;
//
//     const [workspaceName, setWorkspaceName] = useState('');
//     const [configurations, setConfigurations] = useState([]);
//     const [selectedConfigId, setSelectedConfigId] = useState();
//     const [metrics, setMetrics] = useState([]);
//     const [selectedMetrics, setSelectedMetrics] = useState({});
//
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const [createdWorkspace, setCreatedWorkspace] = useState(null);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [allAvailableMetrics, setAllAvailableMetrics] = useState([]);
//     const [editingMetrics, setEditingMetrics] = useState([]);
//
//     // Fetch existing configurations when the component mounts
//     useEffect(() => {
//         fetch('/api/configurations')
//             .then(res => res.json())
//             .then(data => setConfigurations(data))
//             .catch(err => console.error("Failed to fetch configurations:", err));
//     }, []);
//
//     // Fetch metrics for the selected configuration
//     useEffect(() => {
//         if (!selectedConfigId) {
//             setMetrics([]);
//             return;
//         }
//         fetch(`/api/configurations/${selectedConfigId}/metrics`)
//             .then(res => res.json())
//             .then(data => {
//                 setMetrics(data);
//             })
//             .catch(err => console.error("Failed to fetch metrics for config:", err));
//     }, [selectedConfigId]);
//
//     // Opens the modal to edit a configuration
//     const handleStartEditing = () => {
//         fetch('/api/metrics')
//             .then(res => res.json())
//             .then(data => {
//                 setAllAvailableMetrics(data);
//                 setEditingMetrics(metrics); // Pre-populate with current metrics
//                 setIsEditModalOpen(true);
//             })
//             .catch(err => console.error("Failed to fetch all available metrics:", err));
//     };
//
//     // Navigates to the evaluation page after successful workspace creation
//     const handleContinue = () => {
//         if (!createdWorkspace) {
//             alert("Workspace is not ready. Please wait.");
//             return;
//         }
//         setShowSuccessModal(false);
//         navigate('/evaluate', {
//             state: {
//                 workspace: createdWorkspace,
//                 selectedMetrics: formatMetricsForEvaluation(metrics)
//             }
//         });
//     };
//
//     // Main submission handler to create the workspace
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!workspaceName) return alert('Please enter a workspace name.');
//         if (!selectedConfigId) return alert('Please select a configuration.');
//         if (!importedData || !importedData.entries || importedData.entries.length === 0) {
//             return alert('Please go back and import a valid JSON file with entries.');
//         }
//
//         const workspaceData = {
//             name: workspaceName,
//             configurationId: selectedConfigId,
//             entries: importedData.entries
//         };
//
//         fetch(`/api/workspaces/import?configId=${selectedConfigId}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(workspaceData)
//         })
//             .then(res => {
//                 if (!res.ok) throw new Error('Failed to create workspace.');
//                 return res.json();
//             })
//             .then(createdWorkspace => {
//                 setCreatedWorkspace(createdWorkspace);
//                 setShowSuccessModal(true);
//             })
//             .catch(err => alert(err.message));
//     };
//
//     // Formats metrics for the evaluation page
//     const formatMetricsForEvaluation = (metricsArray) => {
//         return metricsArray.reduce((acc, metric, index) => {
//             acc[metric.id] = {
//                 metric,
//                 scale: metric.scale || "1-5",
//                 importanceRank: index + 1
//             };
//             return acc;
//         }, {});
//     };
//
//     // Toggles a metric's selection in the "Edit Configuration" modal
//     const handleMetricEditToggle = (metric) => {
//         setEditingMetrics(prev => {
//             const isSelected = prev.some(m => m.id === metric.id);
//             return isSelected ? prev.filter(m => m.id !== metric.id) : [...prev, metric];
//         });
//     };
//
//     // Saves the edited metric list as a new configuration
//     const handleSaveAsNewConfiguration = async () => {
//         if (!workspaceName.trim()) {
//             alert("Please enter a workspace name first.");
//             return;
//         }
//
//         const newConfigName = `${workspaceName.trim()} - Config`;
//         const newConfigurationData = {
//             workspaceName: workspaceName.trim(),
//             configurationName: newConfigName,
//             metrics: editingMetrics.map((metric, index) => ({
//                 metricId: metric.id,
//                 scale: metric.scale || '1-5',
//                 position: index
//             }))
//         };
//
//         try {
//             const response = await fetch('/api/configurations', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify(newConfigurationData)
//             });
//
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText || 'Failed to create new configuration.');
//             }
//
//             const createdWorkspaceObject = await response.json();
//             if (!createdWorkspaceObject?.id) {
//                 throw new Error("Server response was invalid.");
//             }
//
//             // Update state to reflect the new configuration
//             if (createdWorkspaceObject.configuration?.id) {
//                 setConfigurations(prev => [...prev, createdWorkspaceObject.configuration]);
//                 setSelectedConfigId(createdWorkspaceObject.configuration.id);
//             }
//
//             setIsEditModalOpen(false);
//             setCreatedWorkspace(createdWorkspaceObject);
//             setShowSuccessModal(true);
//
//         } catch (error) {
//             console.error('Error saving new configuration:', error);
//             alert(`Error: ${error.message}`);
//         }
//     };
//
//     return (
//         <MainLayout>
//             <div className="create-workspace-container">
//                 <h2>Create New Workspace</h2>
//
//                 {jsonError && <p style={{ color: "red" }}>{jsonError}</p>}
//
//                 {importedData && (
//                     <div style={{ marginTop: '20px', textAlign: 'left', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
//                         <h3>Imported Questions and Answers</h3>
//                         <p>{importedData.entries.length} items loaded.</p>
//                     </div>
//                 )}
//
//                 <form onSubmit={handleSubmit} style={{marginTop: '20px'}}>
//                     <div className="form-group">
//                         <label htmlFor="workspace-name">Workspace Name</label>
//                         <input
//                             id="workspace-name"
//                             type="text"
//                             value={workspaceName}
//                             onChange={e => setWorkspaceName(e.target.value)}
//                             required
//                             placeholder="e.g., Q&A Bot Accuracy Test"
//                         />
//                     </div>
//
//                     <div className="button-container">
//                         <button
//                             type="button"
//                             className="primary-button"
//                             onClick={() => navigate('/create-configuration', {
//                                 state: {
//                                     workspaceName,
//                                     importedData,
//                                     returnTo: '/create-workspace'
//                                 }
//                             })}
//                         >
//                             Create New Configuration
//                         </button>
//                     </div>
//
//                     <div className="configurations-list">
//                         <h3>Select an Existing Configuration:</h3>
//                         {configurations.length === 0 && <p>Loading configurations...</p>}
//                         <ul>
//                             {configurations.map(cfg => (
//                                 <li
//                                     key={cfg.id}
//                                     className={cfg.id === selectedConfigId ? 'selected-config' : ''}
//                                     onClick={() => setSelectedConfigId(cfg.id)}
//                                 >
//                                     {cfg.name || `Configuration #${cfg.id}`}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//
//                     {selectedConfigId && (
//                         <div className="metrics-selection">
//                             <h3>Metrics in this Configuration:</h3>
//                             <div className="metrics-grid">
//                                 {metrics.map(metric => (
//                                     <div key={metric.id} className="metric-card">
//                                         <h4>{metric.name}</h4>
//                                         <p>{metric.description}</p>
//                                         <select value={metric.scale || '1-5'} disabled>
//                                             <option value="1-5">1 to 5</option>
//                                             <option value="0-1">0 or 1</option>
//                                         </select>
//                                     </div>
//                                 ))}
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={handleStartEditing}
//                                 className="secondary-button"
//                             >
//                                 Edit and Save as New
//                             </button>
//                         </div>
//                     )}
//
//                     <div className="form-actions" style={{ marginTop: '20px' }}>
//                         <button
//                             type="button"
//                             className="secondary-button"
//                             onClick={() => navigate(-1)}
//                         >
//                             Back
//                         </button>
//                         <button type="submit" className="primary-button">
//                             Create Workspace
//                         </button>
//                     </div>
//                 </form>
//
//                 {showSuccessModal && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Workspace Successfully Created!</h3>
//                             <button onClick={handleContinue} className="primary-button">Continue to Evaluation</button>
//                         </div>
//                     </div>
//                 )}
//
//                 {isEditModalOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content" style={{width: '600px', maxHeight: '80vh'}}>
//                             <h3>Edit and Save as New Configuration</h3>
//                             <p>Select metrics for your new configuration. The original remains unchanged.</p>
//                             <div className="metrics-grid" style={{maxHeight: '50vh', overflowY: 'auto', marginBottom: '20px'}}>
//                                 {allAvailableMetrics.map(metric => {
//                                     const isSelected = editingMetrics.some(m => m.id === metric.id);
//                                     return (
//                                         <div
//                                             key={metric.id}
//                                             className={`metric-card ${isSelected ? 'selected' : ''}`}
//                                             onClick={() => handleMetricEditToggle(metric)}
//                                         >
//                                             <input type="checkbox" readOnly checked={isSelected} />
//                                             <label>{metric.name}</label>
//                                             <p>{metric.description}</p>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                             <div className="form-actions">
//                                 <button type="button" className="secondary-button" onClick={() => setIsEditModalOpen(false)}>
//                                     Cancel
//                                 </button>
//                                 <button type="button" className="primary-button" onClick={handleSaveAsNewConfiguration}>
//                                     Save as New Configuration
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </MainLayout>
//     );
// };
//
// export default CreateWorkspacePage;
//

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
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

    // --- ADDED FOR EDIT FUNCTIONALITY ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allAvailableMetrics, setAllAvailableMetrics] = useState([]);
    const [editingMetrics, setEditingMetrics] = useState([]);
    // --- END ---

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
        // Use the metrics associated with the created workspace's configuration
        const metricsForEval = createdWorkspace.configuration?.metrics || metrics;
        navigate('/evaluate', { state: { workspace: createdWorkspace, selectedMetrics: formatMetricsForEvaluation(metricsForEval) } });
    };

    // --- HANDLERS FOR EDIT FUNCTIONALITY ---
    const handleStartEditing = () => {
        if (!selectedConfigId) return;
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                setAllAvailableMetrics(data);
                setEditingMetrics(metrics); // Pre-populate with current metrics
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

    // This function saves the edited metrics as a new configuration
    // AND creates a new workspace with it in a single flow.
    const handleSaveAsNewConfiguration = async () => {
        if (!workspaceName.trim()) {
            return alert("Please enter a workspace name first, as it's used to name the new configuration.");
        }
        if (editingMetrics.length === 0) {
            return alert("A configuration must have at least one metric.");
        }

        const newConfigName = `${workspaceName.trim()} - Custom Config`;

        // This payload assumes a backend endpoint that can create a configuration
        // and a workspace in one transaction for a smoother user experience.
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
            // This endpoint creates a new config and a workspace, returning the workspace object.
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

            // Update UI with the new data
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
    // --- END ---

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
                            onClick={() => navigate('/create-configuration', { state: { workspaceName, importedData, returnTo: '/create-workspace' } })}>
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

                {/* --- EDIT CONFIGURATION MODAL --- */}
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
                            <div className="form-actions">
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
                {/* --- END MODAL --- */}
            </div>
        </MainLayout>
    );
};

export default CreateWorkspacePage;
