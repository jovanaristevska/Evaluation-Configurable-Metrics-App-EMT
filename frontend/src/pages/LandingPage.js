import  React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleCreateWorkspace = () => {
        navigate('/create-workspace');
    };

    const handleSelectWorkspace = () => {
        navigate('/select-workspace');
    };

    return (
        <MainLayout>
            <div className="landing-container">
                <div className="workspace-options">
                    <div className="option-card" onClick={handleCreateWorkspace}>
                        <h3>Create New Workspace</h3>
                        <p>Configure a new evaluation workspace with custom metrics</p>
                        <button className="primary-button">Create Workspace</button>
                    </div>

                    <div className="option-card" onClick={handleSelectWorkspace}>
                        <h3>Select Existing Workspace</h3>
                        <p>Continue working with a previously created workspace</p>
                        <button className="secondary-button">Select Workspace</button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default LandingPage;
