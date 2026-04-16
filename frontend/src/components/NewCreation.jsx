import { useRef, useState, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Loader2, Paintbrush, PaintBucket, Eraser,
  Download, Trash2, Save, Undo2, Type
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CW = 800;
const CH = 600;

const PALETTE = [
  { hex: "#8B0000", name: "RCB Red" }, { hex: "#D4AF37", name: "Gold" },
  { hex: "#731C71", name: "Purple" }, { hex: "#2ECC71", name: "Green" },
  { hex: "#3498DB", name: "Blue" }, { hex: "#E74C3C", name: "Red" },
  { hex: "#F1C40F", name: "Yellow" }, { hex: "#FF6B81", name: "Pink" },
  { hex: "#1ABC9C", name: "Teal" }, { hex: "#FF8C00", name: "Orange" },
  { hex: "#FFFFFF", name: "White" }, { hex: "#000000", name: "Black" },
];

/* Simple BFS flood fill */
function floodFill(ctx, sx, sy, fillHex, tolerance) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const pos = (sy * w + sx) * 4;
  const sR = d[pos], sG = d[pos + 1], sB = d[pos + 2];
  const fR = parseInt(fillHex.slice(1, 3), 16);
  const fG = parseInt(fillHex.slice(3, 5), 16);
  const fB = parseInt(fillHex.slice(5, 7), 16);
  if (Math.abs(sR - fR) < 5 && Math.abs(sG - fG) < 5 && Math.abs(sB - fB) < 5) return;
  const match = (i) =>
    Math.abs(d[i] - sR) <= tolerance &&
    Math.abs(d[i + 1] - sG) <= tolerance &&
    Math.abs(d[i + 2] - sB) <= tolerance;
  const stack = [[sx, sy]];
  const visited = new Uint8Array(w * h);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx]) continue;
    const p = idx * 4;
    if (!match(p)) continue;
    visited[idx] = 1;
    d[p] = fR; d[p + 1] = fG; d[p + 2] = fB; d[p + 3] = 255;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  ctx.putImageData(imgData, 0, 0);
}

export default function NewCreation({ onBack }) {
  const canvasRef = useRef(null);
  const [activity, setActivity] = useState("IDLE"); // IDLE, LISTENING, GENERATING, COLORING
  const [prompt, setPrompt] = useState("");
  const [color, setColor] = useState("#E74C3C");
  const [tool, setTool] = useState("brush"); // brush, bucket, eraser
  const [brushSize, setBrushSize] = useState(8);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const drawingRef = useRef(false);
  const lastPtRef = useRef(null);
  const historyRef = useRef([]);
  const recognitionRef = useRef(null);

  /* ---- Voice Input (Web Speech API) ---- */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported in this browser"); return; }
    const recog = new SR();
    recog.lang = "hi-IN";
    recog.continuous = false;
    recog.interimResults = false;
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setPrompt(text);
      setIsListening(false);
      setActivity("IDLE");
    };
    recog.onerror = () => { setIsListening(false); setActivity("IDLE"); };
    recog.onend = () => { setIsListening(false); };
    recognitionRef.current = recog;
    recog.start();
    setIsListening(true);
    setActivity("LISTENING");
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setActivity("IDLE");
  }, []);

  /* ---- Generate Coloring Image ---- */
  const generateImage = async () => {
    if (!prompt.trim()) return;
    setActivity("GENERATING");
    setError(null);
    try {
      const res = await axios.post(`${API}/generate-coloring`, { prompt: prompt.trim() }, { timeout: 120000 });
      setBgImage(res.data.image_base64);
      setActivity("COLORING");
    } catch (e) {
      setError(e.response?.data?.detail || "Image generation failed. Try again.");
      setActivity("IDLE");
    }
  };

  /* ---- Load image onto canvas ---- */
  useEffect(() => {
    if (!bgImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, CW, CH);
      ctx.drawImage(img, 0, 0, CW, CH);
      historyRef.current = [ctx.getImageData(0, 0, CW, CH)];
    };
    img.src = bgImage;
  }, [bgImage]);

  /* ---- Canvas Drawing ---- */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((cx - rect.left) * (CW / rect.width)),
      y: Math.round((cy - rect.top) * (CH / rect.height)),
    };
  };

  const handleDown = (e) => {
    e.preventDefault();
    const p = getPos(e);
    if (tool === "bucket") {
      const ctx = canvasRef.current.getContext("2d");
      floodFill(ctx, p.x, p.y, color, 40);
      historyRef.current.push(ctx.getImageData(0, 0, CW, CH));
      return;
    }
    drawingRef.current = true;
    lastPtRef.current = p;
  };

  const handleMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPtRef.current = p;
  };

  const handleUp = () => {
    if (drawingRef.current) {
      drawingRef.current = false;
      lastPtRef.current = null;
      const ctx = canvasRef.current.getContext("2d");
      historyRef.current.push(ctx.getImageData(0, 0, CW, CH));
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      historyRef.current.pop();
      const ctx = canvasRef.current.getContext("2d");
      ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    }
  };

  const handleClear = () => {
    if (!bgImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, CW, CH);
      ctx.drawImage(img, 0, 0, CW, CH);
      historyRef.current = [ctx.getImageData(0, 0, CW, CH)];
    };
    img.src = bgImage;
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.download = `my-creation-${Date.now()}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API}/drawings`, {
        title: `Creation: ${prompt.slice(0, 30)}`,
        image_data: canvasRef.current.toDataURL("image/png"),
      });
    } catch (e) { console.error(e); }
  };

  /* ---- RENDER ---- */
  return (
    <div className="nc-app" data-testid="new-creation">
      {/* Prompt Section (IDLE / LISTENING / GENERATING) */}
      {activity !== "COLORING" && (
        <div className="nc-prompt-section" data-testid="prompt-section">
          <h2 className="nc-title">New Creation</h2>
          <p className="nc-subtitle">Bolo ya likho kya banana hai - AI coloring page banayega!</p>

          <div className="nc-input-row">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`nc-mic-btn ${isListening ? "listening" : ""}`}
              data-testid="mic-btn"
              disabled={activity === "GENERATING"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? "Stop" : "Bolo"}
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. spaceship, butterfly, dinosaur..."
              className="nc-text-input"
              data-testid="prompt-input"
              disabled={activity === "GENERATING"}
              onKeyDown={(e) => e.key === "Enter" && generateImage()}
            />
            <button
              onClick={generateImage}
              className="nc-gen-btn"
              data-testid="generate-btn"
              disabled={!prompt.trim() || activity === "GENERATING"}
            >
              {activity === "GENERATING" ? <Loader2 size={18} className="nc-spin" /> : <Paintbrush size={18} />}
              {activity === "GENERATING" ? "Generating..." : "Create"}
            </button>
          </div>

          {isListening && (
            <div className="nc-listening-badge" data-testid="listening-indicator">
              <span className="nc-pulse" /> Listening... bolo kya banana hai
            </div>
          )}

          {activity === "GENERATING" && (
            <div className="nc-generating" data-testid="generating-indicator">
              <Loader2 size={32} className="nc-spin" />
              <p>AI is creating your coloring page... (10-30 seconds)</p>
            </div>
          )}

          {error && <p className="nc-error" data-testid="gen-error">{error}</p>}

          <button onClick={onBack} className="nc-back-btn" data-testid="back-btn">
            Back to AirWrite
          </button>
        </div>
      )}

      {/* Coloring Canvas (COLORING state) */}
      {activity === "COLORING" && (
        <div className="nc-coloring" data-testid="coloring-section">
          <div className="nc-canvas-header">
            <h3>Color Your Creation: {prompt.slice(0, 40)}</h3>
            <button onClick={() => { setActivity("IDLE"); setBgImage(null); }} className="nc-back-btn sm" data-testid="new-drawing-btn">
              New Drawing
            </button>
          </div>

          <div className="nc-canvas-area">
            {/* Tool sidebar */}
            <div className="nc-tools" data-testid="coloring-tools">
              <label className="nc-tool-label">Tools</label>
              <button className={`nc-tool-btn ${tool === "brush" ? "active" : ""}`} onClick={() => setTool("brush")} data-testid="brush-tool">
                <Paintbrush size={16} /> Brush
              </button>
              <button className={`nc-tool-btn ${tool === "bucket" ? "active" : ""}`} onClick={() => setTool("bucket")} data-testid="bucket-tool">
                <PaintBucket size={16} /> Fill
              </button>
              <button className={`nc-tool-btn ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")} data-testid="eraser-tool">
                <Eraser size={16} /> Eraser
              </button>

              <label className="nc-tool-label">Size: {brushSize}</label>
              <input type="range" min="2" max="30" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}
                className="nc-slider" data-testid="brush-size" />

              <label className="nc-tool-label">Colors</label>
              <div className="nc-color-grid">
                {PALETTE.map((c) => (
                  <button key={c.hex} className={`nc-swatch ${color === c.hex ? "active" : ""}`}
                    style={{ background: c.hex }} onClick={() => setColor(c.hex)} title={c.name}
                    data-testid={`nc-color-${c.hex.replace("#", "")}`} />
                ))}
              </div>

              <div className="nc-actions">
                <button onClick={handleUndo} className="nc-act-btn" data-testid="nc-undo"><Undo2 size={14} /> Undo</button>
                <button onClick={handleClear} className="nc-act-btn" data-testid="nc-clear"><Trash2 size={14} /> Reset</button>
                <button onClick={handleSave} className="nc-act-btn" data-testid="nc-save"><Save size={14} /> Save</button>
                <button onClick={handleDownload} className="nc-act-btn accent" data-testid="nc-download"><Download size={14} /> Download</button>
              </div>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              className={`nc-canvas ${tool === "bucket" ? "cursor-bucket" : tool === "eraser" ? "cursor-eraser" : "cursor-brush"}`}
              data-testid="coloring-canvas"
              onMouseDown={handleDown}
              onMouseMove={handleMove}
              onMouseUp={handleUp}
              onMouseLeave={handleUp}
              onTouchStart={handleDown}
              onTouchMove={handleMove}
              onTouchEnd={handleUp}
            />
          </div>
        </div>
      )}
    </div>
  );
}
