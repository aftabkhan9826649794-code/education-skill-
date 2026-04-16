import { useRef, useEffect, useState, useCallback } from "react";
import {
  Pen, Trash2, Save, Undo2, Download, Hand, ChevronDown,
  ChevronUp, Loader2, AlertCircle, PenLine, Pipette, Video, Mouse
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
  { hex: "#D4AF37", name: "Gold" }, { hex: "#FFFFFF", name: "White" },
  { hex: "#FF4757", name: "Red" }, { hex: "#2ED573", name: "Green" },
  { hex: "#1E90FF", name: "Blue" }, { hex: "#FF6B81", name: "Pink" },
  { hex: "#7BED9F", name: "Mint" }, { hex: "#FFA502", name: "Orange" },
  { hex: "#FF00FF", name: "Magenta" }, { hex: "#00FFFF", name: "Cyan" },
  { hex: "#FFD700", name: "Yellow" }, { hex: "#FF1493", name: "Hot Pink" },
  { hex: "#00FF7F", name: "Spring" }, { hex: "#8B5CF6", name: "Purple" },
  { hex: "#FF6347", name: "Tomato" }, { hex: "#40E0D0", name: "Turquoise" },
  { hex: "#FF69B4", name: "Rose" }, { hex: "#ADFF2F", name: "Lime" },
  { hex: "#9370DB", name: "Lavender" }, { hex: "#FF8C00", name: "Amber" },
];

export default function AirWritingApp({ onNewCreation, onHome }) {
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const drawRef = useRef(null);
  const handsRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const lastFrameRef = useRef(0);
  const initRef = useRef(false);
  const errorCountRef = useRef(0);

  const pinchingRef = useRef(false);
  const lastPtRef = useRef(null);
  const palmTimeRef = useRef(null);
  const pathsRef = useRef([]);
  const curPathRef = useRef([]);
  const colorRef = useRef("#D4AF37");
  const sizeRef = useRef(4);

  // Mouse/touch drawing refs
  const mouseDrawingRef = useRef(false);
  const mouseLastPtRef = useRef(null);

  const [gesture, setGesture] = useState("NO_HAND");
  const [color, setColor] = useState("#D4AF37");
  const [size, setSize] = useState(4);
  const [status, setStatus] = useState("loading_scripts");
  const [errorMsg, setErrorMsg] = useState(null);
  const [clearProg, setClearProg] = useState(0);
  const [drawings, setDrawings] = useState([]);
  const [gallery, setGallery] = useState(false);
  const [recentColors, setRecentColors] = useState([]);
  const [fps, setFps] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [drawMode, setDrawMode] = useState("gesture"); // "gesture" or "mouse"
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const addRecentColor = useCallback((hex) => {
    setRecentColors((prev) => [hex, ...prev.filter((c) => c !== hex)].slice(0, 5));
  }, []);

  /* ---- FUNCTION 1: PINCH TO DRAW ---- */
  const checkPinch = useCallback((lm) => {
    const dx = lm[4].x - lm[8].x;
    const dy = lm[4].y - lm[8].y;
    return Math.sqrt(dx * dx + dy * dy) < PINCH_THRESHOLD;
  }, []);

  /* ---- FUNCTION 2: FULL PALM > 1s TO CLEAR ---- */
  const checkPalm = useCallback((lm) => {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const thumbDist = Math.abs(lm[4].x - lm[0].x);
    const thumbIPDist = Math.abs(lm[3].x - lm[0].x);
    if (thumbDist <= thumbIPDist) return false;
    return tips.every((t, i) => lm[t].y < lm[pips[i]].y);
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
      for (let i = 1; i < p.points.length; i++) ctx.lineTo(p.points[i].x, p.points[i].y);
      ctx.stroke();
    }
  }, []);

  /* ---- onResults: gesture drawing logic ---- */
  const onResults = useCallback((results) => {
    const tc = trackRef.current;
    const dc = drawRef.current;
    if (!tc || !dc) return;
    const tctx = tc.getContext("2d");
    const dctx = dc.getContext("2d");

    tctx.clearRect(0, 0, W, H);

    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
      const lm = results.multiHandLandmarks[0];

      // Draw hand skeleton natively
      const conns = window.HAND_CONNECTIONS;
      if (conns) {
        tctx.strokeStyle = "#D4AF37";
        tctx.lineWidth = 2;
        for (const [a, b] of conns) {
          tctx.beginPath();
          tctx.moveTo(lm[a].x * W, lm[a].y * H);
          tctx.lineTo(lm[b].x * W, lm[b].y * H);
          tctx.stroke();
        }
      }
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

      // Debug info
      const dist = Math.sqrt(
        Math.pow(lm[4].x - lm[8].x, 2) + Math.pow(lm[4].y - lm[8].y, 2)
      ).toFixed(4);
      setDebugInfo(`Pinch: ${dist} ${pinch ? "YES" : "no"} | Palm: ${palm ? "YES" : "no"}`);

      // Cursor
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

      if (pinch) {
        palmTimeRef.current = null;
        setClearProg(0);
        if (!pinchingRef.current) {
          pinchingRef.current = true;
          lastPtRef.current = { x, y };
          curPathRef.current = [{ x, y }];
        } else {
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
      setDebugInfo("No hand detected");
    }
  }, [checkPinch, checkPalm]);

  /* ---- MOUSE/TOUCH DRAWING ---- */
  const getCanvasCoords = useCallback((e) => {
    const canvas = drawRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // Canvas is CSS-mirrored (scaleX -1), so flip X
    return {
      x: W - ((clientX - rect.left) * scaleX),
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (drawMode !== "mouse") return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    if (!pt) return;
    mouseDrawingRef.current = true;
    mouseLastPtRef.current = pt;
    curPathRef.current = [pt];
  }, [drawMode, getCanvasCoords]);

  const handlePointerMove = useCallback((e) => {
    if (!mouseDrawingRef.current || drawMode !== "mouse") return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    if (!pt) return;
    const dc = drawRef.current;
    if (!dc) return;
    const ctx = dc.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = sizeRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(mouseLastPtRef.current.x, mouseLastPtRef.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    mouseLastPtRef.current = pt;
    curPathRef.current.push(pt);
  }, [drawMode, getCanvasCoords]);

  const handlePointerUp = useCallback(() => {
    if (!mouseDrawingRef.current) return;
    mouseDrawingRef.current = false;
    if (curPathRef.current.length > 1) {
      pathsRef.current.push({
        points: [...curPathRef.current],
        color: colorRef.current,
        size: sizeRef.current,
      });
    }
    curPathRef.current = [];
    mouseLastPtRef.current = null;
  }, []);

  /* ---- INITIALIZATION ---- */
  useEffect(() => {
    let cancelled = false;
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      /* STEP 1: MediaPipe CDN scripts */
      setStatus("loading_scripts");
      const t0 = Date.now();
      while (!(window.Hands && window.HAND_CONNECTIONS)) {
        if (cancelled) return;
        if (Date.now() - t0 > 20000) {
          setErrorMsg("MediaPipe scripts failed to load. You can still draw with mouse mode.");
          setStatus("error");
          setDrawMode("mouse");
          return;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      if (cancelled) return;

      /* STEP 2: Camera (with 8s timeout - faster fallback to mouse) */
      setStatus("starting_camera");
      let stream;
      try {
        // Check permission first (instant check, no hang)
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const perm = await navigator.permissions.query({ name: "camera" });
            if (perm.state === "denied") {
              throw { name: "NotAllowedError", message: "Camera permission denied" };
            }
          } catch (permErr) {
            if (permErr.name === "NotAllowedError") throw permErr;
            // permissions.query not supported for camera in some browsers, continue
          }
        }

        const cameraPromise = navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280, min: 640 }, height: { ideal: 720, min: 480 }, facingMode: "user" },
          audio: false,
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), 8000)
        );
        stream = await Promise.race([cameraPromise, timeoutPromise]);
      } catch (err) {
        let msg;
        if (err.message === "TIMEOUT") {
          msg = "Camera busy or not responding. Close Gemini/other tabs using camera, then reload. Mouse mode active!";
        } else if (err.name === "NotAllowedError") {
          msg = "Camera blocked. Click lock icon in address bar → Camera → Allow, then reload.";
        } else if (err.name === "NotFoundError") {
          msg = "No camera found. Draw with mouse instead!";
        } else if (err.name === "NotReadableError" || err.name === "AbortError") {
          msg = "Camera busy (another app/tab using it). Close other apps and reload.";
        } else {
          msg = "Camera issue: " + err.message + ". Mouse mode active!";
        }
        console.warn("[AirWrite] Camera failed:", err.name || err.message);
        setErrorMsg(msg);
        setStatus("error");
        setDrawMode("mouse");
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      try { await video.play(); } catch (e) {
        setErrorMsg("Could not play video. Mouse mode enabled.");
        setStatus("error");
        setDrawMode("mouse");
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      setCameraReady(true);

      /* STEP 3: MediaPipe Hands model */
      setStatus("loading_model");
      try {
        const hands = new window.Hands({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        hands.onResults(onResults);
        handsRef.current = hands;

        // CRITICAL: Wait for video to be ready before warm-up
        let waitCount = 0;
        while (video.readyState < 2 && waitCount < 50) {
          await new Promise((r) => setTimeout(r, 100));
          waitCount++;
        }

        // Warm-up: triggers WASM model download
        console.log("[AirWrite] Warming up MediaPipe model...");
        await hands.send({ image: video });
        console.log("[AirWrite] Model warm-up complete!");
      } catch (err) {
        console.error("[AirWrite] Model init failed:", err);
        setErrorMsg("Hand tracking failed to load. Mouse mode enabled - draw with mouse!");
        setStatus("error");
        setDrawMode("mouse");
        return;
      }
      if (cancelled) return;

      /* STEP 4: Detection loop */
      setStatus("ready");
      setDrawMode("gesture");
      console.log("[AirWrite] Ready! Gesture detection active.");

      let processing = false;
      let fpsCount = 0;
      let fpsTimer = performance.now();

      const detect = async () => {
        if (cancelled) return;
        const now = performance.now();
        fpsCount++;
        if (now - fpsTimer >= 1000) { setFps(fpsCount); fpsCount = 0; fpsTimer = now; }

        if (!processing && now - lastFrameRef.current >= FRAME_INTERVAL && video.readyState >= 2 && handsRef.current) {
          processing = true;
          lastFrameRef.current = now;
          try {
            await handsRef.current.send({ image: video });
            errorCountRef.current = 0;
          } catch (e) {
            errorCountRef.current++;
            if (errorCountRef.current === 1) {
              console.error("[AirWrite] Detection error:", e.message);
            }
            if (errorCountRef.current >= 30) {
              console.error("[AirWrite] Too many errors, switching to mouse mode");
              setDrawMode("mouse");
              setDebugInfo("Gesture detection failed - Mouse mode active");
              errorCountRef.current = 0;
            }
          }
          processing = false;
        }
        if (!cancelled) { animFrameRef.current = requestAnimationFrame(detect); }
      };
      detect();
    };

    init();
    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [onResults]);

  /* ---- Handlers ---- */
  const handleClear = () => {
    const c = drawRef.current;
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
    pathsRef.current = [];
    curPathRef.current = [];
  };

  const handleUndo = () => { if (pathsRef.current.length) { pathsRef.current.pop(); redraw(); } };

  const handleSave = async () => {
    const c = drawRef.current;
    if (!c) return;
    try {
      await axios.post(`${API}/drawings`, { title: `Drawing ${new Date().toLocaleString()}`, image_data: c.toDataURL("image/png") });
      fetchDrawings();
    } catch (e) { console.error("Save failed:", e); }
  };

  const handleDownload = () => {
    const c = drawRef.current;
    if (!c) return;
    const tmp = document.createElement("canvas");
    tmp.width = W; tmp.height = H;
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
    try { const r = await axios.get(`${API}/drawings`); setDrawings(r.data); } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchDrawings(); }, []);
  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/drawings/${id}`); fetchDrawings(); } catch (e) { console.error(e); }
  };

  const statusText = {
    loading_scripts: "Step 1/3: Loading MediaPipe scripts...",
    starting_camera: "Step 2/3: Starting camera...",
    loading_model: "Step 3/3: Loading AI model (first time ~10s)...",
  };

  return (
    <div className="aw-app" data-testid="air-writing-app">
      <header className="aw-header" data-testid="app-header">
        <div className="aw-logo">
          <Hand size={28} strokeWidth={1.5} />
          <h1>AirWrite</h1>
        </div>
        <div className="aw-header-right">
          {status === "ready" && <span className="aw-fps" data-testid="fps-counter">{fps} FPS</span>}
          {/* New Creation button */}
          {onNewCreation && (
            <button className="aw-mode-btn active" onClick={onNewCreation} data-testid="new-creation-btn">
              <Pen size={14} /> New Creation
            </button>
          )}
          {onHome && (
            <button className="aw-mode-btn" onClick={onHome} data-testid="home-btn">
              Home
            </button>
          )}
          {/* Mode toggle */}
          <button
            className={`aw-mode-btn ${drawMode === "mouse" ? "active" : ""}`}
            onClick={() => setDrawMode(drawMode === "gesture" ? "mouse" : "gesture")}
            data-testid="mode-toggle"
            title={drawMode === "gesture" ? "Switch to Mouse Draw" : "Switch to Gesture Draw"}
          >
            {drawMode === "gesture" ? <><Hand size={14} /> Gesture</> : <><Mouse size={14} /> Mouse</>}
          </button>
          <p className="aw-tagline">Smart Air-Writing for Teachers</p>
        </div>
      </header>

      <div className="aw-main">
        <aside className="aw-sidebar" data-testid="control-panel">
          <div className="aw-ctrl-group">
            <label className="aw-label">Brush Color</label>
            <div className="aw-palette">
              {COLORS.map((c) => (
                <button key={c.hex} className={`aw-swatch${color === c.hex ? " active" : ""}`}
                  style={{ background: c.hex }} onClick={() => setColor(c.hex)}
                  data-testid={`color-btn-${c.hex.replace("#", "")}`} title={c.name} />
              ))}
            </div>
            <div className="aw-color-mixer" data-testid="color-mixer">
              <div className="aw-mixer-row">
                <label className="aw-mixer-label"><Pipette size={14} /><span>Mix Your Color</span></label>
                <input type="color" value={color} onChange={(e) => { setColor(e.target.value); addRecentColor(e.target.value); }}
                  className="aw-color-input" data-testid="color-picker-input" />
              </div>
              <div className="aw-current-color" style={{ background: color }} data-testid="current-color-preview">
                <span>{color.toUpperCase()}</span>
              </div>
              {recentColors.length > 0 && (
                <div className="aw-recent-colors">
                  <span className="aw-recent-label">Recent</span>
                  <div className="aw-recent-row">
                    {recentColors.map((c) => (
                      <button key={c} className={`aw-swatch aw-swatch-sm${color === c ? " active" : ""}`}
                        style={{ background: c }} onClick={() => setColor(c)} title={c}
                        data-testid={`recent-color-${c.replace("#", "")}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="aw-ctrl-group">
            <label className="aw-label">Brush Size <span className="aw-size-val">{size}px</span></label>
            <input type="range" min="1" max="20" value={size} onChange={(e) => setSize(Number(e.target.value))}
              className="aw-slider" data-testid="brush-size-slider" />
            <div className="aw-size-preview">
              <span className="aw-dot" style={{ width: size + 4, height: size + 4, background: color }} />
            </div>
          </div>

          <div className="aw-ctrl-group aw-buttons">
            <button onClick={handleClear} className="aw-btn" data-testid="clear-canvas-btn"><Trash2 size={16} /><span>Clear Canvas</span></button>
            <button onClick={handleUndo} className="aw-btn" data-testid="undo-btn"><Undo2 size={16} /><span>Undo</span></button>
            <button onClick={handleSave} className="aw-btn" data-testid="save-btn"><Save size={16} /><span>Save</span></button>
            <button onClick={handleDownload} className="aw-btn" data-testid="download-btn"><Download size={16} /><span>Download</span></button>
          </div>

          <div className="aw-guide" data-testid="gesture-guide">
            <h3 className="aw-guide-title">How to Use</h3>
            <div className="aw-guide-item">
              <PenLine size={18} />
              <div><strong>Pinch to Draw</strong><span>Thumb + Index finger close</span></div>
            </div>
            <div className="aw-guide-item">
              <Hand size={18} />
              <div><strong>Palm to Clear</strong><span>Open palm for 1 second</span></div>
            </div>
            <div className="aw-guide-item">
              <Mouse size={18} />
              <div><strong>Mouse/Touch</strong><span>Switch to Mouse mode in header</span></div>
            </div>
          </div>
        </aside>

        <div className="aw-canvas-area">
          <div
            className="aw-canvas-wrap"
            data-testid="canvas-wrapper"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            <video ref={videoRef} className="aw-video" playsInline muted data-testid="camera-video" />
            <canvas ref={trackRef} className="aw-track-canvas" width={W} height={H} data-testid="tracking-canvas" />
            <canvas ref={drawRef} className="aw-draw-canvas" width={W} height={H} data-testid="drawing-canvas" />

            {/* Gesture badge */}
            <div className={`aw-gesture-badge aw-g-${gesture.toLowerCase().replace("_", "-")}`} data-testid="gesture-status">
              {gesture === "DRAWING" && <><Pen size={14} /><span>Drawing</span></>}
              {gesture === "CLEARING" && (
                <div className="aw-clear-ind"><Hand size={14} /><span>Clearing...</span>
                  <div className="aw-clear-track"><div className="aw-clear-fill" style={{ width: `${clearProg * 100}%` }} /></div>
                </div>
              )}
              {gesture === "CLEARED" && <span>Cleared</span>}
              {gesture === "IDLE" && <><Hand size={14} /><span>Hand Detected</span></>}
              {gesture === "NO_HAND" && <span>{drawMode === "mouse" ? "Mouse Mode" : "Show hand"}</span>}
            </div>

            {/* Debug info */}
            {debugInfo && status === "ready" && (
              <div className="aw-debug" data-testid="debug-info">{debugInfo}</div>
            )}

            {/* Mode indicator */}
            {drawMode === "mouse" && status === "ready" && (
              <div className="aw-mouse-hint" data-testid="mouse-hint">
                <Mouse size={16} /> Click and drag to draw
              </div>
            )}

            {/* Loading overlay */}
            {status !== "ready" && status !== "error" && (
              <div className="aw-loading" data-testid="loading-overlay">
                {cameraReady && <Video size={24} className="aw-cam-ok" />}
                <Loader2 size={36} className="aw-spin" />
                <p>{statusText[status]}</p>
              </div>
            )}

            {/* Error overlay - partial, still allows mouse drawing */}
            {status === "error" && (
              <div className="aw-error-banner" data-testid="error-overlay">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="aw-gallery-bar" data-testid="gallery-section">
        <button onClick={() => setGallery(!gallery)} className="aw-gallery-toggle" data-testid="gallery-toggle-btn">
          {gallery ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>Saved Drawings ({drawings.length})</span>
        </button>
      </div>

      {gallery && (
        <div className="aw-gallery" data-testid="drawings-gallery">
          {drawings.length === 0 ? (
            <p className="aw-gallery-empty">No saved drawings yet!</p>
          ) : drawings.map((d) => (
            <div key={d.id} className="aw-gallery-card" data-testid={`drawing-card-${d.id}`}>
              <img src={d.image_data} alt={d.title} />
              <div className="aw-gallery-meta">
                <span>{d.title}</span>
                <button onClick={() => handleDelete(d.id)} data-testid={`delete-drawing-${d.id}`} className="aw-gallery-del"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
