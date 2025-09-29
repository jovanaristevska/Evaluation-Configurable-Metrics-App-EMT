import './App.css';
import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EvaluationPage from "./pages/EvaluationPage";
import CreateWorkspacePage from "./pages/CreateWorkspacePage";
import CreateConfigurationPage from "./pages/CreateConfigurationPage";
import ChooseWorkspacePage from "./pages/ChooseWorkspacePage";
import GenerateWorkspacePage from "./pages/GenerateWorkspacePage";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
            <Route path="/choose-workspace" element={<ChooseWorkspacePage />} />
          <Route path="/create-workspace" element={<CreateWorkspacePage />} />
          <Route path="/select-workspace" element={<LandingPage />} />
            <Route path="/generate-workspace" element={<GenerateWorkspacePage />} />
          <Route path="/evaluate" element={<EvaluationPage />} />
            <Route path="/create-configuration" element={<CreateConfigurationPage />} />
        </Routes>
      </Router>
  );
}

export default App;
