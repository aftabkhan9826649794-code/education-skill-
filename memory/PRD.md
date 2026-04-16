# AirWrite - Smart Air-Writing Tool for Teachers

## Original Problem Statement
Build "Smart Air-Writing" with Gesture Control (Hybrid Mode) for a teacher making it for educational help. Final rebuild with RCB Luxury Theme and optimized native Canvas API.

### Core Requirements
1. **Native HTML5 Canvas API**: Only `beginPath()`, `moveTo()`, `lineTo()` for drawing
2. **FPS-gated loop**: 15-20 FPS via `requestAnimationFrame` to save CPU
3. **Pinch Gesture**: Normalized threshold < 0.03 (resolution-independent)
4. **Palm Clear**: Full palm > 1 second to auto-clear canvas
5. **Single MediaPipe instance**: maxNumHands: 1
6. **HD Camera**: 1280x720 via manual `getUserMedia`
7. **RCB Luxury Theme**: #301934 bg, #8B0000 red buttons, #D4AF37 gold borders

## Architecture
- **Backend**: FastAPI + MongoDB (drawings collection)
- **Frontend**: React.js + MediaPipe Hands (CDN) + Native Canvas API
- **Camera**: Manual `navigator.mediaDevices.getUserMedia` + `requestAnimationFrame`
- **Hand Tracking**: MediaPipe Hands JS (CDN), single instance

## User Persona
- Teacher using tool for classroom demonstrations and educational help
- Students need vibrant colors for engagement

## What's Been Implemented (Jan 2026)
- [x] Native Canvas API drawing (beginPath/moveTo/lineTo only)
- [x] FPS-gated detection loop at 18 FPS (TARGET_FPS=18)
- [x] Normalized pinch threshold (0.03) - resolution independent
- [x] Full palm gesture > 1s clears canvas
- [x] Single MediaPipe instance, maxNumHands: 1
- [x] HD camera 1280x720 via manual getUserMedia
- [x] RCB Luxury Theme: Deep Royal Purple (#301934) + RCB Red (#8B0000) + Gold (#D4AF37)
- [x] Sidebar: flex column, flex-start, gap 15px, padding 20px
- [x] Buttons: width 100%, border-radius 8px, text-align left, 2px gold border
- [x] Save & Clear buttons strictly LEFT-aligned
- [x] All text in Gold or White
- [x] 20 color swatches with name tooltips in 5-column grid
- [x] Photoshop-style color mixer: native HTML5 color picker + preview + recent colors
- [x] Image smoothing for HD quality rendering
- [x] FPS counter in header
- [x] Gesture states: NO_HAND, IDLE (Hand Detected), DRAWING, CLEARING, CLEARED
- [x] Save/Download/Undo/Clear functionality
- [x] Drawing gallery with MongoDB persistence
- [x] Responsive layout for mobile/tablet

## API Endpoints
- GET /api/ - Health message
- GET /api/health - Health check
- POST /api/drawings - Save drawing (base64 image)
- GET /api/drawings - List saved drawings (sorted by created_at desc)
- DELETE /api/drawings/{id} - Delete drawing

## Testing Results (Iteration 4)
- Backend: 100% pass rate
- Frontend: 100% pass rate
- All CSS values verified: #301934 bg, #8B0000 buttons, #D4AF37 borders
- Sidebar layout verified: flex column, flex-start, gap 15px, padding 20px
- Button compliance verified: width 100%, text-align left, border-radius 8px

## Backlog
- P1: Whiteboard mode (dark/light background toggle)
- P1: Fullscreen presentation mode
- P2: Text recognition (OCR) from air-writing
- P2: Rainbow brush mode (auto-changing colors)
- P3: Classroom broadcast/sharing
- P3: Recording/playback of writing sessions
