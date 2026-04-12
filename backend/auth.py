"""
Authentication System for WINGS EDU-SKILL HUB
Handles Student, Parent, and Admin authentication with JWT tokens
"""
import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
from typing import Optional

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    """Get JWT secret from environment"""
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET not found in environment variables")
    return secret

# Password Hashing Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash"""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

# JWT Token Functions
def create_access_token(user_id: str, email: str, role: str) -> str:
    """Create access token (15 min expiry)"""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    """Create refresh token (7 days expiry)"""
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def set_auth_cookies(response, access_token: str, refresh_token: str):
    """Set httpOnly cookies for authentication"""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,  # 15 minutes
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,  # 7 days
        path="/"
    )

def clear_auth_cookies(response):
    """Clear authentication cookies"""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")

async def get_current_user(request: Request, db) -> dict:
    """
    Extract and verify JWT token from cookies or Authorization header
    Returns user dict without password_hash
    """
    # Try cookie first
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Decode token
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        # Get user from database
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Remove password_hash from response
        user.pop("password_hash", None)
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Brute Force Protection
async def check_brute_force(db, identifier: str) -> bool:
    """
    Check if account is locked due to brute force attempts
    Returns True if locked, False if OK
    """
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    
    if not attempts:
        return False
    
    # Check if locked (5+ failed attempts within 15 min)
    if attempts.get("count", 0) >= 5:
        lock_until = attempts.get("locked_until")
        if lock_until and datetime.now(timezone.utc) < lock_until:
            return True
    
    return False

async def record_failed_login(db, identifier: str):
    """Record failed login attempt"""
    existing = await db.login_attempts.find_one({"identifier": identifier})
    
    if existing:
        count = existing.get("count", 0) + 1
        locked_until = None
        
        if count >= 5:
            locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {
                "$set": {
                    "count": count,
                    "last_attempt": datetime.now(timezone.utc),
                    "locked_until": locked_until
                }
            }
        )
    else:
        await db.login_attempts.insert_one({
            "identifier": identifier,
            "count": 1,
            "last_attempt": datetime.now(timezone.utc),
            "locked_until": None
        })

async def clear_login_attempts(db, identifier: str):
    """Clear login attempts on successful login"""
    await db.login_attempts.delete_one({"identifier": identifier})
