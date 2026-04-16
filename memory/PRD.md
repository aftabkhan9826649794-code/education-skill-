# AirWrite - Smart Air-Writing Tool for Teachers

## Problem Statement
Smart Air-Writing with Gesture Control for a teacher building for educational help. RCB Luxury theme. Native Canvas API. Mouse/touch fallback.

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React.js + MediaPipe Hands (CDN) + Native Canvas API
- **Camera**: Native `<video>` + `getUserMedia` + `requestAnimationFrame`
- **Drawing**: Hybrid: Gesture (pinch) + Mouse/Touch fallback

## Implemented Features (Jan 2026)
- [x] Gesture Mode: Pinch to Draw (threshold 0.03), Palm to Clear (1s)
- [x] Mouse/Touch Mode: Click-drag drawing as backup
- [x] Auto-switch to mouse when camera/MediaPipe unavailable
- [x] Mode toggle (Gesture/Mouse) in header
- [x] Non-blocking error banner (top bar, not full overlay)
- [x] Debug info panel (pinch distance, hand detection status)
- [x] Native `<video>` element (visible, CSS mirrored)
- [x] Native Canvas API only (beginPath/moveTo/lineTo)
- [x] FPS-gated detection at 18 FPS, maxNumHands: 1
- [x] RCB Theme: #301934 bg, #8B0000 buttons, #D4AF37 gold borders
- [x] Sidebar: flex column, flex-start, gap 15px, padding 20px
- [x] Buttons: width 100%, border-radius 8px, text-align left
- [x] 20 color swatches + Photoshop color mixer + recent colors
- [x] Save/Download/Undo/Clear + Gallery with MongoDB
- [x] Step-by-step initialization with status messages
- [x] Auto error recovery (30 failures → mouse mode)

## Testing (6 Iterations)
- All iterations: Backend 100%, Frontend 100%
- RCB theme CSS values verified exact match
- Mouse drawing verified via click-drag simulation

## Backlog
- P1: Whiteboard mode, Fullscreen presentation
- P2: OCR, Rainbow brush
- P3: Classroom broadcast, Session recording
