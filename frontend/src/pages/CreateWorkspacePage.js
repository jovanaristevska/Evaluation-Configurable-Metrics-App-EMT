// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import './css/CreateWorkspacePage.css';
//
// // Sample metrics data - in a real app, you'd fetch this from your backend
// const availableMetrics = [
//     { id: 1, name: 'Accuracy', description: 'Measures factual correctness' },
//     { id: 2, name: 'Comprehensiveness', description: 'Evaluates completeness of information' },
//     { id: 3, name: 'Clarity', description: 'Assesses how clear and understandable the content is' },
//     { id: 4, name: 'Empathy', description: 'Measures emotional understanding and response' },
//     { id: 5, name: 'Bias', description: 'Evaluates presence of unfair prejudice' },
//     { id: 6, name: 'Harm', description: 'Assesses potential to cause harm' },
//     { id: 7, name: 'Understanding', description: 'Measures grasp of the subject matter' },
//     { id: 8, name: 'Relevance', description: 'Evaluates how pertinent the information is' },
//     { id: 9, name: 'Currency', description: 'Assesses if information is up-to-date' },
//     { id: 10, name: 'Reasoning', description: 'Evaluates logical thought process' },
//     { id: 11, name: 'Factuality Verification', description: 'Checks if facts can be verified' },
// ];
//
// // Define importance order for metrics
// const importanceOrder = {
//     'Accuracy': 1,
//     'Comprehensiveness': 4,
//     'Clarity': 5,
//     'Empathy': 9,
//     'Bias': 10,
//     'Harm': 11,
//     'Understanding': 6,
//     'Relevance': 7,
//     'Currency': 8,
//     'Reasoning': 3,
//     'Factuality Verification': 2
// };
//
// const CreateWorkspacePage = () => {
//     const navigate = useNavigate();
//     const [workspaceName, setWorkspaceName] = useState('');
//     const [selectedMetrics, setSelectedMetrics] = useState({});
//
//
//     const [selectedConfiguration, setSelectedConfiguration] = useState(null);
//
//     const handleMetricSelection = (metricId) => {
//         setSelectedMetrics(prev => {
//             if (prev[metricId]) {
//                 const { [metricId]: _, ...rest } = prev;
//                 return rest;
//             }
//
//             return {
//                 ...prev,
//                 [metricId]: { scale: '1-5' }
//             };
//         });
//     };
//
//     const handleScaleChange = (metricId, scale) => {
//         setSelectedMetrics(prev => ({
//             ...prev,
//             [metricId]: { ...prev[metricId], scale }
//         }));
//     };
//
//     const handleSubmit = (e) => {
//         e.preventDefault();
//
//         // Create workspace object
//         const workspaceData = {
//             name: workspaceName,
//         };
//
//         // Here you would call your API to create the workspace
//         // For now, let's simulate an API response with an ID
//         const createdWorkspace = {
//             ...workspaceData,
//             id: Date.now() // Temporary ID for demonstration
//         };
//
//         // Prepare selected metrics with full details
//         const metricsWithDetails = {};
//         Object.entries(selectedMetrics).forEach(([metricId, scaleData]) => {
//             const metric = availableMetrics.find(m => m.id.toString() === metricId);
//             if (metric) {
//                 metricsWithDetails[metricId] = {
//                     metric: metric,
//                     scale: scaleData.scale,
//                     importanceRank: importanceOrder[metric.name] || 999
//                 };
//             }
//         });
//
//         // Navigate to evaluation page with workspace and metrics data
//         navigate('/evaluate', {
//             state: {
//                 workspace: createdWorkspace,
//                 selectedMetrics: metricsWithDetails
//             }
//         });
//     };
//     return (
//         <MainLayout>
//             <div className="create-workspace-container">
//                 <h2>Create New Workspace</h2>
//
//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label htmlFor="workspace-name">Workspace Name</label>
//                         <input
//                             id="workspace-name"
//                             type="text"
//                             value={workspaceName}
//                             onChange={(e) => setWorkspaceName(e.target.value)}
//                             required
//                             placeholder="Enter workspace name"
//                         />
//                     </div>
//
//                     <div className="metrics-selection">
//                         <h3>Select Metrics for Evaluation</h3>
//                         <p>Choose which metrics you want to include in your evaluation:</p>
//
//                         <div className="metrics-grid">
//                             {availableMetrics.map(metric => (
//                                 <div
//                                     key={metric.id}
//                                     className={`metric-card ${selectedMetrics[metric.id] ? 'selected' : ''}`}
//                                     onClick={() => handleMetricSelection(metric.id)}
//                                 >
//                                     <h4>{metric.name}</h4>
//                                     <p>{metric.description}</p>
//
//                                     {selectedMetrics[metric.id] && (
//                                         <div className="scale-selector" onClick={e => e.stopPropagation()}>
//                                             <label>Rating Scale:</label>
//                                             <select
//                                                 value={selectedMetrics[metric.id].scale}
//                                                 onChange={(e) => handleScaleChange(metric.id, e.target.value)}
//                                             >
//                                                 <option value="1-5">1 to 5</option>
//                                                 <option value="0-1">0 or 1</option>
//                                             </select>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//
//                     <div className="form-actions">
//                         <button type="button" className="secondary-button" onClick={() => navigate('/')}>
//                             Cancel
//                         </button>
//                         <button type="submit" className="primary-button">
//                             Create Workspace
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </MainLayout>
//     );
// };
//
// export default CreateWorkspacePage;
