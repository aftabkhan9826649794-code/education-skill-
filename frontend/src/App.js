import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AirWritingApp from "@/components/AirWritingApp";
import NewCreation from "@/components/NewCreation";

function App() {
  const [mode, setMode] = useState("airwrite"); // "airwrite" | "creation"

  return (
    <div className="App">
      {mode === "airwrite" && (
        <AirWritingApp onNewCreation={() => setMode("creation")} />
      )}
      {mode === "creation" && (
        <NewCreation onBack={() => setMode("airwrite")} />
      )}
    </div>
  );
}

export default App;
