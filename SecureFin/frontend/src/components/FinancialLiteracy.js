import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FinancialLiteracy.css';

function FinancialLiteracy() {
  const [view, setView] = useState('home');
  const [quizzes, setQuizzes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiteracyContent();
  }, []);

  const fetchLiteracyContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [quizzesRes, articlesRes, progressRes] = await Promise.all([
        axios.get('http://localhost:5000/api/literacy/quizzes', { headers }),
        axios.get('http://localhost:5000/api/literacy/articles', { headers }),
        axios.get('http://localhost:5000/api/literacy/progress', { headers }),
      ]);

      setQuizzes(quizzesRes.data);
      setArticles(articlesRes.data);
      setProgress(progressRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching literacy content:', error);
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/literacy/quizzes/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSelectedQuiz(response.data);
      setCurrentQuestion(0);
      setAnswers(new Array(response.data.questions.length).fill(-1));
      setView('quiz');
    } catch (error) {
      alert('Error loading quiz: ' + error.response?.data?.error);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/literacy/quizzes/${selectedQuiz.id}/submit`,
        { answers },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert(`Quiz completed! Score: ${response.data.score}%`);
      setView('home');
      setSelectedQuiz(null);
      fetchLiteracyContent();
    } catch (error) {
      alert('Error submitting quiz: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="financial-literacy">
      <h1>Financial Literacy & Learning</h1>

      {view === 'home' && (
        <>
          <div className="progress-card">
            {progress && (
              <div className="progress-info">
                <h3>Your Progress</h3>
                <p>Quizzes Completed: {progress.quizzesCompleted}</p>
                <p>Articles Read: {progress.articlesRead}</p>
                <p>Total Score: {progress.totalScore} points</p>
                {progress.badges && progress.badges.length > 0 && (
                  <div className="badges">
                    <h4>Badges Earned:</h4>
                    {progress.badges.map((badge, idx) => (
                      <span key={idx} className="badge">{badge.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="content-sections">
            <div className="section">
              <h2>📚 Take a Quiz</h2>
              <p>Test your financial knowledge with interactive quizzes</p>
              <div className="quiz-list">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="quiz-card">
                    <h3>{quiz.title}</h3>
                    <p>{quiz.questionCount} questions</p>
                    <button onClick={() => startQuiz(quiz.id)}>Start Quiz</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>📖 Learning Articles</h2>
              <p>Read helpful articles on Indian financial concepts</p>
              <div className="articles-list">
                {articles.map((article) => (
                  <div key={article.id} className="article-card">
                    <h3>{article.title}</h3>
                    <p className="category">{article.category}</p>
                    <p className="preview">{article.content}</p>
                    <button>Read More</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="financial-tips">
            <h2>💡 Financial Tips for You</h2>
            <ul>
              <li><strong>Start Early with SIPs:</strong> Systematic Investment Plans help you invest regularly and build wealth over time</li>
              <li><strong>Track Your Expenses:</strong> Keep a record of all spending to identify areas where you can save</li>
              <li><strong>Emergency Fund:</strong> Save 3-6 months of expenses for unexpected situations</li>
              <li><strong>Use Government Schemes:</strong> Benefits from schemes like PM-KISAN, Sukanya Samriddhi, etc.</li>
              <li><strong>Diversify Income Sources:</strong> Don't rely on a single income stream; explore part-time opportunities</li>
              <li><strong>Digital Payments:</strong> Use UPI and digital wallets for secure and transparent transactions</li>
            </ul>
          </div>
        </>
      )}

      {view === 'quiz' && selectedQuiz && (
        <div className="quiz-container">
          <div className="quiz-header">
            <h2>{selectedQuiz.title}</h2>
            <p>Question {currentQuestion + 1} of {selectedQuiz.questions.length}</p>
          </div>

          <div className="quiz-content">
            <h3>{selectedQuiz.questions[currentQuestion].text}</h3>
            <div className="options">
              {selectedQuiz.questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option ${answers[currentQuestion] === idx ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(idx)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            {currentQuestion === selectedQuiz.questions.length - 1 ? (
              <button onClick={submitQuiz} className="submit-btn">
                Submit Quiz
              </button>
            ) : (
              <button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialLiteracy;
