# AirWrite - Smart Air-Writing Tool for Teachers

## Original Problem Statement
Build "Smart Air-Writing" with Gesture Control (Hybrid Mode) for a teacher who wants to use it for educational help purposes.

### Core Requirements
1. **Pinch Gesture Activation**: Drawing only starts when thumb_tip and index_finger_tip distance < 30px
2. **Air-Writing**: Track Landmark 8 (index finger tip) for drawing on overlay canvas
3. **Clear Gesture**: Full Palm (all fingers extended) for 2 seconds triggers canvas.clear()
4. **UI**: Deep Royal Purple (#301934) background, Gold (#D4AF37) borders on all controls
5. **Button Alignment**: All buttons strictly LEFT-aligned
6. **Performance**: Single MediaPipe instance, maxNumHands: 1

## Architecture
- **Backend**: FastAPI (Python) with MongoDB for drawing persistence
- **Frontend**: React.js with MediaPipe Hands (CDN) for hand tracking
- **Database**: MongoDB (drawings collection)
- **Hand Tracking**: MediaPipe Hands JS via CDN (camera_utils, drawing_utils, hands)

## User Persona
- Teacher using the tool for classroom/educational demonstrations
- Needs simple, intuitive gesture-based writing
- Save/download drawings for later reference

## What's Been Implemented (Jan 2026)
- [x] MediaPipe hand tracking with single instance (maxNumHands: 1)
- [x] Pinch gesture detection (landmark 4 + 8 distance < 30px)
- [x] Air-writing tracking Landmark 8 with smoothing
- [x] Full palm gesture (all fingers extended) for 2s → clear canvas
- [x] Mirrored webcam view with hand skeleton overlay
- [x] Drawing canvas with color palette (20 colors with tooltips - kid-friendly)
- [x] Brush size slider (1-20px)
- [x] Clear, Undo, Save, Download buttons (all LEFT-aligned)
- [x] Deep Royal Purple (#301934) bg + Gold (#D4AF37) borders
- [x] Gesture status badge (IDLE/DRAWING/CLEARING/CLEARED)
- [x] Gesture guide panel
- [x] Save drawings to MongoDB, gallery view
- [x] Download drawings as PNG
- [x] Responsive layout
- [x] Error handling for camera access denial
- [x] BUG FIX: useEffect race condition - removed loading from deps, added initDoneRef guard
- [x] Expanded color palette from 8 to 20 colors (Gold, White, Red, Green, Blue, Pink, Mint, Orange, Magenta, Cyan, Yellow, Hot Pink, Spring, Purple, Tomato, Turquoise, Rose, Lime, Lavender, Amber)
- [x] BUG FIX: Replaced MediaPipe Camera utility with manual getUserMedia + requestAnimationFrame loop for reliable camera initialization
- [x] BUG FIX: Increased pinch threshold from 30px to 55px for better real-world detection
- [x] Lowered detection confidence from 0.7 to 0.5 for better hand detection
- [x] Added image smoothing (imageSmoothingQuality: "high") for better video quality
- [x] Added Photoshop-style color mixer: native HTML color picker input + color preview with hex code + recent colors (up to 5)
- [x] Better gesture feedback: NO_HAND vs IDLE (Hand Detected - Ready) vs DRAWING vs CLEARING

## API Endpoints
- GET /api/ - Health message
- GET /api/health - Health check
- POST /api/drawings - Save drawing (base64 image)
- GET /api/drawings - List saved drawings
- DELETE /api/drawings/{id} - Delete drawing

## Tech Stack
- React 19, Tailwind CSS, Lucide React icons
- FastAPI, Motor (async MongoDB), Pydantic
- MediaPipe Hands JS (CDN)
- Fonts: Syne (headings), Plus Jakarta Sans (body)

## Testing Results
- Backend: 100% pass rate
- Frontend: 100% pass rate
- Colors verified: #301934 (Royal Purple), #D4AF37 (Gold)
- Alignment verified: All buttons flex-start / text-align left

## Backlog / Future Features
- P1: Multi-hand support toggle
- P1: Whiteboard mode (clean background instead of webcam)
- P2: Text recognition (OCR) from air-writing
- P2: Classroom sharing (real-time broadcast)
- P3: Custom gesture shortcuts
- P3: Recording/playback of writing sessions
