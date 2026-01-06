import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyAPI, questionAPI } from '../../services/api';
import PreviewNavigation from './PreviewNavigation';
import QuestionRenderer from './QuestionRenderer';

const SurveyPreview = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [availableLanguages, setAvailableLanguages] = useState(['English']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    loadSurveyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  useEffect(() => {
    if (currentQuestionIndex >= questions.length && questions.length > 0) {
      setCurrentQuestionIndex(0);
    }
  }, [currentQuestionIndex, questions.length]);

  const parseAvailableLanguages = (mediums) => {
    if (Array.isArray(mediums)) {
      return mediums.map((lang) => lang.trim()).filter(Boolean);
    }
    if (typeof mediums === 'string') {
      return mediums.split(',').map((lang) => lang.trim()).filter(Boolean);
    }
    return ['English'];
  };

  const sortQuestions = (list) => {
    return [...list].sort((a, b) => {
      const aIsChild = a.questionId?.includes('.');
      const bIsChild = b.questionId?.includes('.');

      if (aIsChild && !bIsChild) return 1;
      if (!aIsChild && bIsChild) return -1;

      const aNum = parseFloat(String(a.questionId || '').replace('Q', ''));
      const bNum = parseFloat(String(b.questionId || '').replace('Q', ''));
      return aNum - bNum;
    });
  };

  const loadSurveyData = async () => {
    try {
      setLoading(true);
      const surveyData = await surveyAPI.getById(surveyId);
      const questionsData = await questionAPI.getAll(surveyId);
      
      setSurvey(surveyData);
      setQuestions(sortQuestions(questionsData));

      const languages = parseAvailableLanguages(surveyData.availableMediums);
      setAvailableLanguages(languages.length > 0 ? languages : ['English']);
      setSelectedLanguage((prev) => (languages.includes(prev) ? prev : (languages[0] || 'English')));
      
      setError(null);
    } catch (err) {
      setError('Failed to load survey data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading preview...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate(`/surveys/${surveyId}/questions`)}>
          Back to Questions
        </button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="empty-state">
        <p>No questions available for preview</p>
        <button className="btn btn-primary" onClick={() => navigate(`/surveys/${surveyId}/questions`)}>
          Back to Questions
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const effectiveLanguage = availableLanguages.includes(selectedLanguage)
    ? selectedLanguage
    : (availableLanguages[0] || 'English');

  return (
    <div className="survey-preview-container">
      <div className="preview-header">
        <div className="preview-title-section">
          <h1>{survey?.surveyName || 'Survey Preview'}</h1>
          <p className="preview-description">{survey?.surveyDescription || ''}</p>
        </div>
        
        <div className="preview-controls">
          {availableLanguages.length > 1 && (
            <div className="language-selector">
              <label>Preview Language: </label>
              <select 
                value={effectiveLanguage} 
                onChange={handleLanguageChange}
                className="language-dropdown"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/surveys/${surveyId}/questions`)}
          >
            Back to Questions
          </button>
        </div>
      </div>

      <PreviewNavigation
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        onNavigate={handleNavigate}
        questions={questions}
      />

      <div className="preview-content">
        <QuestionRenderer 
          question={currentQuestion} 
          language={effectiveLanguage}
        />
      </div>
    </div>
  );
};

export default SurveyPreview;
