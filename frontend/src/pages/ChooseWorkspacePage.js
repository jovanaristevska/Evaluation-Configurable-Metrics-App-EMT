import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/LandingPage.css';
import '../App.css';

const ChooseWorkspacePage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

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

                <div className="choose-options">
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
