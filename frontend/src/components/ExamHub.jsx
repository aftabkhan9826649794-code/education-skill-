import { useState, useCallback } from "react";
import { BookOpen, CheckCircle, XCircle, RotateCcw, Trophy, ArrowLeft, Mic } from "lucide-react";

const QUIZZES = [
  {
    id: "colors", title: "Colors Quiz", questions: [
      { q: "Which color is the sky?", options: ["Red", "Blue", "Green", "Yellow"], answer: 1 },
      { q: "What color are leaves?", options: ["Blue", "Pink", "Green", "White"], answer: 2 },
      { q: "What color is the sun?", options: ["Purple", "Yellow", "Black", "Green"], answer: 1 },
      { q: "What color is a rose?", options: ["Red", "Blue", "Green", "White"], answer: 0 },
      { q: "What color is milk?", options: ["Black", "Yellow", "Red", "White"], answer: 3 },
    ]
  },
  {
    id: "shapes", title: "Shapes Quiz", questions: [
      { q: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], answer: 1 },
      { q: "What shape is a ball?", options: ["Square", "Circle", "Triangle", "Star"], answer: 1 },
      { q: "How many corners does a square have?", options: ["3", "4", "5", "6"], answer: 1 },
      { q: "What shape has no corners?", options: ["Square", "Triangle", "Circle", "Rectangle"], answer: 2 },
      { q: "A dice is which shape?", options: ["Sphere", "Cube", "Cone", "Cylinder"], answer: 1 },
    ]
  },
  {
    id: "animals", title: "Animals Quiz", questions: [
      { q: "Which animal says 'Meow'?", options: ["Dog", "Cat", "Cow", "Bird"], answer: 1 },
      { q: "Which animal is the King of Jungle?", options: ["Elephant", "Tiger", "Lion", "Bear"], answer: 2 },
      { q: "Which animal gives us milk?", options: ["Cat", "Dog", "Cow", "Fish"], answer: 2 },
      { q: "Which animal can fly?", options: ["Fish", "Dog", "Snake", "Bird"], answer: 3 },
      { q: "Which is the tallest animal?", options: ["Elephant", "Giraffe", "Horse", "Bear"], answer: 1 },
    ]
  },
];

export default function ExamHub({ onBack }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedOpt(null);
  };

  const handleAnswer = (optIdx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(optIdx);
    const correct = optIdx === selectedQuiz.questions[currentQ].answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { question: currentQ, selected: optIdx, correct }]);

    setTimeout(() => {
      if (currentQ + 1 < selectedQuiz.questions.length) {
        setCurrentQ((q) => q + 1);
        setSelectedOpt(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedOpt(null);
  };

  if (!selectedQuiz) {
    return (
      <div className="exam-hub" data-testid="exam-hub">
        <header className="exam-header">
          <button onClick={onBack} className="exam-back" data-testid="exam-back"><ArrowLeft size={18} /> Home</button>
          <h2><BookOpen size={24} /> Exam Hub</h2>
        </header>
        <p className="exam-subtitle">Quiz choose karo aur apna knowledge test karo!</p>
        <div className="exam-grid">
          {QUIZZES.map((q) => (
            <button key={q.id} className="exam-card" onClick={() => startQuiz(q)} data-testid={`quiz-${q.id}`}>
              <BookOpen size={32} />
              <h3>{q.title}</h3>
              <p>{q.questions.length} Questions</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showResult) {
    const percent = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <div className="exam-hub" data-testid="exam-result">
        <div className="exam-result-card">
          <Trophy size={48} className="exam-trophy" />
          <h2>Quiz Complete!</h2>
          <div className="exam-score">
            <span className="exam-score-num">{score}/{selectedQuiz.questions.length}</span>
            <span className="exam-score-pct">{percent}%</span>
          </div>
          <p>{percent >= 80 ? "Excellent! Bahut achha!" : percent >= 60 ? "Good job! Aur practice karo!" : "Keep trying! Himmat mat haaro!"}</p>
          <div className="exam-result-actions">
            <button onClick={() => startQuiz(selectedQuiz)} className="exam-btn"><RotateCcw size={16} /> Try Again</button>
            <button onClick={resetQuiz} className="exam-btn accent"><BookOpen size={16} /> Other Quizzes</button>
            <button onClick={onBack} className="exam-btn"><ArrowLeft size={16} /> Home</button>
          </div>
        </div>
      </div>
    );
  }

  const q = selectedQuiz.questions[currentQ];
  return (
    <div className="exam-hub" data-testid="exam-quiz">
      <header className="exam-header">
        <button onClick={resetQuiz} className="exam-back"><ArrowLeft size={18} /> Back</button>
        <h2>{selectedQuiz.title}</h2>
        <span className="exam-progress">Q{currentQ + 1}/{selectedQuiz.questions.length}</span>
      </header>
      <div className="exam-question-card">
        <div className="exam-q-num">Question {currentQ + 1}</div>
        <h3 className="exam-q-text">{q.q}</h3>
        <div className="exam-options">
          {q.options.map((opt, i) => {
            let cls = "exam-opt";
            if (selectedOpt !== null) {
              if (i === q.answer) cls += " correct";
              else if (i === selectedOpt && i !== q.answer) cls += " wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)} data-testid={`opt-${i}`} disabled={selectedOpt !== null}>
                <span className="exam-opt-letter">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
                {selectedOpt !== null && i === q.answer && <CheckCircle size={18} />}
                {selectedOpt !== null && i === selectedOpt && i !== q.answer && <XCircle size={18} />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="exam-score-bar">Score: {score}/{currentQ + (selectedOpt !== null ? 1 : 0)}</div>
    </div>
  );
}
