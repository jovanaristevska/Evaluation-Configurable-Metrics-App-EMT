import React from 'react';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    return (
        <div className="app-container">
            <main className="app-content">
                {children}
            </main>

        </div>
    );
};

export default MainLayout;

