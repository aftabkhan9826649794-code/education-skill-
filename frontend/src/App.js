import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExamHub from './pages/ExamHub';
import AITutor from './pages/AITutor';
import Classes from './pages/Classes';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import VideoLessonCreator from './pages/VideoLessonCreator';
import SecureExam from './pages/SecureExam';
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;