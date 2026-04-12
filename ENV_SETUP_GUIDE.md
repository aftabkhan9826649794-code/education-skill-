# ============================================
# WINGS GLOBAL EDU-SKILL HUB
# Complete Environment Setup Guide
# ============================================

## 📁 File Structure:
```
/app/
├── backend/.env          (Backend configuration)
├── frontend/.env         (Frontend configuration)
├── .env.backend.example  (Backend template - THIS FILE)
└── .env.frontend.example (Frontend template)
```

## 🚀 Quick Setup Instructions:

### For Backend (.env file in /app/backend/):
```bash
# Copy the example file
cp /app/.env.backend.example /app/backend/.env

# Edit the file with your values
nano /app/backend/.env
```

**Required Changes:**
1. ✅ MONGO_URL - Update if using MongoDB Atlas
2. ✅ JWT_SECRET - Generate new secret for production
3. ✅ EMERGENT_LLM_KEY - Already provided (or get new one)
4. ✅ Change test account passwords

**Optional (If using real payments/emails):**
- RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
- SENDGRID_API_KEY
- TWILIO credentials

---

### For Frontend (.env file in /app/frontend/):
```bash
# Copy the example file
cp /app/.env.frontend.example /app/frontend/.env

# Edit the file with your values
nano /app/frontend/.env
```

**Required Changes:**
1. ✅ REACT_APP_BACKEND_URL - Update to your backend URL

---

## 🔐 Security Best Practices:

### 1. Generate New JWT Secret:
```bash
# Run this command to generate a secure random key:
python3 -c "import secrets; print(secrets.token_hex(32))"

# Copy the output and paste in JWT_SECRET
```

### 2. MongoDB Atlas Setup:
```bash
# If using MongoDB Atlas (recommended for production):
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
DB_NAME=wings_production
```

### 3. Backend URL Setup:
```bash
# Development (Emergent)
REACT_APP_BACKEND_URL=https://preview-abc123.emergent.run

# Production (Custom Domain)
REACT_APP_BACKEND_URL=https://api.wingsedu.com

# Local Development
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📦 Deployment Checklist:

### Before Deployment:
- [ ] Generate new JWT_SECRET
- [ ] Update MONGO_URL to production database
- [ ] Change all test account passwords
- [ ] Set CORS_ORIGINS to your domain
- [ ] Update REACT_APP_BACKEND_URL
- [ ] Add real payment gateway keys (if needed)
- [ ] Test all environment variables

### After Deployment:
- [ ] Verify backend is accessible
- [ ] Test authentication flow
- [ ] Check database connection
- [ ] Verify PDF generation works
- [ ] Test payment flows (if implemented)

---

## 🧪 Test Credentials (Default):

**Admin:**
- Email: admin@wingsedu.com
- Password: WingsAdmin@2026

**Student:**
- Email: student@test.com
- Password: Student@123

**Parent:**
- Email: parent@test.com
- Password: Parent@123

**D.E.O. Admin Portal:**
- Username: DEO-001
- Password: test123

⚠️ **IMPORTANT:** Change these passwords in production!

---

## 🆘 Troubleshooting:

### Issue: Backend not connecting to frontend
**Solution:** Check REACT_APP_BACKEND_URL and ensure it includes protocol (http:// or https://)

### Issue: Database connection failed
**Solution:** Verify MONGO_URL is correct and MongoDB is running

### Issue: JWT token errors
**Solution:** Ensure JWT_SECRET is the same across all backend instances

### Issue: AI features not working
**Solution:** Verify EMERGENT_LLM_KEY is correctly set

---

## 📞 Support:

For deployment help:
- Check Emergent documentation
- Contact: support@emergent.ai
- Platform: https://emergent.ai

For platform-specific issues:
- Review error logs: /var/log/supervisor/
- Check database connection
- Verify all environment variables are set

---

## 🎯 Current Setup (This Project):

✅ Backend URL: Configured automatically by Emergent
✅ Database: Local MongoDB (upgrade to Atlas for production)
✅ Authentication: JWT with bcrypt
✅ LLM Integration: Emergent LLM Key
✅ Payments: Mock (add real keys for production)
✅ Emails/SMS: Mock (add real keys for production)

**Your platform is ready to use with current configuration!**
**Update .env files before deploying to production.**
