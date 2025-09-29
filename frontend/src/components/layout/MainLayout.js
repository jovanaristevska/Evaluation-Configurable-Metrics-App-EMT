import React from 'react';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    return (
        <div className="app-container">
            <header className="app-header" style={{height: '30px'}}></header>
            <main className="app-content">
                {children}
            </main>
            <footer className="app-footer" style={{height: '30px'}}>
                <p>© 2025 Evaluation Application</p>
            </footer>
        </div>
    );
};

export default MainLayout;

