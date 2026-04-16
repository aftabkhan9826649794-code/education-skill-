# AirWrite - Smart Air-Writing Tool for Teachers

## Original Problem Statement
Build "Smart Air-Writing" with Gesture Control for a teacher (educational help). RCB Luxury theme. Native Canvas API. Optimized performance.

## Architecture
- **Backend**: FastAPI + MongoDB (drawings collection)
- **Frontend**: React.js + MediaPipe Hands (CDN) + Native Canvas API
- **Camera**: Native `<video>` element + manual `getUserMedia` + `requestAnimationFrame`
- **Mirroring**: CSS `transform: scaleX(-1)` on video + both canvases

## What's Been Implemented (Jan 2026)
- [x] **Camera Fix v3**: Video element is now VISIBLE (native `<video>`, not hidden). Camera shows IMMEDIATELY when permission granted. MediaPipe model loads separately in background.
- [x] **CSS Mirroring**: All 3 visual layers (video, tracking canvas, drawing canvas) use `transform: scaleX(-1)` - simpler and more reliable than canvas-based mirroring
- [x] **Step-by-step init**: Scripts → Camera → Model → Detect loop (with status UI)
- [x] **FUNCTION 1: Pinch to Draw**: Normalized threshold < 0.03, tracks Landmark 8
- [x] **FUNCTION 2: Palm to Clear**: Full palm hold > 1 second auto-clears canvas
- [x] Native Canvas API only (beginPath/moveTo/lineTo)
- [x] FPS-gated loop at 18 FPS, maxNumHands: 1
- [x] RCB Luxury Theme: #301934 bg, #8B0000 buttons, #D4AF37 gold borders
- [x] Sidebar: flex column, flex-start, gap 15px, padding 20px
- [x] Buttons: width 100%, border-radius 8px, text-align left
- [x] 20 color swatches + Photoshop-style color mixer + recent colors
- [x] Save/Download/Undo/Clear, Drawing gallery with MongoDB

## Testing (Iteration 5)
- Backend: 100%, Frontend: 100%
- Video element: display:block, transform scaleX(-1) ✓
- Both canvases: transform scaleX(-1) ✓
- RCB theme: all CSS values exact match ✓

## Backlog
- P1: Whiteboard mode, Fullscreen presentation
- P2: OCR from air-writing, Rainbow brush
- P3: Classroom broadcast, Session recording
