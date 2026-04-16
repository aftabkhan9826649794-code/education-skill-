import { useRef, useEffect, useState, useCallback } from "react";
import {
  Pen, Trash2, Save, Undo2, Download, Hand, ChevronDown,
  ChevronUp, Loader2, AlertCircle, PenLine, Pipette
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const W = 1280;
const H = 720;
const TARGET_FPS = 18;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const PINCH_THRESHOLD = 0.03;
const PALM_HOLD_MS = 1000;

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
  const initDoneRef = useRef(false);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const lastFrameRef = useRef(0);

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
  const [fps, setFps] = useState(0);

  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const addRecentColor = useCallback((hex) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== hex);
      return [hex, ...filtered].slice(0, 5);
    });
  }, []);

  /* ---- Gesture Detection (Normalized Coordinates) ---- */
  const checkPinch = useCallback((lm) => {
    const dx = lm[4].x - lm[8].x;
    const dy = lm[4].y - lm[8].y;
    return Math.sqrt(dx * dx + dy * dy) < PINCH_THRESHOLD;
  }, []);

  const checkPalm = useCallback((lm) => {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const thumbDist = Math.abs(lm[4].x - lm[0].x);
    const thumbIPDist = Math.abs(lm[3].x - lm[0].x);
    if (thumbDist <= thumbIPDist) return false;
    return tips.every((t, i) => lm[t].y < lm[pips[i]].y);
  }, []);

  /* ---- Redraw all saved paths (for undo) ---- */
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

  /* ---- onResults: ALL drawing logic lives here ---- */
  const onResults = useCallback((results) => {
    const tc = trackRef.current;
    const dc = drawRef.current;
    if (!tc || !dc) return;
    const tctx = tc.getContext("2d");
    const dctx = dc.getContext("2d");

    // High-quality video rendering
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = "high";

    // Draw mirrored video feed
    tctx.save();
    tctx.clearRect(0, 0, W, H);
    tctx.translate(W, 0);
    tctx.scale(-1, 1);
    tctx.drawImage(results.image, 0, 0, W, H);
    tctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
      const raw = results.multiHandLandmarks[0];
      const lm = raw.map((p) => ({ ...p, x: 1 - p.x }));

      // Draw hand skeleton using native Canvas API
      const connections = window.HAND_CONNECTIONS;
      tctx.strokeStyle = "#D4AF37";
      tctx.lineWidth = 2;
      for (const [a, b] of connections) {
        tctx.beginPath();
        tctx.moveTo(lm[a].x * W, lm[a].y * H);
        tctx.lineTo(lm[b].x * W, lm[b].y * H);
        tctx.stroke();
      }
      // Draw landmarks
      for (const pt of lm) {
        tctx.beginPath();
        tctx.arc(pt.x * W, pt.y * H, 3, 0, Math.PI * 2);
        tctx.fillStyle = "#FFFFFF";
        tctx.fill();
      }

      const pinch = checkPinch(lm);
      const palm = checkPalm(lm);
      const x = lm[8].x * W;
      const y = lm[8].y * H;

      // Draw cursor at index fingertip
      tctx.beginPath();
      tctx.arc(x, y, pinch ? 10 : 5, 0, Math.PI * 2);
      tctx.fillStyle = pinch ? "#D4AF37" : "rgba(255,255,255,0.5)";
      tctx.fill();
      if (pinch) {
        tctx.beginPath();
        tctx.arc(x, y, 14, 0, Math.PI * 2);
        tctx.strokeStyle = "#D4AF37";
        tctx.lineWidth = 2;
        tctx.stroke();
      }

      /* ---- PINCH = DRAW using native Canvas beginPath/moveTo/lineTo ---- */
      if (pinch) {
        palmTimeRef.current = null;
        setClearProg(0);
        if (!pinchingRef.current) {
          pinchingRef.current = true;
          lastPtRef.current = { x, y };
          curPathRef.current = [{ x, y }];
        } else {
          // Smoothing for jitter reduction
          const S = 0.5;
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
        // End stroke
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

        /* ---- FULL PALM > 1s = CLEAR ---- */
        if (palm) {
          if (!palmTimeRef.current) palmTimeRef.current = Date.now();
          const elapsed = Date.now() - palmTimeRef.current;
          setClearProg(Math.min(elapsed / PALM_HOLD_MS, 1));
          setGesture("CLEARING");
          if (elapsed >= PALM_HOLD_MS) {
            dctx.clearRect(0, 0, W, H);
            pathsRef.current = [];
            palmTimeRef.current = null;
            setClearProg(0);
            setGesture("CLEARED");
            setTimeout(() => setGesture("IDLE"), 800);
          }
        } else {
          palmTimeRef.current = null;
          setClearProg(0);
          setGesture("IDLE");
        }
      }
    } else {
      // No hand visible
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

  /* ---- Initialize: getUserMedia + MediaPipe + FPS-gated RAF loop ---- */
  useEffect(() => {
    let cancelled = false;
    if (initDoneRef.current) return;

    const startAll = async () => {
      // Wait for MediaPipe CDN scripts
      while (
        !(window.Hands && window.drawConnectors && window.HAND_CONNECTIONS)
      ) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 200));
      }
      if (initDoneRef.current || cancelled) return;
      initDoneRef.current = true;

      try {
        // Single MediaPipe instance - maxNumHands: 1
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

        // HD Camera feed: 1280x720
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
        streamRef.current = stream;

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

        // FPS-gated detection loop (15-20 FPS)
        let processing = false;
        let fpsCount = 0;
        let fpsTimer = performance.now();

        const detect = async () => {
          if (cancelled) return;
          const now = performance.now();

          // FPS counter
          fpsCount++;
          if (now - fpsTimer >= 1000) {
            setFps(fpsCount);
            fpsCount = 0;
            fpsTimer = now;
          }

          // Only process at TARGET_FPS
          if (
            !processing &&
            now - lastFrameRef.current >= FRAME_INTERVAL &&
            video.readyState >= 2 &&
            handsRef.current
          ) {
            processing = true;
            lastFrameRef.current = now;
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
      } catch (err) {
        if (!cancelled) {
          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            setError("Camera access denied. Please allow camera and reload.");
          } else if (err.name === "NotFoundError") {
            setError("No camera found. Please connect a camera and reload.");
          } else {
            setError("Camera failed: " + err.message);
          }
          setLoading(false);
        }
      }
    };

    startAll();

    const timeout = setTimeout(() => {
      if (!initDoneRef.current) {
        setError("MediaPipe loading too slow. Check connection and reload.");
        setLoading(false);
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onResults]);

  /* ---- Handlers ---- */
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

  /* ---- RENDER ---- */
  return (
    <div className="aw-app" data-testid="air-writing-app">
      <header className="aw-header" data-testid="app-header">
        <div className="aw-logo">
          <Hand size={28} strokeWidth={1.5} />
          <h1>AirWrite</h1>
        </div>
        <div className="aw-header-right">
          <span className="aw-fps" data-testid="fps-counter">
            {fps} FPS
          </span>
          <p className="aw-tagline">Smart Air-Writing for Teachers</p>
        </div>
      </header>

      <div className="aw-main">
        {/* ---- LEFT SIDEBAR: flex-direction column, align-items flex-start ---- */}
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
                  title={c.name}
                />
              ))}
            </div>
            {/* Photoshop-style Color Mixer */}
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
                style={{ width: size + 4, height: size + 4, background: color }}
              />
            </div>
          </div>

          {/* Buttons: width 100%, text-align left, STRICTLY LEFT ALIGNED */}
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
              className="aw-btn"
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
                <span>Hold 1s to clear canvas</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ---- CANVAS AREA ---- */}
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
                  <span>Hand Detected</span>
                </>
              )}
              {gesture === "NO_HAND" && <span>Show your hand</span>}
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
                  className="aw-btn"
                  data-testid="reload-btn"
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- GALLERY ---- */}
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
