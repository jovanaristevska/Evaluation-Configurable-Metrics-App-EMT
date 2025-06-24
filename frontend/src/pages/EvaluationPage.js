import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/EvaluationPage.css';

const EvaluationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [metricValues, setMetricValues] = useState({});
    const [comments, setComments] = useState('');
    const [autoFillEnabled, setAutoFillEnabled] = useState(true);

    const { workspace, selectedMetrics } = location.state || {};

    useEffect(() => {
        if (!workspace || !selectedMetrics || Object.keys(selectedMetrics).length === 0) {
            navigate('/create-workspace');
        }
    }, [workspace, selectedMetrics, navigate]);

    const sortedMetrics = workspace && selectedMetrics ?
        Object.entries(selectedMetrics).sort((a, b) => {
            const rankA = a[1].importanceRank || 999;
            const rankB = b[1].importanceRank || 999;
            return rankA - rankB;
        }) : [];

    const mostImportantMetricId = sortedMetrics.length > 0 ? sortedMetrics[0][0] : null;
    const isMostImportantEvaluated = mostImportantMetricId ? metricValues[mostImportantMetricId] !== undefined : false;

    const preFillRules = {
        1: {'Clarity': 1, 'Comprehensiveness': 1, 'Bias': 1, 'Relevance': 1, 'Empathy': 1, 'Harm': 1, 'Understanding': 1, 'Currency': 1, 'Reasoning': 1, 'Factuality Verification': 1},
        2: {'Clarity': 2, 'Comprehensiveness': 2, 'Bias': 1, 'Relevance': 2, 'Empathy': 1, 'Harm': 1, 'Understanding': 2, 'Currency': 1, 'Reasoning': 2, 'Factuality Verification': 1},
        3: {'Clarity': 3, 'Comprehensiveness': 3, 'Bias': 2, 'Relevance': 3, 'Empathy': 2, 'Harm': 2, 'Understanding': 3, 'Currency': 2, 'Reasoning': 3, 'Factuality Verification': 2},
        4: {'Clarity': 4, 'Comprehensiveness': 4, 'Bias': 3, 'Relevance': 4, 'Empathy': 3, 'Harm': 2, 'Understanding': 4, 'Currency': 3, 'Reasoning': 4, 'Factuality Verification': 3},
        5: {'Clarity': 5, 'Comprehensiveness': 5, 'Bias': 4, 'Relevance': 5, 'Empathy': 4, 'Harm': 3, 'Understanding': 5, 'Currency': 4, 'Reasoning': 5, 'Factuality Verification': 4}
    };

    const handleMetricChange = (metricId, value) => {
        const newValues = {
            ...metricValues,
            [metricId]: value
        };

        if (autoFillEnabled && metricId === mostImportantMetricId) {
            const mostImportantMetricName = sortedMetrics[0][1].metric.name;

            sortedMetrics.forEach(([id, data]) => {
                if (id !== metricId) {
                    const metricName = data.metric.name;
                    const preFillValue = preFillRules[value]?.[metricName];

                    if (preFillValue !== undefined) {
                        newValues[id] = preFillValue;
                    }
                }
            });
        }

        setMetricValues(newValues);
    };

    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };

    if (!workspace || !selectedMetrics) {
        return <div>Loading...</div>;
    }

    return (
        <MainLayout>
            <div className="evaluation-container">
                <h2>Evaluate: {workspace.name}</h2>

                <div className="question-answer-section">
                    <div className="question-container">
                        <h3>Question:</h3>
                        <p>{workspace.question || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}</p>
                    </div>

                    <div className="answer-container">
                        <h3>Answer:</h3>
                        <p>{workspace.answer || "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}</p>
                    </div>
                </div>

                <form>
                    <div className="metrics-evaluation">
                        {sortedMetrics.map(([metricId, metricData], index) => {
                            const metric = metricData.metric;
                            const scale = metricData.scale;
                            const isImportant = index === 0;
                            const disabled = !isImportant && !isMostImportantEvaluated;

                            return (
                                <div
                                    key={metricId}
                                    className={`metric-evaluation-card ${isImportant ? 'important-metric' : ''} ${disabled ? 'disabled-metric' : ''}`}
                                >
                                    {isImportant && <div className="importance-badge">Most Important</div>}
                                    <h3>{metric.name}</h3>
                                    <p>{metric.description}</p>

                                    <div className="rating-scale">
                                        {scale === '0-1' ? (
                                            <div className="binary-scale">
                                                <label className={disabled ? 'disabled' : ''}>
                                                    <input
                                                        type="radio"
                                                        name={`metric-${metricId}`}
                                                        value="0"
                                                        checked={metricValues[metricId] === 0}
                                                        onChange={() => handleMetricChange(metricId, 0)}
                                                        required
                                                        disabled={disabled}
                                                    />
                                                    No (0)
                                                </label>
                                                <label className={disabled ? 'disabled' : ''}>
                                                    <input
                                                        type="radio"
                                                        name={`metric-${metricId}`}
                                                        value="1"
                                                        checked={metricValues[metricId] === 1}
                                                        onChange={() => handleMetricChange(metricId, 1)}
                                                        disabled={disabled}
                                                    />
                                                    Yes (1)
                                                </label>
                                            </div>
                                        ) : (

                                            <div className="numeric-scale">
                                                {[1, 2, 3, 4, 5].map(value => (
                                                    <label key={value} className={disabled ? 'disabled' : ''}>
                                                        <input
                                                            type="radio"
                                                            name={`metric-${metricId}`}
                                                            value={value}
                                                            checked={metricValues[metricId] === value}
                                                            onChange={() => handleMetricChange(metricId, value)}
                                                            required
                                                            disabled={disabled}
                                                        />
                                                        {value}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="form-group">
                        <label htmlFor="comments">Additional Comments</label>
                        <textarea
                            id="comments"
                            value={comments}
                            onChange={handleCommentsChange}
                            rows={4}
                            placeholder="Enter any additional comments or observations..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
                            Back
                        </button>
                        <button type="submit" className="primary-button">
                            Submit Evaluation
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default EvaluationPage;
