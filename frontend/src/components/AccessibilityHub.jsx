import { useState } from "react";
import {
  ZoomIn, ZoomOut, Moon, Sun, Volume2, VolumeX, Type,
  ArrowLeft, Accessibility, Eye
} from "lucide-react";

export default function AccessibilityHub({ onBack, accessibility, onChange }) {
  const [testSpeech, setTestSpeech] = useState(false);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "hi-IN";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      setTestSpeech(true);
      u.onend = () => setTestSpeech(false);
    }
  };

  return (
    <div className="access-hub" data-testid="accessibility-hub" style={{ fontSize: `${accessibility.fontSize}px` }}>
      <header className="access-header">
        <button onClick={onBack} className="access-back" data-testid="access-back"><ArrowLeft size={18} /> Home</button>
        <h2><Accessibility size={24} /> Accessibility Settings</h2>
      </header>

      <div className="access-grid">
        {/* Font Size */}
        <div className="access-card" data-testid="font-size-card">
          <div className="access-card-icon"><Type size={28} /></div>
          <h3>Font Size</h3>
          <p>Current: {accessibility.fontSize}px</p>
          <div className="access-row">
            <button onClick={() => onChange({ ...accessibility, fontSize: Math.max(accessibility.fontSize - 2, 12) })}
              className="access-btn" data-testid="font-decrease"><ZoomOut size={16} /> Smaller</button>
            <button onClick={() => onChange({ ...accessibility, fontSize: Math.min(accessibility.fontSize + 2, 28) })}
              className="access-btn" data-testid="font-increase"><ZoomIn size={16} /> Bigger</button>
          </div>
          <div className="access-preview" style={{ fontSize: `${accessibility.fontSize}px` }}>
            Aa Bb Cc - Preview Text
          </div>
        </div>

        {/* High Contrast */}
        <div className="access-card" data-testid="contrast-card">
          <div className="access-card-icon"><Eye size={28} /></div>
          <h3>High Contrast</h3>
          <p>{accessibility.highContrast ? "ON" : "OFF"}</p>
          <button onClick={() => onChange({ ...accessibility, highContrast: !accessibility.highContrast })}
            className={`access-btn ${accessibility.highContrast ? "active" : ""}`} data-testid="contrast-btn">
            {accessibility.highContrast ? <Sun size={16} /> : <Moon size={16} />}
            {accessibility.highContrast ? "Normal Mode" : "High Contrast"}
          </button>
        </div>

        {/* Screen Reader / TTS */}
        <div className="access-card" data-testid="speech-card">
          <div className="access-card-icon"><Volume2 size={28} /></div>
          <h3>Text to Speech</h3>
          <p>Screen reader for students</p>
          <button onClick={() => speak("Namaste! Main WINGS GLOBAL platform hoon. Aap yahan drawing, coloring aur quiz kar sakte hain.")}
            className="access-btn" data-testid="test-speech">
            {testSpeech ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {testSpeech ? "Speaking..." : "Test Speech"}
          </button>
          <button onClick={() => onChange({ ...accessibility, ttsEnabled: !accessibility.ttsEnabled })}
            className={`access-btn ${accessibility.ttsEnabled ? "active" : ""}`} data-testid="tts-toggle">
            {accessibility.ttsEnabled ? "TTS ON" : "TTS OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}
