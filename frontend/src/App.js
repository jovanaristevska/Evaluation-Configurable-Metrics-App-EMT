import './App.css';
import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EvaluationPage from "./pages/EvaluationPage";
import CreateWork from "./pages/CreateWork";
import CreateConfigurationPage from "./pages/CreateConfigurationPage";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create-workspace" element={<CreateWork />} />
          <Route path="/select-workspace" element={<LandingPage />} />
          <Route path="/evaluate" element={<EvaluationPage />} />
            <Route path="/create-configuration" element={<CreateConfigurationPage />} />
        </Routes>
      </Router>
  );
}

export default App;
