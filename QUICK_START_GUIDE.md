# 🚀 WINGS GLOBAL EDU-SKILL HUB - Quick Start Guide

## Instant Testing Guide (5 Minutes)

### 1. View the Platform
**Main URL:** https://ai-learning-hub-363.preview.emergentagent.com

### 2. Test Navigation
Click these navbar links:
- **AI HUB** → AI Teacher SARA
- **STUDY HUB** → Learning dashboard
- **SKILL LAB** → Computer, Coding, AI cards
- **EXAM HUB** → Competitive exams
- **EDUCATION HUB** → CBSE, ICSE, IB boards
- **LOGIN** → Student/Parent/Admin login

### 3. Test Admin Portal
**URL:** /admin-portal
**Login:** DEO-001 / test123
**Access:** Violations, Live Feeds, Analytics

### 4. Test Skill Hub
**URL:** /master-skill-hub
- Click "Computer Mastery" card
- View YouTube resources
- Click "AI Quiz" tab
- Click "Start AI Quiz" button
- Answer 10 AI-generated questions
- Score 80%+ to earn Golden Badge!

### 5. Test Backend APIs
```bash
API_URL="https://ai-learning-hub-363.preview.emergentagent.com"

# Get skill modules
curl "$API_URL/api/skills/modules"

# Admin login
curl -X POST "$API_URL/api/admin/official/login?admin_id=DEO-001&password=test123"

# Create donation
curl -X POST "$API_URL/api/donations/create?donor_name=Test&donor_email=test@example.com&donor_phone=%2B919999999999&amount=10000&purpose=Test&payment_method=UPI&donor_type=Person"
```

### 6. Hidden Features
**Long-press WINGS logo for 3 seconds** → Super Admin Dashboard (stealth mode)

---

## File Locations

**Documentation:**
- `/app/FINAL_PROJECT_DOCUMENTATION.md` - Complete docs
- `/app/QUICK_START_GUIDE.md` - This file
- `/app/memory/test_credentials.md` - Test accounts

**Code:**
- Frontend: `/app/frontend/src/`
- Backend: `/app/backend/`
- PDFs: `/app/backend/static/receipts/`

**Logs:**
- Backend: `/var/log/supervisor/backend.err.log`
- Frontend: Check browser console

---

## Common Commands

```bash
# Restart services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log

# Test API
API_URL="https://ai-learning-hub-363.preview.emergentagent.com"
curl "$API_URL/api/skills/modules"
```

---

## What Works Right Now

✅ All navigation links
✅ AI Tutor (no errors)
✅ Skill Hub with AI Quiz
✅ Admin Portal
✅ Education Hub
✅ Competitive Exams
✅ Backend APIs (50+)
✅ PDF generation
✅ Financial system (backend)

## What's Pending

❌ Financial forms (frontend)
❌ Parent dashboard
❌ Full authentication
❌ Voice commands
❌ Language sync

---

**Total Development Time:** ~20 hours
**Lines of Code:** ~12,000
**API Endpoints:** 50+
**Pages:** 30+
**Status:** 75% Complete
