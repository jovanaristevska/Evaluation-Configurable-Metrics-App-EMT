// // import React, {useState} from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import MainLayout from '../components/layout/MainLayout';
// // import './css/LandingPage.css';
// //
// // const ChooseWorkspacePage = () => {
// //     const navigate = useNavigate();
// //
// //     const handleCreateWorkspace = () => {
// //         navigate('/create-workspace');
// //     };
// //
// //     const handleGenerateWorkspace = () => {
// //         navigate('/generate-workspace');
// //     };
// //
// //     return (
// //         <MainLayout>
// //             <div className="landing-container">
// //
// //                 <div className="workspace-options">
// //                     <div className="option-card" onClick={handleCreateWorkspace}>
// //                         <button className="primary-button">Create Workspace with your metrics</button>
// //                     </div>
// //
// //                     <div className="option-card" onClick={handleGenerateWorkspace}>
// //                         <button className="primary-button">Create Workspace with generated metrics</button>
// //                     </div>
// //                 </div>
// //             </div>
// //         </MainLayout>
// //     );
// // };
// //
// // export default ChooseWorkspacePage;
// //
// //
//
//
// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import MainLayout from '../components/layout/MainLayout';
// // import './css/LandingPage.css';
// //
// // const ChooseWorkspacePage = () => {
// //     const navigate = useNavigate();
// //     // Add state for imported data and errors
// //     const [importedData, setImportedData] = useState(null);
// //     const [jsonError, setJsonError] = useState(null);
// //
// //     // Function to handle the JSON file import
// //     const handleJsonImport = async (e) => {
// //         const file = e.target.files[0];
// //         if (!file) return;
// //
// //         if (file.type !== "application/json") {
// //             setJsonError("Please choose a JSON file.");
// //             setImportedData(null);
// //             return;
// //         }
// //
// //         try {
// //             const text = await file.text();
// //             const data = JSON.parse(text);
// //
// //             if (!data.entries || !Array.isArray(data.entries)) {
// //                 setJsonError("Invalid JSON format: missing 'entries' array.");
// //                 setImportedData(null);
// //                 return;
// //             }
// //
// //             setImportedData(data);
// //             setJsonError(null); // Clear any previous errors
// //             alert(`JSON imported successfully! Found ${data.entries.length} questions.`);
// //         } catch (err) {
// //             console.error(err);
// //             setJsonError("Error parsing JSON file.");
// //             setImportedData(null);
// //         }
// //     };
// //
// //     const handleNavigate = (path) => {
// //         if (!importedData) {
// //             alert("Please import a JSON file first.");
// //             return;
// //         }
// //         navigate(path, { state: { importedData: importedData } });
// //     };
// //
// //     return (
// //         <MainLayout>
// //             <div className="landing-container">
// //
// //                 {/* Add the JSON import section here */}
// //                 <div className="form-group" style={{ marginBottom: '2rem' }}>
// //                     <label htmlFor="json-upload">Import Questions and Answers (JSON)</label>
// //                     <input
// //                         id="json-upload"
// //                         type="file"
// //                         accept=".json"
// //                         onChange={handleJsonImport}
// //                     />
// //                     {jsonError && <p style={{ color: 'red' }}>{jsonError}</p>}
// //                 </div>
// //
// //                 <div className="workspace-options">
// //                     <div className="option-card" onClick={() => handleNavigate('/create-workspace')}>
// //                         <button className="primary-button">Create Workspace with your metrics</button>
// //                     </div>
// //                     <div className="option-card" onClick={() => handleNavigate('/generate-workspace')}>
// //                         <button className="primary-button">Create Workspace with generated metrics</button>
// //                     </div>
// //                 </div>
// //             </div>
// //         </MainLayout>
// //     );
// // };
// //
// // export default ChooseWorkspacePage;
//
// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import './css/LandingPage.css'; // Assuming you have this CSS file
// import '../App.css'; // Use the global stylesheet
//
// const ChooseWorkspacePage = () => {
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null); // To trigger the file input
//
//     // State for managing the imported file and any errors
//     const [importedData, setImportedData] = useState(null);
//     const [fileName, setFileName] = useState('');
//     const [jsonError, setJsonError] = useState(null);
//     const [importSuccess, setImportSuccess] = useState(false);
//
//     // Handles the file selection and validation
//     const handleFileChange = async (e) => {
//         const file = e.target.files[0];
//         setImportSuccess(false); // Reset success message on new file selection
//
//         if (!file) {
//             setFileName('');
//             setImportedData(null);
//             return;
//         }
//
//         if (file.type !== "application/json") {
//             setJsonError("Invalid file type. Please choose a JSON file.");
//             setFileName('');
//             setImportedData(null);
//             return;
//         }
//
//         try {
//             const text = await file.text();
//             const data = JSON.parse(text);
//
//             if (!data.entries || !Array.isArray(data.entries)) {
//                 setJsonError("Invalid JSON format: The file must contain an 'entries' array.");
//                 setFileName('');
//                 setImportedData(null);
//                 return;
//             }
//
//             // Success!
//             setImportedData(data);
//             setFileName(file.name);
//             setJsonError(null);
//             setImportSuccess(true); // Show success message
//         } catch (err) {
//             console.error("JSON parsing error:", err);
//             setJsonError("Error parsing the JSON file. Please check its format.");
//             setFileName('');
//             setImportedData(null);
//         }
//     };
//
//     // Navigates to the next page, passing the imported data
//     const handleNavigate = (path) => {
//         if (!importedData) {
//             alert("Please import a valid JSON file first.");
//             return;
//         }
//         navigate(path, { state: { importedData } });
//     };
//
//     // Triggers the hidden file input
//     const handleImportClick = () => {
//         fileInputRef.current.click();
//     };
//
//     return (
//         <MainLayout>
//             <div className="landing-container">
//
//                 {/* --- Improved File Import Section --- */}
//                 <div className="import-section">
//                     <input
//                         id="json-upload"
//                         type="file"
//                         accept=".json"
//                         ref={fileInputRef}
//                         onChange={handleFileChange}
//                         style={{ display: 'none' }} // Hide the default input
//                     />
//                     <button onClick={handleImportClick} className="import-button">
//                         Import Questions & Answers (.json)
//                     </button>
//
//                     {/* Feedback messages for the user */}
//                     <div className="import-feedback">
//                         {fileName && !jsonError && (
//                             <p className="file-name">File: <strong>{fileName}</strong></p>
//                         )}
//                         {importSuccess && (
//                             <p className="success-message">
//                                 Successfully imported {importedData.entries.length} entries!
//                             </p>
//                         )}
//                         {jsonError && (
//                             <p className="error-message">{jsonError}</p>
//                         )}
//                     </div>
//                 </div>
//
//                 {/* --- Workspace Options --- */}
//                 <div className="workspace-options">
//                     <div className="option-card">
//                         <button
//                             className="primary-button"
//                             onClick={() => handleNavigate('/create-workspace')}
//                            // disabled={!importedData} // Disable button if no data
//                         >
//                             Create Workspace with your metrics
//                         </button>
//                     </div>
//                     <div className="option-card">
//                         <button
//                             className="primary-button"
//                             onClick={() => handleNavigate('/generate-workspace')}
//                             //disabled={!importedData} // Disable button if no data
//                         >
//                             Create Workspace with generated metrics
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </MainLayout>
//     );
// };
//
// export default ChooseWorkspacePage;


// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import './css/LandingPage.css';
// import '../App.css';
//
// const ChooseWorkspacePage = () => {
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null);
//
//     const [importedData, setImportedData] = useState(null);
//     const [fileName, setFileName] = useState('');
//     const [jsonError, setJsonError] = useState(null);
//     const [importSuccess, setImportSuccess] = useState(false);
//
//     const handleFileChange = async (e) => {
//         const file = e.target.files[0];
//         setImportSuccess(false);
//
//         if (!file) {
//             setFileName('');
//             setImportedData(null);
//             return;
//         }
//
//         if (file.type !== "application/json") {
//             setJsonError("Invalid file type. Please choose a JSON file.");
//             setFileName('');
//             setImportedData(null);
//             return;
//         }
//
//         try {
//             const text = await file.text();
//             const data = JSON.parse(text);
//
//             if (!data.entries || !Array.isArray(data.entries)) {
//                 setJsonError("Invalid JSON format: The file must contain an 'entries' array.");
//                 setFileName('');
//                 setImportedData(null);
//                 return;
//             }
//
//             setImportedData(data);
//             setFileName(file.name);
//             setJsonError(null);
//             setImportSuccess(true);
//         } catch (err) {
//             console.error("JSON parsing error:", err);
//             setJsonError("Error parsing the JSON file. Please check its format.");
//             setFileName('');
//             setImportedData(null);
//         }
//     };
//
//     const handleNavigate = (path) => {
//         if (!importedData) {
//             alert("Please import a valid JSON file first.");
//             return;
//         }
//         navigate(path, { state: { importedData } });
//     };
//
//     const handleImportClick = () => {
//         fileInputRef.current.click();
//     };
//
//     return (
//         <MainLayout>
//             <div className="choose-container">
//
//                 {/* --- File Import Section --- */}
//                 <div className="import-section">
//                     <p className="instruction-text">
//                         Please insert a JSON file to begin.
//                     </p>
//                     <input
//                         id="json-upload"
//                         type="file"
//                         accept=".json"
//                         ref={fileInputRef}
//                         onChange={handleFileChange}
//                         style={{ display: 'none' }}
//                     />
//                     {/* --- THIS IS THE ONLY CHANGE --- */}
//                     <button onClick={handleImportClick} className="import-button">
//                         Choose a JSON File
//                     </button>
//                     {/* ----------------------------- */}
//
//                     <div className="import-feedback">
//                         {/*{fileName && !jsonError && (*/}
//                         {/*    <p className="file-name">File: <strong>{fileName}</strong></p>*/}
//                         {/*)}*/}
//                         {importSuccess && (
//                             <p className="success-message">
//                                 Successfully imported {importedData.entries.length} entries!
//                             </p>
//                         )}
//                         {jsonError && (
//                             <p className="error-message">{jsonError}</p>
//                         )}
//                     </div>
//                 </div>
//
//                 {/* --- Workspace Options --- */}
//                 <div className="choose-options">
//                     <div className="choose-card">
//                         <button
//                             className="primary-button"
//                             onClick={() => handleNavigate('/create-workspace')}
//                         >
//                             Create Workspace with your metrics
//                         </button>
//                     </div>
//                     <div className="choose-card">
//                         <button
//                             className="primary-button"
//                             onClick={() => handleNavigate('/generate-workspace')}
//                         >
//                             Create Workspace with generated metrics
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </MainLayout>
//     );
// };
//
// export default ChooseWorkspacePage;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/LandingPage.css';
import '../App.css';

const ChooseWorkspacePage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // ... (all your existing handler functions like handleFileChange, handleNavigate, etc. remain the same)
    const [importedData, setImportedData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [jsonError, setJsonError] = useState(null);
    const [importSuccess, setImportSuccess] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setImportSuccess(false);

        if (!file) {
            setFileName('');
            setImportedData(null);
            return;
        }

        if (file.type !== "application/json") {
            setJsonError("Invalid file type. Please choose a JSON file.");
            setFileName('');
            setImportedData(null);
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.entries || !Array.isArray(data.entries)) {
                setJsonError("Invalid JSON format: The file must contain an 'entries' array.");
                setFileName('');
                setImportedData(null);
                return;
            }

            setImportedData(data);
            setFileName(file.name);
            setJsonError(null);
            setImportSuccess(true);
        } catch (err) {
            console.error("JSON parsing error:", err);
            setJsonError("Error parsing the JSON file. Please check its format.");
            setFileName('');
            setImportedData(null);
        }
    };

    const handleNavigate = (path) => {
        if (!importedData) {
            alert("Please import a valid JSON file first.");
            return;
        }
        navigate(path, { state: { importedData } });
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };


    return (
        <MainLayout>
            <div className="choose-container">

                {/* --- File Import Section --- */}
                <div className="import-section">
                    <p className="instruction-text">
                        Please insert a JSON file to begin.
                    </p>
                    <input
                        id="json-upload"
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <button onClick={handleImportClick} className="import-button">
                        Choose a JSON File
                    </button>
                    <div className="import-feedback">
                        {importSuccess && (
                            <p className="success-message">
                                Successfully imported {importedData.entries.length} entries!
                            </p>
                        )}
                        {jsonError && (
                            <p className="error-message">{jsonError}</p>
                        )}
                    </div>
                </div>

                {/* --- UPDATED Workspace Options --- */}
                <div className="choose-options">
                    {/* The onClick is now on the div, and the button is replaced with a span */}
                    <div className="choose-card" onClick={() => handleNavigate('/create-workspace')}>
                        <span className="card-action-text">
                            Create Workspace with your metrics
                        </span>
                    </div>
                    <div className="choose-card" onClick={() => handleNavigate('/generate-workspace')}>
                        <span className="card-action-text">
                            Create Workspace with generated metrics
                        </span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ChooseWorkspacePage;
