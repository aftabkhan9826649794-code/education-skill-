import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AirWritingApp from "@/components/AirWritingApp";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AirWritingApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
