import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import './css/EvaluationPage.css';

const EvaluationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const uploadedJson = location.state?.uploadedJson;
    const { workspace, selectedMetrics, questionsAndAnswers: passedEntries } = location.state || {};

    const [questionsAndAnswers, setQuestionsAndAnswers] = useState(passedEntries || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [metricValues, setMetricValues] = useState({});
    const [comments, setComments] = useState('');
    const [autoFillEnabled, setAutoFillEnabled] = useState(true);

    useEffect(() => {
        if (!workspace) return;

        fetch(`/api/workspaces/${workspace.workspaceId}/qa`)
            .then(res => res.json())
            .then(data => {
                console.log('Questions and Answers from API:', data);
                setQuestionsAndAnswers(data);
            })
            .catch(console.error);
    }, [workspace]);

    useEffect(() => {
        if (!workspace || !selectedMetrics || Object.keys(selectedMetrics).length === 0) {
            navigate('/create-workspace');
        }
    }, [workspace, selectedMetrics, navigate]);

    const sortedMetrics = selectedMetrics
        ? Object.entries(selectedMetrics).sort((a, b) => {
            const rankA = a[1].importanceRank || 999;
            const rankB = b[1].importanceRank || 999;
            return rankA - rankB;
        })
        : [];

    const mostImportantMetricId = sortedMetrics.length > 0 ? sortedMetrics[0][0] : null;

    const isMostImportantEvaluated = mostImportantMetricId
        ? metricValues[currentIndex]?.[mostImportantMetricId] !== undefined
        : false;

    const generatePreFillValues = (value) => {
        const result = {};
        sortedMetrics.forEach(([id]) => {
            if (id !== mostImportantMetricId) {
                result[id] = value;
            }
        });
        return result;
    };

    const handleMetricChange = (metricId, value) => {
        setMetricValues((prev) => {
            const currentQuestionMetrics = prev[currentIndex] || {};
            let newMetrics = { ...currentQuestionMetrics, [metricId]: value };

            if (autoFillEnabled && metricId === mostImportantMetricId) {
                const preFillValues = generatePreFillValues(value);
                newMetrics = { ...newMetrics, ...preFillValues };
            }

            return { ...prev, [currentIndex]: newMetrics };
        });
    };

    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };

    const goNext = () => {
        if (currentIndex < questionsAndAnswers.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setComments('');
        }
    };

    const goPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setComments('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting evaluations:', metricValues);
        alert('Evaluation submitted!');
        navigate('/');
    };

    if (!workspace || !selectedMetrics) {
        return <div>Loading...</div>;
    }

    if (questionsAndAnswers.length === 0) {
        return <div>Loading questions...</div>;
    }

    const currentQA = questionsAndAnswers[currentIndex] || {};
    const currentMetricsValues = metricValues[currentIndex] || {};

    return (
        <MainLayout>
            <div className="evaluation-container">
                <h2>Evaluate Workspace: {workspace.name}</h2>

                <div className="question-answer-section">
                    <div className="question-container">
                        <h3>Question {currentIndex + 1}:</h3>
                        <p>{currentQA.question || 'No question text available.'}</p>
                    </div>

                    <div className="answer-container">
                        <h3>Answer:</h3>
                        <p>{currentQA.answer || 'No answer text available.'}</p>
                    </div>

                    <div className="answer-container">
                        <h3>Model:</h3>
                        <p>{currentQA.model || 'No model available.'}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="metrics-evaluation">
                        {sortedMetrics.map(([metricId, metricData], index) => {
                            const metric = metricData.metric;
                            const scale = metricData.scale;
                            const isImportant = index === 0;
                            const disabled = !isImportant && !isMostImportantEvaluated;

                            return (
                                <div
                                    key={metricId}
                                    className={`metric-evaluation-card ${isImportant ? 'important-metric' : ''} ${
                                        disabled ? 'disabled-metric' : ''
                                    }`}
                                >
                                    {isImportant && <div className="importance-badge">Most Important</div>}

                                    <h3>{metric.name}</h3>
                                    <p>{metric.description}</p>

                                    <div className="rating-scale">
                                        {scale === '0-1' ? (
                                            <div className="binary-scale">
                                                {[0, 1].map((val) => (
                                                    <label key={val} className={disabled ? 'disabled' : ''}>
                                                        <input
                                                            type="radio"
                                                            name={`metric-${metricId}`}
                                                            value={val}
                                                            checked={currentMetricsValues[metricId] === val}
                                                            onChange={() => handleMetricChange(metricId, val)}
                                                            disabled={disabled}
                                                            required={isImportant}
                                                        />
                                                        <span>{val === 1 ? 'Yes (1)' : 'No (0)'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="numeric-scale">
                                                {[1, 2, 3, 4, 5].map((val) => (
                                                    <label key={val} className={disabled ? 'disabled' : ''}>
                                                        <input
                                                            type="radio"
                                                            name={`metric-${metricId}`}
                                                            value={val}
                                                            checked={currentMetricsValues[metricId] === val}
                                                            onChange={() => handleMetricChange(metricId, val)}
                                                            disabled={disabled}
                                                            required={isImportant}
                                                        />
                                                        {val}
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
                        <button
                            type="button"
                            onClick={goPrevious}
                            disabled={currentIndex === 0}
                            className="secondary-button"
                        >
                            Previous
                        </button>

                        {currentIndex < questionsAndAnswers.length - 1 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!isMostImportantEvaluated}
                                className="primary-button"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!isMostImportantEvaluated}
                                className="primary-button"
                            >
                                Submit Evaluation
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default EvaluationPage;