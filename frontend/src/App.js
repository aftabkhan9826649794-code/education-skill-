import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExamHub from './pages/ExamHub';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam-hub" element={<ExamHub />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;