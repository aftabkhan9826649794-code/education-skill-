import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExamHub from './pages/ExamHub';
import AITutor from './pages/AITutor';
import Classes from './pages/Classes';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import VideoLessonCreator from './pages/VideoLessonCreator';
import SecureExam from './pages/SecureExam';
import MathLesson from './pages/MathLesson';
import Marks from './pages/Marks';
import Login from './pages/Login';
import Library from './pages/Library';
import LearningHub from './pages/LearningHub';
import Leaderboard from './pages/Leaderboard';
import InternationalBoard from './pages/InternationalBoard';
import InteractiveLesson from './pages/InteractiveLesson';
import CompetitiveExamHub from './pages/CompetitiveExamHub';
import CompetitiveExamTest from './pages/CompetitiveExamTest';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam-hub" element={<ExamHub />} />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/video-creator" element={<VideoLessonCreator />} />
        <Route path="/secure-exam" element={<SecureExam />} />
        <Route path="/math-lesson" element={<MathLesson />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/library" element={<Library />} />
        <Route path="/learning-hub" element={<LearningHub />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/international-board" element={<InternationalBoard />} />
        <Route path="/interactive-lesson" element={<InteractiveLesson />} />
        <Route path="/competitive-exam-hub" element={<CompetitiveExamHub />} />
        <Route path="/competitive-exam-test" element={<CompetitiveExamTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;