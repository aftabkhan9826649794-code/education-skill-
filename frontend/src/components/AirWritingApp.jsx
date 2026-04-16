import { useRef, useEffect, useState, useCallback } from "react";
import {
  Pen, Trash2, Save, Undo2, Download, Hand, ChevronDown,
  ChevronUp, Loader2, AlertCircle, PenLine, Pipette
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const W = 1280;
const H = 720;
const COLORS = [
  { hex: "#D4AF37", name: "Gold" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#FF4757", name: "Red" },
  { hex: "#2ED573", name: "Green" },
  { hex: "#1E90FF", name: "Blue" },
  { hex: "#FF6B81", name: "Pink" },
  { hex: "#7BED9F", name: "Mint" },
  { hex: "#FFA502", name: "Orange" },
  { hex: "#FF00FF", name: "Magenta" },
  { hex: "#00FFFF", name: "Cyan" },
  { hex: "#FFD700", name: "Yellow" },
  { hex: "#FF1493", name: "Hot Pink" },
  { hex: "#00FF7F", name: "Spring" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#FF6347", name: "Tomato" },
  { hex: "#40E0D0", name: "Turquoise" },
  { hex: "#FF69B4", name: "Rose" },
  { hex: "#ADFF2F", name: "Lime" },
  { hex: "#9370DB", name: "Lavender" },
  { hex: "#FF8C00", name: "Amber" },
];

export default function AirWritingApp() {
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const drawRef = useRef(null);
  const handsRef = useRef(null);
  const camRef = useRef(null);
  const initDoneRef = useRef(false);
  const animFrameRef = useRef(null);

  const pinchingRef = useRef(false);
  const lastPtRef = useRef(null);
  const palmTimeRef = useRef(null);
  const pathsRef = useRef([]);
  const curPathRef = useRef([]);
  const colorRef = useRef("#D4AF37");
  const sizeRef = useRef(4);

  const [gesture, setGesture] = useState("NO_HAND");
  const [color, setColor] = useState("#D4AF37");
  const [size, setSize] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearProg, setClearProg] = useState(0);
  const [drawings, setDrawings] = useState([]);
  const [gallery, setGallery] = useState(false);
  const [recentColors, setRecentColors] = useState([]);

  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const addRecentColor = useCallback((hex) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== hex);
      return [hex, ...filtered].slice(0, 5);
    });
  }, []);

  const checkPalm = useCallback((lm) => {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    if (Math.abs(lm[4].x - lm[0].x) <= Math.abs(lm[3].x - lm[0].x)) return false;
    return tips.every((t, i) => lm[t].y < lm[pips[i]].y);
  }, []);

  const checkPinch = useCallback((lm, w, h) => {
    const dx = (lm[4].x - lm[8].x) * w;
    const dy = (lm[4].y - lm[8].y) * h;
    return Math.sqrt(dx * dx + dy * dy) < 55;
  }, []);

  const redraw = useCallback(() => {
    const c = drawRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of pathsRef.current) {
      if (p.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y);
      }
      ctx.stroke();
    }
  }, []);

  const onResults = useCallback((results) => {
    const tc = trackRef.current;
    const dc = drawRef.current;
    if (!tc || !dc) return;
    const tctx = tc.getContext("2d");
    const dctx = dc.getContext("2d");

    // Enable high quality image rendering
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = "high";

    tctx.save();
    tctx.clearRect(0, 0, W, H);
    tctx.translate(W, 0);
    tctx.scale(-1, 1);
    tctx.drawImage(results.image, 0, 0, W, H);
    tctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
      const raw = results.multiHandLandmarks[0];
      const lm = raw.map((p) => ({ ...p, x: 1 - p.x }));

      window.drawConnectors(tctx, lm, window.HAND_CONNECTIONS, {
        color: "#D4AF37",
        lineWidth: 2,
      });
      window.drawLandmarks(tctx, lm, {
        color: "#FFFFFF",
        lineWidth: 1,
        radius: 3,
      });

      const pinch = checkPinch(lm, W, H);
      const palm = checkPalm(lm);
      const x = lm[8].x * W;
      const y = lm[8].y * H;

      // Cursor
      tctx.beginPath();
      tctx.arc(x, y, pinch ? 10 : 5, 0, Math.PI * 2);
      tctx.fillStyle = pinch ? "#D4AF37" : "rgba(255,255,255,0.6)";
      tctx.fill();
      if (pinch) {
        tctx.beginPath();
        tctx.arc(x, y, 14, 0, Math.PI * 2);
        tctx.strokeStyle = "#D4AF37";
        tctx.lineWidth = 2;
        tctx.stroke();
      }

      if (pinch) {
        palmTimeRef.current = null;
        setClearProg(0);
        if (!pinchingRef.current) {
          pinchingRef.current = true;
          lastPtRef.current = { x, y };
          curPathRef.current = [{ x, y }];
        } else {
          const S = 0.45;
          const sx = lastPtRef.current.x * (1 - S) + x * S;
          const sy = lastPtRef.current.y * (1 - S) + y * S;
          dctx.beginPath();
          dctx.strokeStyle = colorRef.current;
          dctx.lineWidth = sizeRef.current;
          dctx.lineCap = "round";
          dctx.lineJoin = "round";
          dctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
          dctx.lineTo(sx, sy);
          dctx.stroke();
          lastPtRef.current = { x: sx, y: sy };
          curPathRef.current.push({ x: sx, y: sy });
        }
        setGesture("DRAWING");
      } else {
        if (pinchingRef.current) {
          if (curPathRef.current.length > 1) {
            pathsRef.current.push({
              points: [...curPathRef.current],
              color: colorRef.current,
              size: sizeRef.current,
            });
          }
          curPathRef.current = [];
          pinchingRef.current = false;
          lastPtRef.current = null;
        }
        if (palm) {
          if (!palmTimeRef.current) palmTimeRef.current = Date.now();
          const elapsed = Date.now() - palmTimeRef.current;
          setClearProg(Math.min(elapsed / 2000, 1));
          setGesture("CLEARING");
          if (elapsed >= 2000) {
            dctx.clearRect(0, 0, W, H);
            pathsRef.current = [];
            palmTimeRef.current = null;
            setClearProg(0);
            setGesture("CLEARED");
            setTimeout(() => setGesture("IDLE"), 1200);
          }
        } else {
          palmTimeRef.current = null;
          setClearProg(0);
          setGesture("IDLE");
        }
      }
    } else {
      if (pinchingRef.current) {
        if (curPathRef.current.length > 1) {
          pathsRef.current.push({
            points: [...curPathRef.current],
            color: colorRef.current,
            size: sizeRef.current,
          });
        }
        curPathRef.current = [];
        pinchingRef.current = false;
        lastPtRef.current = null;
      }
      palmTimeRef.current = null;
      setClearProg(0);
      setGesture("NO_HAND");
    }
  }, [checkPinch, checkPalm]);

  useEffect(() => {
    let cancelled = false;
    if (initDoneRef.current) return;

    const startAll = async () => {
      // Wait for MediaPipe scripts to load
      while (
        !(window.Hands && window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS)
      ) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 200));
      }

      if (initDoneRef.current || cancelled) return;
      initDoneRef.current = true;

      try {
        // Initialize MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (f) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        hands.onResults(onResults);
        handsRef.current = hands;

        // Get camera stream manually for better quality control
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: "user",
            frameRate: { ideal: 30 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        video.srcObject = stream;
        video.width = W;
        video.height = H;

        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
        await video.play();

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLoading(false);
        setError(null);

        // Detection loop using requestAnimationFrame
        let processing = false;
        const detect = async () => {
          if (cancelled) return;
          if (!processing && video.readyState >= 2 && handsRef.current) {
            processing = true;
            try {
              await handsRef.current.send({ image: video });
            } catch (e) {
              // silently continue
            }
            processing = false;
          }
          if (!cancelled) {
            animFrameRef.current = requestAnimationFrame(detect);
          }
        };
        detect();
        camRef.current = stream;
      } catch (err) {
        if (!cancelled) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Camera access denied. Please allow camera permission and reload the page.");
          } else if (err.name === "NotFoundError") {
            setError("No camera found. Please connect a camera and reload.");
          } else {
            setError("Failed to start camera: " + err.message);
          }
          setLoading(false);
        }
      }
    };

    startAll();

    const timeout = setTimeout(() => {
      if (!initDoneRef.current) {
        setError(
          "MediaPipe scripts taking too long. Please check your connection and reload."
        );
        setLoading(false);
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (camRef.current && camRef.current.getTracks) {
        camRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onResults]);

  const handleClear = () => {
    const c = drawRef.current;
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
    pathsRef.current = [];
    curPathRef.current = [];
  };

  const handleUndo = () => {
    if (pathsRef.current.length) {
      pathsRef.current.pop();
      redraw();
    }
  };

  const handleSave = async () => {
    const c = drawRef.current;
    if (!c) return;
    try {
      await axios.post(`${API}/drawings`, {
        title: `Drawing ${new Date().toLocaleString()}`,
        image_data: c.toDataURL("image/png"),
      });
      fetchDrawings();
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const handleDownload = () => {
    const c = drawRef.current;
    if (!c) return;
    const tmp = document.createElement("canvas");
    tmp.width = W;
    tmp.height = H;
    const ctx = tmp.getContext("2d");
    ctx.fillStyle = "#301934";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(c, 0, 0);
    const a = document.createElement("a");
    a.download = `air-writing-${Date.now()}.png`;
    a.href = tmp.toDataURL("image/png");
    a.click();
  };

  const fetchDrawings = async () => {
    try {
      const r = await axios.get(`${API}/drawings`);
      setDrawings(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDrawings();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/drawings/${id}`);
      fetchDrawings();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="aw-app" data-testid="air-writing-app">
      <header className="aw-header" data-testid="app-header">
        <div className="aw-logo">
          <Hand size={28} strokeWidth={1.5} />
          <h1>AirWrite</h1>
        </div>
        <p className="aw-tagline">Smart Air-Writing Tool for Teachers</p>
      </header>

      <div className="aw-main">
        <aside className="aw-sidebar" data-testid="control-panel">
          <div className="aw-ctrl-group">
            <label className="aw-label">Brush Color</label>
            <div className="aw-palette">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  className={`aw-swatch${color === c.hex ? " active" : ""}`}
                  style={{ background: c.hex }}
                  onClick={() => setColor(c.hex)}
                  data-testid={`color-btn-${c.hex.replace("#", "")}`}
                  aria-label={`Select ${c.name}`}
                  title={c.name}
                />
              ))}
            </div>
            <div className="aw-color-mixer" data-testid="color-mixer">
              <div className="aw-mixer-row">
                <label className="aw-mixer-label">
                  <Pipette size={14} />
                  <span>Mix Your Color</span>
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    addRecentColor(e.target.value);
                  }}
                  className="aw-color-input"
                  data-testid="color-picker-input"
                />
              </div>
              <div
                className="aw-current-color"
                style={{ background: color }}
                data-testid="current-color-preview"
              >
                <span>{color.toUpperCase()}</span>
              </div>
              {recentColors.length > 0 && (
                <div className="aw-recent-colors">
                  <span className="aw-recent-label">Recent</span>
                  <div className="aw-recent-row">
                    {recentColors.map((c) => (
                      <button
                        key={c}
                        className={`aw-swatch aw-swatch-sm${color === c ? " active" : ""}`}
                        style={{ background: c }}
                        onClick={() => setColor(c)}
                        title={c}
                        data-testid={`recent-color-${c.replace("#", "")}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="aw-ctrl-group">
            <label className="aw-label">
              Brush Size <span className="aw-size-val">{size}px</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="aw-slider"
              data-testid="brush-size-slider"
            />
            <div className="aw-size-preview">
              <span
                className="aw-dot"
                style={{
                  width: size + 4,
                  height: size + 4,
                  background: color,
                }}
              />
            </div>
          </div>

          <div className="aw-ctrl-group aw-buttons">
            <button
              onClick={handleClear}
              className="aw-btn"
              data-testid="clear-canvas-btn"
            >
              <Trash2 size={16} />
              <span>Clear Canvas</span>
            </button>
            <button
              onClick={handleUndo}
              className="aw-btn"
              data-testid="undo-btn"
            >
              <Undo2 size={16} />
              <span>Undo</span>
            </button>
            <button
              onClick={handleSave}
              className="aw-btn aw-btn-accent"
              data-testid="save-btn"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={handleDownload}
              className="aw-btn"
              data-testid="download-btn"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>

          <div className="aw-guide" data-testid="gesture-guide">
            <h3 className="aw-guide-title">Gesture Guide</h3>
            <div className="aw-guide-item">
              <PenLine size={18} />
              <div>
                <strong>Pinch</strong>
                <span>Thumb + Index close = Draw</span>
              </div>
            </div>
            <div className="aw-guide-item">
              <Hand size={18} />
              <div>
                <strong>Open Palm</strong>
                <span>Hold 2s to clear canvas</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="aw-canvas-area">
          <div className="aw-canvas-wrap" data-testid="canvas-wrapper">
            <video ref={videoRef} style={{ display: "none" }} playsInline />
            <canvas
              ref={trackRef}
              className="aw-track-canvas"
              width={W}
              height={H}
              data-testid="tracking-canvas"
            />
            <canvas
              ref={drawRef}
              className="aw-draw-canvas"
              width={W}
              height={H}
              data-testid="drawing-canvas"
            />

            <div
              className={`aw-gesture-badge aw-g-${gesture.toLowerCase().replace("_", "-")}`}
              data-testid="gesture-status"
            >
              {gesture === "DRAWING" && (
                <>
                  <Pen size={14} />
                  <span>Drawing</span>
                </>
              )}
              {gesture === "CLEARING" && (
                <div className="aw-clear-ind">
                  <Hand size={14} />
                  <span>Clearing...</span>
                  <div className="aw-clear-track">
                    <div
                      className="aw-clear-fill"
                      style={{ width: `${clearProg * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {gesture === "CLEARED" && <span>Canvas Cleared</span>}
              {gesture === "IDLE" && (
                <>
                  <Hand size={14} />
                  <span>Hand Detected - Ready</span>
                </>
              )}
              {gesture === "NO_HAND" && <span>Show your hand to start</span>}
            </div>

            {loading && (
              <div className="aw-loading" data-testid="loading-overlay">
                <Loader2 size={40} className="aw-spin" />
                <p>Loading Hand Tracking...</p>
                <span className="aw-load-sub">
                  Allow camera access when prompted
                </span>
              </div>
            )}

            {error && (
              <div className="aw-error" data-testid="error-overlay">
                <AlertCircle size={40} />
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="aw-btn aw-btn-accent"
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="aw-gallery-bar" data-testid="gallery-section">
        <button
          onClick={() => setGallery(!gallery)}
          className="aw-gallery-toggle"
          data-testid="gallery-toggle-btn"
        >
          {gallery ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>Saved Drawings ({drawings.length})</span>
        </button>
      </div>

      {gallery && (
        <div className="aw-gallery" data-testid="drawings-gallery">
          {drawings.length === 0 ? (
            <p className="aw-gallery-empty">
              No saved drawings yet. Start writing in the air!
            </p>
          ) : (
            drawings.map((d) => (
              <div
                key={d.id}
                className="aw-gallery-card"
                data-testid={`drawing-card-${d.id}`}
              >
                <img src={d.image_data} alt={d.title} />
                <div className="aw-gallery-meta">
                  <span>{d.title}</span>
                  <button
                    onClick={() => handleDelete(d.id)}
                    data-testid={`delete-drawing-${d.id}`}
                    className="aw-gallery-del"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
