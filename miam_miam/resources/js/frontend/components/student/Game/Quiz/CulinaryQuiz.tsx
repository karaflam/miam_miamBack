import React, { useState, useEffect } from 'react';
import './CulinaryQuizScoped.css';
import { Question, getRandomQuestions } from './QuizQuestions';

interface QuizState {
  currentQuestion: number;
  score: number;
  answered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  quizCompleted: boolean;
  timeLeft: number;
  questions: Question[];
}

// Les questions sont maintenant importées depuis QuizQuestions.ts

interface CulinaryQuizProps {
  onComplete?: (points: number) => void;
}

const CulinaryQuiz: React.FC<CulinaryQuizProps> = ({ onComplete }) => {
  // Initialiser avec 10 questions aléatoires
  const [quizState, setQuizState] = useState<QuizState>(() => ({
    currentQuestion: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    isCorrect: null,
    quizCompleted: false,
    timeLeft: 30,
    questions: getRandomQuestions(10)
  }));

  // Timer pour chaque question
  useEffect(() => {
    if (quizState.quizCompleted || quizState.answered) return;

    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeLeft <= 1) {
          // Temps écoulé, passer à la question suivante
          return {
            ...prev,
            timeLeft: 0,
            answered: true,
            isCorrect: false
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.currentQuestion, quizState.answered, quizState.quizCompleted]);

  const handleAnswerClick = (answerIndex: number) => {
    if (quizState.answered) return;

    const currentQ = quizState.questions[quizState.currentQuestion];
    const correct = answerIndex === currentQ.correctAnswer;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      answered: true,
      isCorrect: correct,
      score: correct ? prev.score + 1 : prev.score
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
        timeLeft: 30
      }));
    } else {
      // Quiz terminé, calculer les points
      const finalScore = quizState.score + (quizState.isCorrect ? 1 : 0);
      let pointsFidelite = 0;
      
      if (finalScore > 5) {
        pointsFidelite = 2;
      } else if (finalScore === 5) {
        pointsFidelite = 1;
      }
      
      setQuizState(prev => ({ ...prev, quizCompleted: true }));
      
      if (onComplete) {
        onComplete(pointsFidelite);
      }
      
      // Synchroniser avec le backend
      if (pointsFidelite > 0) {
        synchroniserPointsFidelite(pointsFidelite, finalScore);
      }
      
      // Afficher un message récapitulatif
      setTimeout(() => {
        const percentage = (finalScore / 10) * 100;
        let message = `🎮 Quiz terminé!\n\n`;
        message += `📊 Score: ${finalScore}/10 (${percentage}%)\n`;
        message += `⭐ Points de fidélité gagnés: ${pointsFidelite}\n\n`;
        
        if (pointsFidelite === 2) {
          message += `🎉 Excellent! Vous êtes un expert de la cuisine sénégalaise!\n✅ +2 points ajoutés à votre compte!`;
        } else if (pointsFidelite === 1) {
          message += `👍 Bien joué! Vous connaissez la cuisine sénégalaise!\n✅ +1 point ajouté à votre compte!`;
        } else {
          message += `💡 Continuez à apprendre! Venez goûter nos plats pour découvrir plus sur notre cuisine!`;
        }
        
        alert(message);
      }, 500);
    }
  };

  // Fonction pour synchroniser les points avec le backend
  const synchroniserPointsFidelite = async (points: number, score: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/student/points/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          points: points,
          source: 'quiz',
          score: score
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur lors de la synchronisation des points:', response.status, errorData);
        
        if (response.status === 401) {
          console.error('Session expirée. Veuillez vous reconnecter.');
        }
      } else {
        const data = await response.json();
        console.log('Points synchronisés avec succès:', data);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  const handleRestart = () => {
    setQuizState({
      currentQuestion: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
      quizCompleted: false,
      timeLeft: 30,
      questions: getRandomQuestions(10) // Nouvelles questions aléatoires
    });
  };

  const currentQuestion = quizState.questions[quizState.currentQuestion];
  const progress = ((quizState.currentQuestion + 1) / quizState.questions.length) * 100;

  if (quizState.quizCompleted) {
    const percentage = (quizState.score / quizState.questions.length) * 100;
    const pointsFidelite = quizState.score > 5 ? 2 : quizState.score === 5 ? 1 : 0;
    
    return (
      <div className="culinary-quiz">
        <div className="quiz-container">
        <div className="quiz-completed">
          <div className="completion-icon">
            {quizState.score > 5 ? '🎉' : quizState.score === 5 ? '👍' : '📚'}
          </div>
          <h2>Quiz Terminé !</h2>
          <div className="final-score">
            <div className="score-item">
              <span className="score-label">Score</span>
              <span className="score-value">{quizState.score}/{quizState.questions.length}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Pourcentage</span>
              <span className="score-value">{percentage.toFixed(0)}%</span>
            </div>
            <div className="score-item highlight">
              <span className="score-label">Points de fidélité gagnés</span>
              <span className="score-value">+{pointsFidelite} pts</span>
            </div>
          </div>
          <div className="completion-message">
            {quizState.score > 5 && "Excellent ! Vous êtes un vrai connaisseur de la cuisine sénégalaise ! +2 points 🌟"}
            {quizState.score === 5 && "Bien joué ! Vous connaissez la cuisine sénégalaise ! +1 point 👨‍🍳"}
            {quizState.score < 5 && "Pas mal ! Venez goûter nos plats pour en apprendre plus ! 🍽️"}
          </div>
          <button className="restart-button" onClick={handleRestart}>
            Recommencer le Quiz
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="culinary-quiz">
      <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <span className="question-counter">
            Question {quizState.currentQuestion + 1}/{quizState.questions.length}
          </span>
          <span className="current-score">
            Score: {quizState.score}/10
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="timer">
          <span className={`timer-value ${quizState.timeLeft <= 5 ? 'warning' : ''}`}>
            ⏱️ {quizState.timeLeft}s
          </span>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <h3 className="question-text">{currentQuestion.question}</h3>
        </div>

        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            let className = 'option-button';
            
            if (quizState.answered) {
              if (index === currentQuestion.correctAnswer) {
                className += ' correct';
              } else if (index === quizState.selectedAnswer) {
                className += ' incorrect';
              } else {
                className += ' disabled';
              }
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleAnswerClick(index)}
                disabled={quizState.answered}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {quizState.answered && index === currentQuestion.correctAnswer && (
                  <span className="check-icon">✓</span>
                )}
                {quizState.answered && index === quizState.selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <span className="cross-icon">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {quizState.answered && (
          <div className={`answer-feedback ${quizState.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              {quizState.isCorrect ? '✓' : '✗'}
            </div>
            <div className="feedback-text">
              {quizState.isCorrect 
                ? 'Bravo ! Bonne réponse !' 
                : `Dommage ! La bonne réponse était : ${currentQuestion.options[currentQuestion.correctAnswer]}`
              }
            </div>
            <button className="next-button" onClick={handleNextQuestion}>
              {quizState.currentQuestion < quizState.questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default CulinaryQuiz;
