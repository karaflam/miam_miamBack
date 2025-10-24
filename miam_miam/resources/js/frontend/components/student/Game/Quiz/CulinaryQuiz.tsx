import React, { useState, useEffect } from 'react';
import './CulinaryQuizScoped.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizState {
  currentQuestion: number;
  score: number;
  pointsEarned: number;
  answered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  quizCompleted: boolean;
  timeLeft: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Quel est l'ingrédient principal du thiéboudienne ?",
    options: ["Poulet", "Poisson", "Bœuf", "Mouton"],
    correctAnswer: 1,
    points: 2
  },
  {
    id: 2,
    question: "Le yassa est traditionnellement préparé avec quel ingrédient acide ?",
    options: ["Citron", "Vinaigre", "Oignon", "Tomate"],
    correctAnswer: 0,
    points: 2
  },
  {
    id: 3,
    question: "Quel plat sénégalais est fait à base de mil ?",
    options: ["Mafé", "Couscous", "Thiakry", "Domoda"],
    correctAnswer: 2,
    points: 3
  },
  {
    id: 4,
    question: "Quelle est la boisson traditionnelle sénégalaise à base de bissap ?",
    options: ["Jus de gingembre", "Jus de tamarin", "Jus d'hibiscus", "Jus de baobab"],
    correctAnswer: 2,
    points: 2
  },
  {
    id: 5,
    question: "Le mafé est une sauce à base de quoi ?",
    options: ["Arachide", "Tomate", "Gombo", "Oignon"],
    correctAnswer: 0,
    points: 2
  },
  {
    id: 6,
    question: "Quel est le plat national du Sénégal ?",
    options: ["Yassa", "Mafé", "Thiéboudienne", "Domoda"],
    correctAnswer: 2,
    points: 3
  },
  {
    id: 7,
    question: "Le fataya est inspiré de quelle cuisine ?",
    options: ["Française", "Libanaise", "Indienne", "Marocaine"],
    correctAnswer: 1,
    points: 2
  },
  {
    id: 8,
    question: "Quel fruit est utilisé pour faire le jus de bouye ?",
    options: ["Mangue", "Pain de singe (baobab)", "Goyave", "Papaye"],
    correctAnswer: 1,
    points: 3
  },
  {
    id: 9,
    question: "Le ndambé est un plat à base de quoi ?",
    options: ["Riz", "Haricots", "Mil", "Maïs"],
    correctAnswer: 1,
    points: 2
  },
  {
    id: 10,
    question: "Quel accompagnement est servi avec le thiéboudienne ?",
    options: ["Pain", "Riz", "Couscous", "Frites"],
    correctAnswer: 1,
    points: 2
  }
];

interface CulinaryQuizProps {
  onComplete?: (points: number) => void;
}

const CulinaryQuiz: React.FC<CulinaryQuizProps> = ({ onComplete }) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    pointsEarned: 0,
    answered: false,
    selectedAnswer: null,
    isCorrect: null,
    quizCompleted: false,
    timeLeft: 30
  });

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

    const currentQ = questions[quizState.currentQuestion];
    const correct = answerIndex === currentQ.correctAnswer;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      answered: true,
      isCorrect: correct,
      score: correct ? prev.score + 1 : prev.score,
      pointsEarned: correct ? prev.pointsEarned + currentQ.points : prev.pointsEarned
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
        timeLeft: 30
      }));
    } else {
      setQuizState(prev => ({ ...prev, quizCompleted: true }));
      if (onComplete) {
        onComplete(quizState.pointsEarned);
      }
    }
  };

  const handleRestart = () => {
    setQuizState({
      currentQuestion: 0,
      score: 0,
      pointsEarned: 0,
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
      quizCompleted: false,
      timeLeft: 30
    });
  };

  const currentQuestion = questions[quizState.currentQuestion];
  const progress = ((quizState.currentQuestion + 1) / questions.length) * 100;

  if (quizState.quizCompleted) {
    const percentage = (quizState.score / questions.length) * 100;
    return (
      <div className="culinary-quiz">
        <div className="quiz-container">
        <div className="quiz-completed">
          <div className="completion-icon">
            {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
          </div>
          <h2>Quiz Terminé !</h2>
          <div className="final-score">
            <div className="score-item">
              <span className="score-label">Score</span>
              <span className="score-value">{quizState.score}/{questions.length}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Pourcentage</span>
              <span className="score-value">{percentage.toFixed(0)}%</span>
            </div>
            <div className="score-item highlight">
              <span className="score-label">Points gagnés</span>
              <span className="score-value">+{quizState.pointsEarned} pts</span>
            </div>
          </div>
          <div className="completion-message">
            {percentage >= 70 && "Excellent ! Vous êtes un vrai connaisseur de la cuisine sénégalaise ! 🌟"}
            {percentage >= 50 && percentage < 70 && "Bien joué ! Continuez à explorer notre cuisine ! 👨‍🍳"}
            {percentage < 50 && "Pas mal ! Venez goûter nos plats pour en apprendre plus ! 🍽️"}
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
            Question {quizState.currentQuestion + 1}/{questions.length}
          </span>
          <span className="current-score">
            Score: {quizState.score} | Points: {quizState.pointsEarned}
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
          <div className="question-points">+{currentQuestion.points} points</div>
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
                ? `Bravo ! +${currentQuestion.points} points` 
                : `Dommage ! La bonne réponse était : ${currentQuestion.options[currentQuestion.correctAnswer]}`
              }
            </div>
            <button className="next-button" onClick={handleNextQuestion}>
              {quizState.currentQuestion < questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default CulinaryQuiz;
