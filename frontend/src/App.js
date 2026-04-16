import { useState } from "react";
import "@/App.css";
import AirWritingApp from "@/components/AirWritingApp";
import NewCreation from "@/components/NewCreation";
import HomePage from "@/components/HomePage";
import ExamHub from "@/components/ExamHub";
import AccessibilityHub from "@/components/AccessibilityHub";

function App() {
  const [page, setPage] = useState("home");
  const [accessibility, setAccessibility] = useState({
    fontSize: 16,
    highContrast: false,
    ttsEnabled: false,
  });

  const navigate = (target) => {
    if (target === "voice") return; // voice handled in HomePage
    setPage(target);
  };

  return (
    <div className={`App ${accessibility.highContrast ? "high-contrast" : ""}`}>
      {page === "home" && (
        <HomePage
          onNavigate={navigate}
          accessibility={accessibility}
          onAccessibilityChange={setAccessibility}
        />
      )}
      {page === "airwrite" && (
        <AirWritingApp onNewCreation={() => setPage("creation")} onHome={() => setPage("home")} />
      )}
      {page === "creation" && (
        <NewCreation onBack={() => setPage("home")} />
      )}
      {page === "exam" && (
        <ExamHub onBack={() => setPage("home")} />
      )}
      {page === "accessibility" && (
        <AccessibilityHub
          onBack={() => setPage("home")}
          accessibility={accessibility}
          onChange={setAccessibility}
        />
      )}
    </div>
  );
}

export default App;
