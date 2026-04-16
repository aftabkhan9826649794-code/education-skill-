import { useState, useEffect, useCallback } from "react";
import {
  Hand, Paintbrush, BookOpen, Mic, Accessibility, Home,
  Volume2, ZoomIn, ZoomOut, Moon, Sun, ChevronRight
} from "lucide-react";

const HUBS = [
  { id: "airwrite", title: "AirWrite", desc: "Hawa mein likho - gesture se draw karo", icon: Hand, color: "#D4AF37" },
  { id: "creation", title: "New Creation", desc: "AI coloring pages banao aur color karo", icon: Paintbrush, color: "#2ECC71" },
  { id: "exam", title: "Exam Hub", desc: "Quiz khelo aur apna score dekho", icon: BookOpen, color: "#3498DB" },
  { id: "voice", title: "Voice Command", desc: "Bolo aur navigate karo - hands free!", icon: Mic, color: "#E74C3C" },
  { id: "accessibility", title: "Accessibility", desc: "Font size, contrast aur more settings", icon: Accessibility, color: "#9B59B6" },
];

export default function HomePage({ onNavigate, accessibility, onAccessibilityChange }) {
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  /* Voice Navigation */
  const startVoiceNav = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceText("Voice not supported in this browser"); return; }
    const recog = new SR();
    recog.lang = "hi-IN";
    recog.continuous = false;
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      setVoiceText(text);
      setListening(false);
      if (text.includes("write") || text.includes("likh") || text.includes("draw") || text.includes("air")) {
        onNavigate("airwrite");
      } else if (text.includes("color") || text.includes("create") || text.includes("bana") || text.includes("creation")) {
        onNavigate("creation");
      } else if (text.includes("exam") || text.includes("quiz") || text.includes("test")) {
        onNavigate("exam");
      } else if (text.includes("setting") || text.includes("access")) {
        onNavigate("accessibility");
      } else {
        setVoiceText(`"${text}" - Koi hub match nahi hua. Try: "air write", "color", "exam", "settings"`);
      }
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recog.start();
    setListening(true);
    setVoiceText("Listening... bolo kahan jaana hai");
  }, [onNavigate]);

  return (
    <div className="hub-home" data-testid="home-page" style={{ fontSize: `${accessibility.fontSize}px` }}>
      <header className="hub-header" data-testid="hub-header">
        <div className="hub-brand">
          <Home size={28} />
          <h1>WINGS GLOBAL</h1>
        </div>
        <div className="hub-header-actions">
          <button onClick={startVoiceNav} className={`hub-voice-btn ${listening ? "active" : ""}`} data-testid="voice-nav-btn">
            <Mic size={16} /> {listening ? "Listening..." : "Voice Navigate"}
          </button>
          <button onClick={() => onAccessibilityChange({ ...accessibility, fontSize: Math.min(accessibility.fontSize + 2, 24) })}
            className="hub-access-btn" data-testid="zoom-in"><ZoomIn size={16} /></button>
          <button onClick={() => onAccessibilityChange({ ...accessibility, fontSize: Math.max(accessibility.fontSize - 2, 12) })}
            className="hub-access-btn" data-testid="zoom-out"><ZoomOut size={16} /></button>
          <button onClick={() => onAccessibilityChange({ ...accessibility, highContrast: !accessibility.highContrast })}
            className="hub-access-btn" data-testid="contrast-toggle">
            {accessibility.highContrast ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="hub-main">
        <div className="hub-welcome">
          <h2>{greeting}, Student!</h2>
          <p>WINGS GLOBAL Digital Art & Education Platform mein aapka swagat hai</p>
        </div>

        {voiceText && (
          <div className="hub-voice-result" data-testid="voice-result">
            <Volume2 size={16} /> {voiceText}
          </div>
        )}

        <div className="hub-grid" data-testid="hub-grid">
          {HUBS.map((hub) => (
            <button
              key={hub.id}
              className="hub-card"
              onClick={() => onNavigate(hub.id)}
              data-testid={`hub-card-${hub.id}`}
              style={{ "--card-accent": hub.color }}
            >
              <div className="hub-card-icon" style={{ background: hub.color }}>
                <hub.icon size={28} color="#fff" />
              </div>
              <div className="hub-card-body">
                <h3>{hub.title}</h3>
                <p>{hub.desc}</p>
              </div>
              <ChevronRight size={20} className="hub-card-arrow" />
            </button>
          ))}
        </div>
      </main>

      <footer className="hub-footer">
        <p>WINGS GLOBAL Digital Art Educator - Empowering Students Through Technology</p>
      </footer>
    </div>
  );
}
