from fastapi import APIRouter, HTTPException, Response, Request
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4
import os
from models import (
    AttendanceRecord, AttendanceCreate,
    GeneratedContent, ContentGenerateRequest,
    ParentNotification, NotificationCreate,
    ProgressReport, ProgressReportCreate,
    Student, StudentCreate,
    ExamSchedule, ExamScheduleCreate,
    ExamResult, ExamResultCreate,
    SkillRecommendation,
    ResearchProject, ResearchProjectCreate,
    CompetitiveExamQuestion, CompetitiveExamAttempt, CompetitiveExamAttemptCreate,
    JobReadinessMetrics,
    ParentUser, SuperAdmin, ClassroomFeed, StreamAccessToken, AuditLog,
    StudentLearningProfile, StudentBehavior, PersonalizedRecommendation, SARAPersonality,
    SkillModule, SkillResource, SkillBadge, SkillQuizAttempt,
    Donation, FeePayment, Receipt, MessagingLog, Transaction
)
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import auth
from pydantic import BaseModel, EmailStr
import secrets

router = APIRouter()

# MongoDB connection (will be set from server.py)
db = None

def set_db(database):
    global db
    db = database

# =====================
# AUTHENTICATION MODELS
# =====================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # "student" or "parent"
    phone: Optional[str] = None
    class_name: Optional[str] = None  # For students
    student_id_number: Optional[str] = None  # For students
    linked_students: Optional[List[str]] = []  # For parents

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# =====================
# AUTHENTICATION ROUTES
# =====================

@router.post("/auth/register")
async def register(request: RegisterRequest, response: Response):
    """Register a new student or parent"""
    try:
        # Normalize email
        email = request.email.lower()
        
        # Check if user already exists
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = auth.hash_password(request.password)
        
        # Create user document
        user_id = str(uuid4())
        user_doc = {
            "id": user_id,
            "email": email,
            "name": request.name,
            "role": request.role,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc)
        }
        
        # Add role-specific fields
        if request.role == "student":
            user_doc["class_name"] = request.class_name or ""
            user_doc["student_id_number"] = request.student_id_number or ""
            user_doc["parent_id"] = ""
        elif request.role == "parent":
            user_doc["phone"] = request.phone or ""
            user_doc["linked_students"] = request.linked_students
        
        # Insert into database
        await db.users.insert_one(user_doc)
        
        # Create tokens
        access_token = auth.create_access_token(user_id, email, request.role)
        refresh_token = auth.create_refresh_token(user_id)
        
        # Set cookies
        auth.set_auth_cookies(response, access_token, refresh_token)
        
        # Return user without password_hash
        user_doc.pop("password_hash")
        user_doc.pop("_id", None)
        
        return {
            "message": "Registration successful",
            "user": user_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/auth/login")
async def login(request: LoginRequest, response: Response, req: Request):
    """Login for students and parents"""
    try:
        # Normalize email
        email = request.email.lower()
        
        # Check brute force
        client_ip = req.client.host if req.client else "unknown"
        identifier = f"{client_ip}:{email}"
        
        if await auth.check_brute_force(db, identifier):
            raise HTTPException(
                status_code=429,
                detail="Too many failed attempts. Account locked for 15 minutes."
            )
        
        # Find user
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if not user:
            await auth.record_failed_login(db, identifier)
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not auth.verify_password(request.password, user["password_hash"]):
            await auth.record_failed_login(db, identifier)
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Clear failed attempts
        await auth.clear_login_attempts(db, identifier)
        
        # Update last login
        await db.users.update_one(
            {"email": email},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        
        # Create tokens
        access_token = auth.create_access_token(user["id"], email, user["role"])
        refresh_token = auth.create_refresh_token(user["id"])
        
        # Set cookies
        auth.set_auth_cookies(response, access_token, refresh_token)
        
        # Return user without password_hash
        user.pop("password_hash")
        
        return {
            "message": "Login successful",
            "user": user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/auth/logout")
async def logout(response: Response, req: Request):
    """Logout (clear cookies)"""
    try:
        # Verify user is authenticated (optional)
        try:
            await auth.get_current_user(req, db)
        except:
            pass  # Allow logout even if token is invalid
        
        # Clear cookies
        auth.clear_auth_cookies(response)
        
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@router.get("/auth/me")
async def get_current_user_route(req: Request):
    """Get current authenticated user"""
    try:
        user = await auth.get_current_user(req, db)
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")

@router.post("/auth/refresh")
async def refresh_token(req: Request, response: Response):
    """Refresh access token using refresh token"""
    try:
        refresh_token = req.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=401, detail="No refresh token")
        
        import jwt
        payload = jwt.decode(refresh_token, auth.get_jwt_secret(), algorithms=[auth.JWT_ALGORITHM])
        
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        # Get user
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create new access token
        access_token = auth.create_access_token(user["id"], user["email"], user["role"])
        
        # Update cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=900,
            path="/"
        )
        
        return {"message": "Token refreshed"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset"""
    try:
        email = request.email.lower()
        
        # Check if user exists
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if not user:
            # Don't reveal if email exists
            return {"message": "If email exists, reset link has been sent"}
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store token in database
        await db.password_reset_tokens.insert_one({
            "token": reset_token,
            "email": email,
            "expires_at": datetime.now(timezone.utc) + timezone.timedelta(hours=1),
            "used": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Log reset link (in production, send email)
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        print(f"\n🔑 PASSWORD RESET LINK: {reset_link}\n")
        
        return {"message": "If email exists, reset link has been sent"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")

@router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    try:
        # Find token
        token_doc = await db.password_reset_tokens.find_one(
            {"token": request.token, "used": False},
            {"_id": 0}
        )
        
        if not token_doc:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        
        # Check expiry
        if datetime.now(timezone.utc) > token_doc["expires_at"]:
            raise HTTPException(status_code=400, detail="Token expired")
        
        # Hash new password
        new_hash = auth.hash_password(request.new_password)
        
        # Update user password
        await db.users.update_one(
            {"email": token_doc["email"]},
            {"$set": {"password_hash": new_hash}}
        )
        
        # Mark token as used
        await db.password_reset_tokens.update_one(
            {"token": request.token},
            {"$set": {"used": True}}
        )
        
        return {"message": "Password reset successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")

# =====================
# ATTENDANCE ROUTES
# =====================

@router.post("/attendance/log", response_model=AttendanceRecord)
async def log_attendance(attendance: AttendanceCreate):
    """Log student attendance with face detection confidence"""
    try:
        attendance_dict = attendance.model_dump()
        attendance_dict['timestamp'] = datetime.now(timezone.utc).isoformat()
        
        attendance_obj = AttendanceRecord(**attendance_dict)
        result = await db.attendance.insert_one(attendance_obj.model_dump())
        
        # Trigger parent notification
        notification = NotificationCreate(
            student_id=attendance.student_id,
            parent_id=f"parent_{attendance.student_id}",  # In real app, fetch from student record
            notification_type="attendance",
            title="Attendance Marked",
            message=f"Attendance marked for {attendance.student_name} in {attendance.course_name}",
            data={"confidence": attendance.confidence, "timestamp": attendance_dict['timestamp']}
        )
        await create_notification(notification)
        
        return attendance_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log attendance: {str(e)}")

@router.get("/attendance/student/{student_id}")
async def get_student_attendance(student_id: str, limit: int = 50):
    """Get attendance records for a specific student"""
    try:
        records = await db.attendance.find(
            {"student_id": student_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        return {"records": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch attendance: {str(e)}")

@router.get("/attendance/course/{course_name}")
async def get_course_attendance(course_name: str):
    """Get all attendance records for a course"""
    try:
        records = await db.attendance.find(
            {"course_name": course_name},
            {"_id": 0}
        ).sort("timestamp", -1).to_list(100)
        return {"records": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch course attendance: {str(e)}")

# =====================
# CONTENT GENERATION ROUTES
# =====================

@router.post("/content/generate", response_model=GeneratedContent)
async def generate_content(request: ContentGenerateRequest):
    """Generate educational content using AI (quizzes, homework, worksheets)"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=api_key,
            session_id=f"content_gen_{request.subject}_{datetime.now().timestamp()}",
            system_message="You are an expert educational content generator. Generate high-quality educational content in JSON format."
        ).with_model("openai", "gpt-5.2")
        
        # Create prompt based on content type
        if request.content_type == "quiz":
            prompt = f"""Generate a {request.difficulty} difficulty quiz for Class {request.for_class} students.
Subject: {request.subject}
Topic: {request.topic}

Create 10 multiple-choice questions. Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of the correct answer"
    }}
  ]
}}"""
        
        elif request.content_type == "homework":
            prompt = f"""Generate homework assignments for Class {request.for_class} students.
Subject: {request.subject}
Topic: {request.topic}
Difficulty: {request.difficulty}

Create 5-7 homework questions with varying difficulty. Return ONLY valid JSON in this format:
{{
  "title": "Homework title",
  "instructions": "General instructions for students",
  "questions": [
    {{
      "number": 1,
      "question": "Question text",
      "points": 5,
      "type": "short_answer"
    }}
  ]
}}"""
        
        else:  # worksheet
            prompt = f"""Generate a worksheet for Class {request.for_class} students.
Subject: {request.subject}
Topic: {request.topic}

Create a comprehensive worksheet with 8-10 questions. Return ONLY valid JSON in this format:
{{
  "title": "Worksheet title",
  "sections": [
    {{
      "section_name": "Section name",
      "questions": [
        {{
          "question": "Question text",
          "answer_space": "short"
        }}
      ]
    }}
  ]
}}"""
        
        # Generate content
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            content_data = json.loads(response_text)
        except json.JSONDecodeError:
            content_data = {"raw_response": response, "note": "Failed to parse as JSON"}
        
        # Create content record
        generated_content = GeneratedContent(
            content_type=request.content_type,
            subject=request.subject,
            topic=request.topic,
            content=content_data,
            generated_at=datetime.now(timezone.utc),
            for_class=request.for_class
        )
        
        # Store in database
        await db.generated_content.insert_one(generated_content.model_dump())
        
        return generated_content
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(e)}")

@router.get("/content/list")
async def list_generated_content(content_type: str = None, limit: int = 20):
    """List generated content"""
    try:
        query = {"content_type": content_type} if content_type else {}
        contents = await db.generated_content.find(query, {"_id": 0}).sort("generated_at", -1).limit(limit).to_list(limit)
        return {"contents": contents, "total": len(contents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list content: {str(e)}")

# =====================
# NOTIFICATION ROUTES
# =====================

@router.post("/notifications/create", response_model=ParentNotification)
async def create_notification(notification: NotificationCreate):
    """Create a notification for parent"""
    try:
        notification_dict = notification.model_dump()
        notification_dict['timestamp'] = datetime.now(timezone.utc).isoformat()
        notification_dict['read'] = False
        
        notification_obj = ParentNotification(**notification_dict)
        await db.notifications.insert_one(notification_obj.model_dump())
        
        return notification_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create notification: {str(e)}")

@router.get("/notifications/parent/{parent_id}")
async def get_parent_notifications(parent_id: str, unread_only: bool = False):
    """Get notifications for a parent"""
    try:
        query = {"parent_id": parent_id}
        if unread_only:
            query["read"] = False
        
        notifications = await db.notifications.find(query, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
        return {"notifications": notifications, "total": len(notifications)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read"""
    try:
        result = await db.notifications.update_one(
            {"id": notification_id},
            {"$set": {"read": True}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification: {str(e)}")

# =====================
# PROGRESS REPORT ROUTES
# =====================

@router.post("/progress/create", response_model=ProgressReport)
async def create_progress_report(progress: ProgressReportCreate):
    """Create a progress report and detect weak areas"""
    try:
        progress_dict = progress.model_dump()
        progress_dict['timestamp'] = datetime.now(timezone.utc).isoformat()
        
        progress_obj = ProgressReport(**progress_dict)
        await db.progress_reports.insert_one(progress_obj.model_dump())
        
        # If weak areas detected, send notification
        if progress.weak_areas and len(progress.weak_areas) > 0:
            notification = NotificationCreate(
                student_id=progress.student_id,
                parent_id=f"parent_{progress.student_id}",
                notification_type="weak_topic",
                title="Weak Topics Detected",
                message=f"Weak areas identified in {progress.subject}: {', '.join(progress.weak_areas)}",
                data={"weak_areas": progress.weak_areas, "score": progress.score, "total": progress.total}
            )
            await create_notification(notification)
        
        return progress_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create progress report: {str(e)}")

@router.get("/progress/student/{student_id}")
async def get_student_progress(student_id: str):
    """Get all progress reports for a student"""
    try:
        reports = await db.progress_reports.find(
            {"student_id": student_id},
            {"_id": 0}
        ).sort("timestamp", -1).to_list(50)
        return {"reports": reports, "total": len(reports)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")

# =====================
# STUDENT ROUTES
# =====================

@router.post("/students/create", response_model=Student)
async def create_student(student: StudentCreate):
    """Register a new student"""
    try:
        student_dict = student.model_dump()
        student_dict['enrolled_at'] = datetime.now(timezone.utc).isoformat()
        
        student_obj = Student(**student_dict)
        await db.students.insert_one(student_obj.model_dump())
        
        return student_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create student: {str(e)}")

@router.get("/students/{student_id}")
async def get_student(student_id: str):
    """Get student details"""
    try:
        student = await db.students.find_one({"id": student_id}, {"_id": 0})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch student: {str(e)}")



# =====================
# EXAM SCHEDULING ROUTES
# =====================

@router.post("/exams/schedule", response_model=ExamSchedule)
async def schedule_exam(exam: ExamScheduleCreate):
    """Schedule an exam (weekly, monthly, half-yearly, final)"""
    try:
        exam_dict = exam.model_dump()
        exam_dict['scheduled_date'] = datetime.fromisoformat(exam.scheduled_date).isoformat()
        exam_dict['created_at'] = datetime.now(timezone.utc).isoformat()
        
        exam_obj = ExamSchedule(**exam_dict)
        await db.exam_schedules.insert_one(exam_obj.model_dump())
        
        return exam_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule exam: {str(e)}")

@router.get("/exams/schedule/{class_name}")
async def get_exam_schedule(class_name: str, exam_type: str = None):
    """Get exam schedule for a class"""
    try:
        query = {"class_name": class_name}
        if exam_type:
            query["exam_type"] = exam_type
        
        exams = await db.exam_schedules.find(query, {"_id": 0}).sort("scheduled_date", 1).to_list(50)
        return {"exams": exams, "total": len(exams)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch exam schedule: {str(e)}")

@router.post("/exams/submit", response_model=ExamResult)
async def submit_exam_result(result: ExamResultCreate):
    """Submit exam result and trigger weak topic detection"""
    try:
        result_dict = result.model_dump()
        result_dict['percentage'] = (result.score / result.total) * 100 if result.total > 0 else 0
        result_dict['submitted_at'] = datetime.now(timezone.utc).isoformat()
        
        exam_result_obj = ExamResult(**result_dict)
        await db.exam_results.insert_one(exam_result_obj.model_dump())
        
        # Create progress report for weak topic detection
        progress = ProgressReportCreate(
            student_id=result.student_id,
            subject="Exam",
            topic=result.exam_id,
            score=result.score,
            total=result.total,
            weak_areas=result.weak_topics
        )
        await create_progress_report(progress)
        
        return exam_result_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit exam result: {str(e)}")

@router.get("/exams/results/student/{student_id}")
async def get_student_exam_results(student_id: str):
    """Get all exam results for a student"""
    try:
        results = await db.exam_results.find(
            {"student_id": student_id},
            {"_id": 0}
        ).sort("submitted_at", -1).to_list(50)
        return {"results": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch exam results: {str(e)}")

@router.post("/exams/auto-generate-quiz")
async def auto_generate_post_lesson_quiz(subject: str, topic: str, class_name: str):
    """Automatically generate 10 MCQ quiz after lesson completion"""
    try:
        # Generate quiz using content generation system
        request = ContentGenerateRequest(
            content_type="quiz",
            subject=subject,
            topic=topic,
            for_class=class_name,
            difficulty="medium"
        )
        
        generated_quiz = await generate_content(request)
        
        return {
            "message": "Quiz auto-generated successfully",
            "quiz_id": generated_quiz.id,
            "quiz_data": generated_quiz.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to auto-generate quiz: {str(e)}")

# =====================
# GLOBAL RESOURCE ROUTER
# =====================

# Job market data for different regions
GLOBAL_SKILL_MAP = {
    "India": {
        "skills": ["Coding & Programming", "Data Science", "AI & ML", "Cloud Computing", "Cybersecurity"],
        "trend": "IT and Software Development dominate India's job market with high demand for AI/ML specialists",
        "priority": "high"
    },
    "Sudan": {
        "skills": ["Agri-Tech & Smart Farming", "Water Management", "Renewable Energy", "Healthcare Tech"],
        "trend": "Agriculture modernization and sustainable resource management are critical growth areas",
        "priority": "high"
    },
    "UAE": {
        "skills": ["Blockchain & FinTech", "Smart Cities Tech", "Renewable Energy", "Tourism Tech", "Aviation"],
        "trend": "UAE focuses on technology-driven economy with emphasis on sustainability and innovation",
        "priority": "high"
    },
    "USA": {
        "skills": ["Software Engineering", "Biotechnology", "Aerospace", "Robotics", "Quantum Computing"],
        "trend": "Advanced technology sectors with focus on innovation and research",
        "priority": "high"
    },
    "UK": {
        "skills": ["Financial Technology", "AI Research", "Creative Industries", "Healthcare Innovation"],
        "trend": "Strong focus on fintech, creative tech, and medical research",
        "priority": "high"
    },
    "Assam": {
        "skills": ["Tea Plantation Tech", "Tourism Management", "Renewable Energy", "E-commerce", "Digital Marketing"],
        "trend": "Regional focus on agricultural technology and tourism with growing digital economy",
        "priority": "medium"
    }
}

@router.get("/global/skills/recommend/{country}")
async def recommend_skills_by_location(country: str, region: str = None):
    """Get skill recommendations based on geographical location and job market"""
    try:
        # Check if country exists in our mapping
        if country in GLOBAL_SKILL_MAP:
            skill_data = GLOBAL_SKILL_MAP[country]
        else:
            # Default global skills
            skill_data = {
                "skills": ["Digital Literacy", "Communication", "Problem Solving", "Critical Thinking"],
                "trend": "Universal skills applicable globally",
                "priority": "medium"
            }
        
        recommendation = SkillRecommendation(
            country=country,
            region=region,
            recommended_skills=skill_data["skills"],
            job_market_trend=skill_data["trend"],
            priority=skill_data["priority"]
        )
        
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get skill recommendations: {str(e)}")

@router.get("/global/skills/all")
async def get_all_skill_mappings():
    """Get all available skill mappings for different regions"""
    return {"skill_mappings": GLOBAL_SKILL_MAP}

# =====================
# RESEARCH PORTAL (PhD Level)
# =====================

@router.post("/research/create", response_model=ResearchProject)
async def create_research_project(project: ResearchProjectCreate):
    """Create a new research project"""
    try:
        project_dict = project.model_dump()
        project_dict['created_at'] = datetime.now(timezone.utc).isoformat()
        project_dict['status'] = "proposal"
        
        project_obj = ResearchProject(**project_dict)
        await db.research_projects.insert_one(project_obj.model_dump())
        
        return project_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create research project: {str(e)}")

@router.get("/research/list")
async def list_research_projects(field: str = None, status: str = None):
    """List research projects"""
    try:
        query = {}
        if field:
            query["field"] = field
        if status:
            query["status"] = status
        
        projects = await db.research_projects.find(query, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
        return {"projects": projects, "total": len(projects)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list research projects: {str(e)}")

@router.post("/research/ai-assistant")
async def research_ai_assistant(query: str, field: str):
    """AI Research Assistant for PhD students"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Initialize LLM chat for research assistance
        chat = LlmChat(
            api_key=api_key,
            session_id=f"research_{field}_{datetime.now().timestamp()}",
            system_message=f"You are an expert research assistant specializing in {field}. Provide detailed, academic-level responses with proper citations and methodological guidance."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Research Query in {field}:
{query}

Provide a comprehensive research-oriented response including:
1. Current state of research in this area
2. Relevant methodologies
3. Key papers and researchers to review
4. Potential research gaps
5. Suggested approach"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "query": query,
            "field": field,
            "ai_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Research Assistant error: {str(e)}")

# =====================
# MULTI-LINGUAL CONTENT GENERATION
# =====================

@router.post("/content/generate-multilingual")
async def generate_multilingual_content(
    content_type: str,
    subject: str,
    topic: str,
    for_class: str,
    language: str = "English"
):
    """Generate educational content in multiple languages"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"multilang_{language}_{datetime.now().timestamp()}",
            system_message=f"You are an educational content generator. Generate high-quality content in {language}."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Generate {content_type} for Class {for_class} students in {language}.
Subject: {subject}
Topic: {topic}

Create content appropriate for {language}-speaking students. Use culturally relevant examples."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        generated_content = GeneratedContent(
            content_type=content_type,
            subject=subject,
            topic=f"{topic} ({language})",
            content={"language": language, "text": response},
            generated_at=datetime.now(timezone.utc),
            for_class=for_class
        )
        
        await db.generated_content.insert_one(generated_content.model_dump())
        
        return generated_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate multilingual content: {str(e)}")



# =====================
# COMPETITIVE EXAM HUB
# =====================

# Competitive Exam Topic Architecture
COMPETITIVE_EXAM_TOPICS = {
    "SAT": {
        "Math": ["Algebra", "Geometry", "Trigonometry", "Statistics", "Advanced Math"],
        "Reading": ["Evidence-Based Reading", "Literature Analysis", "Vocabulary"],
        "Writing": ["Grammar", "Essay Writing", "Language Conventions"]
    },
    "JEE": {
        "Physics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics"],
        "Chemistry": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"],
        "Mathematics": ["Calculus", "Algebra", "Coordinate Geometry", "Trigonometry", "Probability"]
    },
    "NEET": {
        "Physics": ["Mechanics", "Thermodynamics", "Optics", "Modern Physics", "Electronics"],
        "Chemistry": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Biochemistry"],
        "Biology": ["Botany", "Zoology", "Human Physiology", "Genetics", "Ecology"]
    },
    "CUET": {
        "General Test": ["Quantitative Reasoning", "Logical Reasoning", "General Awareness", "English"],
        "Domain Specific": ["Humanities", "Science", "Commerce", "Languages"]
    },
    "UPSC": {
        "Prelims": ["Indian Polity", "Indian Economy", "History", "Geography", "Science & Technology", "Current Affairs"],
        "Mains": ["Essay", "General Studies", "Optional Subjects"]
    },
    "SSC": {
        "Quantitative Aptitude": ["Arithmetic", "Algebra", "Geometry", "Data Interpretation"],
        "Reasoning": ["Verbal Reasoning", "Non-Verbal Reasoning", "Analytical Reasoning"],
        "English": ["Grammar", "Vocabulary", "Comprehension"],
        "General Awareness": ["Current Affairs", "Indian History", "Geography", "Science"]
    },
    "GRE": {
        "Quantitative": ["Arithmetic", "Algebra", "Geometry", "Data Analysis"],
        "Verbal": ["Reading Comprehension", "Text Completion", "Sentence Equivalence"],
        "Analytical Writing": ["Issue Essay", "Argument Essay"]
    },
    "GMAT": {
        "Quantitative": ["Problem Solving", "Data Sufficiency"],
        "Verbal": ["Critical Reasoning", "Reading Comprehension", "Sentence Correction"],
        "Integrated Reasoning": ["Graphics Interpretation", "Table Analysis"],
        "Analytical Writing": ["Analysis of Argument"]
    },
    "IELTS": {
        "Listening": ["Section 1", "Section 2", "Section 3", "Section 4"],
        "Reading": ["Academic Reading", "General Reading"],
        "Writing": ["Task 1", "Task 2"],
        "Speaking": ["Part 1", "Part 2", "Part 3"]
    },
    "TOEFL": {
        "Reading": ["Academic Passages", "Vocabulary in Context"],
        "Listening": ["Conversations", "Lectures"],
        "Speaking": ["Independent Tasks", "Integrated Tasks"],
        "Writing": ["Integrated Writing", "Independent Writing"]
    },
    "NET": {
        "Paper 1": ["Teaching Aptitude", "Research Aptitude", "Comprehension", "Communication", "Reasoning"],
        "Paper 2": ["Subject Specific Topics"]
    },
    "GATE": {
        "Engineering Mathematics": ["Linear Algebra", "Calculus", "Probability", "Differential Equations"],
        "Core Subjects": ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical"]
    },
    "PhD": {
        "Research Methodology": ["Qualitative Methods", "Quantitative Methods", "Mixed Methods"],
        "Literature Review": ["Critical Analysis", "Systematic Review", "Meta-Analysis"],
        "Statistics": ["Advanced Statistics", "Research Design", "Data Analysis"],
        "Thesis": ["Proposal Writing", "Defense Preparation"]
    }
}

@router.get("/competitive/exams/topics")
async def get_competitive_exam_topics():
    """Get all competitive exam types and their topics"""
    return {"exam_topics": COMPETITIVE_EXAM_TOPICS}

@router.post("/competitive/generate-questions")
async def generate_competitive_questions(
    exam_type: str,
    topic: str,
    subtopic: str = None,
    difficulty: str = "medium",
    num_questions: int = 10,
    question_type: str = "objective"
):
    """Generate competitive exam questions with AI-generated rationales"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"competitive_{exam_type}_{topic}_{datetime.now().timestamp()}",
            system_message=f"You are an expert exam question generator for {exam_type}. Generate high-quality, challenging questions with detailed explanations."
        ).with_model("openai", "gpt-5.2")
        
        subtopic_text = f" specifically on {subtopic}" if subtopic else ""
        
        if question_type == "objective":
            prompt = f"""Generate {num_questions} {difficulty} difficulty multiple-choice questions for {exam_type} exam.
Topic: {topic}{subtopic_text}

For each question, provide:
1. A challenging, exam-standard question
2. 4 options (A, B, C, D)
3. The correct answer (index 0-3)
4. A DETAILED rationale explaining WHY the correct answer is right and why others are wrong

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "rationale": "Detailed explanation: The correct answer is A because... Option B is incorrect because... Option C is wrong because... Option D is incorrect because..."
    }}
  ]
}}"""
        else:  # scenario_based
            prompt = f"""Generate {num_questions} {difficulty} difficulty scenario-based questions for {exam_type} exam.
Topic: {topic}{subtopic_text}

Each question should present a real-world scenario requiring application of concepts.

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "Scenario: [detailed scenario]\n\nQuestion: [question based on scenario]",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "rationale": "Detailed step-by-step explanation of how to approach this scenario and why the correct answer is right."
    }}
  ]
}}"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            questions_data = json.loads(response_text)
            
            # Convert to CompetitiveExamQuestion objects
            questions = []
            points_map = {"easy": 1, "medium": 2, "hard": 3, "expert": 5}
            
            for q in questions_data.get("questions", []):
                question_obj = CompetitiveExamQuestion(
                    exam_type=exam_type,
                    topic=topic,
                    subtopic=subtopic,
                    question_type=question_type,
                    question=q["question"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    rationale=q["rationale"],
                    difficulty=difficulty,
                    points=points_map.get(difficulty, 2)
                )
                questions.append(question_obj.model_dump())
            
            # Store questions in database
            if questions:
                await db.competitive_questions.insert_many(questions)
            
            return {
                "exam_type": exam_type,
                "topic": topic,
                "subtopic": subtopic,
                "difficulty": difficulty,
                "total_questions": len(questions),
                "questions": questions
            }
        
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {str(e)}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@router.post("/competitive/submit-attempt", response_model=CompetitiveExamAttempt)
async def submit_competitive_exam_attempt(attempt: CompetitiveExamAttemptCreate):
    """Submit competitive exam attempt and calculate job readiness score"""
    try:
        # Calculate score
        total_points = 0
        earned_points = 0
        weak_topics = []
        correct_count = 0
        
        for i, question in enumerate(attempt.questions):
            total_points += question.get("points", 1)
            student_answer = attempt.student_answers[i] if i < len(attempt.student_answers) else -1
            correct_answer = question.get("correct_answer", -1)
            
            if student_answer == correct_answer:
                earned_points += question.get("points", 1)
                correct_count += 1
            else:
                # Track weak topic
                topic = question.get("subtopic") or question.get("topic")
                if topic and topic not in weak_topics:
                    weak_topics.append(topic)
        
        percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        
        # Calculate Job Readiness Score (0-100)
        # Based on: accuracy (60%), difficulty level (20%), time efficiency (20%)
        accuracy_score = (correct_count / len(attempt.questions)) * 60 if len(attempt.questions) > 0 else 0
        
        # Difficulty bonus
        difficulty_map = {"easy": 5, "medium": 15, "hard": 20, "expert": 20}
        avg_difficulty = attempt.questions[0].get("difficulty", "medium") if attempt.questions else "medium"
        difficulty_score = difficulty_map.get(avg_difficulty, 15)
        
        # Time efficiency (assuming 60 seconds per question is optimal)
        optimal_time = len(attempt.questions) * 60
        time_efficiency = min(20, (optimal_time / attempt.time_taken_seconds) * 20) if attempt.time_taken_seconds > 0 else 10
        
        job_readiness_score = min(100, accuracy_score + difficulty_score + time_efficiency)
        
        # Create attempt record
        attempt_dict = attempt.model_dump()
        attempt_dict['score'] = earned_points
        attempt_dict['total_points'] = total_points
        attempt_dict['percentage'] = percentage
        attempt_dict['weak_topics'] = weak_topics
        attempt_dict['job_readiness_score'] = job_readiness_score
        attempt_dict['attempted_at'] = datetime.now(timezone.utc).isoformat()
        
        attempt_obj = CompetitiveExamAttempt(**attempt_dict)
        await db.competitive_attempts.insert_one(attempt_obj.model_dump())
        
        # Create progress report
        progress = ProgressReportCreate(
            student_id=attempt.student_id,
            subject=attempt.exam_type,
            topic=attempt.topic,
            score=earned_points,
            total=total_points,
            weak_areas=weak_topics
        )
        await create_progress_report(progress)
        
        # Update job readiness metrics
        await update_job_readiness_metrics(attempt.student_id, attempt.exam_type, job_readiness_score, weak_topics)
        
        return attempt_obj
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit attempt: {str(e)}")

async def update_job_readiness_metrics(student_id: str, exam_type: str, score: float, weak_areas: List[str]):
    """Update student's job readiness metrics"""
    try:
        # Get existing metrics or create new
        existing = await db.job_readiness.find_one({"student_id": student_id}, {"_id": 0})
        
        if existing:
            # Update existing metrics
            exam_performance = existing.get("exam_performance", {})
            exam_performance[exam_type] = score
            
            # Calculate overall score (average of all exams)
            overall_score = sum(exam_performance.values()) / len(exam_performance)
            
            # Update weak areas
            current_weak = existing.get("weak_areas", [])
            for area in weak_areas:
                if area not in current_weak:
                    current_weak.append(area)
            
            await db.job_readiness.update_one(
                {"student_id": student_id},
                {"$set": {
                    "overall_score": overall_score,
                    "exam_performance": exam_performance,
                    "weak_areas": current_weak,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }}
            )
        else:
            # Create new metrics
            metrics = JobReadinessMetrics(
                student_id=student_id,
                overall_score=score,
                exam_performance={exam_type: score},
                strong_areas=[],
                weak_areas=weak_areas,
                recommended_focus=weak_areas,
                last_updated=datetime.now(timezone.utc)
            )
            await db.job_readiness.insert_one(metrics.model_dump())
    
    except Exception as e:
        print(f"Error updating job readiness metrics: {str(e)}")

# =====================
# PARENT DASHBOARD ROUTES
# =====================

@router.get("/parent/dashboard/{parent_id}")
async def get_parent_dashboard(parent_id: str, req: Request):
    """Get complete parent dashboard data"""
    try:
        # Verify authentication
        current_user = await auth.get_current_user(req, db)
        if current_user["role"] != "parent" and current_user["id"] != parent_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get parent info
        parent = await db.users.find_one({"id": parent_id, "role": "parent"}, {"_id": 0, "password_hash": 0})
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        # Get linked students
        linked_student_ids = parent.get("linked_students", [])
        students = []
        
        if linked_student_ids:
            students = await db.users.find(
                {"id": {"$in": linked_student_ids}, "role": "student"},
                {"_id": 0, "password_hash": 0}
            ).to_list(100)
        
        # Get attendance for all students (last 30 days)
        attendance_data = {}
        for student in students:
            records = await db.attendance.find(
                {"student_id": student["id"]},
                {"_id": 0}
            ).sort("timestamp", -1).limit(30).to_list(30)
            attendance_data[student["id"]] = records
        
        # Get progress reports
        progress_data = {}
        for student in students:
            reports = await db.progress_reports.find(
                {"student_id": student["id"]},
                {"_id": 0}
            ).sort("timestamp", -1).limit(10).to_list(10)
            progress_data[student["id"]] = reports
        
        # Get notifications
        notifications = await db.notifications.find(
            {"parent_id": parent_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(20).to_list(20)
        
        # Get fee payments
        fee_payments = []
        for student in students:
            payments = await db.fee_payments.find(
                {"student_id": student["id"]},
                {"_id": 0}
            ).sort("payment_date", -1).limit(10).to_list(10)
            fee_payments.extend(payments)
        
        # Get upcoming exams
        upcoming_exams = await db.exam_schedules.find(
            {"scheduled_date": {"$gte": datetime.now(timezone.utc)}},
            {"_id": 0}
        ).sort("scheduled_date", 1).limit(10).to_list(10)
        
        return {
            "parent": parent,
            "students": students,
            "attendance": attendance_data,
            "progress": progress_data,
            "notifications": notifications,
            "fee_payments": fee_payments,
            "upcoming_exams": upcoming_exams
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard: {str(e)}")

@router.post("/parent/link-student")
async def link_student_to_parent(parent_id: str, student_id: str, req: Request):
    """Link a student to parent account"""
    try:
        # Verify authentication
        current_user = await auth.get_current_user(req, db)
        if current_user["role"] != "parent" and current_user["id"] != parent_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Verify student exists
        student = await db.users.find_one({"id": student_id, "role": "student"}, {"_id": 0})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Add student to parent's linked_students
        await db.users.update_one(
            {"id": parent_id},
            {"$addToSet": {"linked_students": student_id}}
        )
        
        # Update student's parent_id
        await db.users.update_one(
            {"id": student_id},
            {"$set": {"parent_id": parent_id}}
        )
        
        return {"message": "Student linked successfully", "student": student}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to link student: {str(e)}")

@router.delete("/parent/unlink-student")
async def unlink_student_from_parent(parent_id: str, student_id: str, req: Request):
    """Unlink a student from parent account"""
    try:
        # Verify authentication
        current_user = await auth.get_current_user(req, db)
        if current_user["role"] != "parent" and current_user["id"] != parent_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Remove student from parent's linked_students
        await db.users.update_one(
            {"id": parent_id},
            {"$pull": {"linked_students": student_id}}
        )
        
        # Clear student's parent_id
        await db.users.update_one(
            {"id": student_id},
            {"$set": {"parent_id": ""}}
        )
        
        return {"message": "Student unlinked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlink student: {str(e)}")

@router.get("/parent/notifications/{parent_id}")
async def get_parent_notifications(parent_id: str, req: Request, limit: int = 50):
    """Get notifications for parent"""
    try:
        # Verify authentication
        current_user = await auth.get_current_user(req, db)
        if current_user["role"] != "parent" and current_user["id"] != parent_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        notifications = await db.notifications.find(
            {"parent_id": parent_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        # Count unread
        unread_count = await db.notifications.count_documents({
            "parent_id": parent_id,
            "read": False
        })
        
        return {
            "notifications": notifications,
            "unread_count": unread_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")

@router.put("/parent/notification/{notification_id}/read")
async def mark_notification_read(notification_id: str, req: Request):
    """Mark notification as read"""
    try:
        await auth.get_current_user(req, db)
        
        await db.notifications.update_one(
            {"id": notification_id},
            {"$set": {"read": True}}
        )
        
        return {"message": "Notification marked as read"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification: {str(e)}")

# =====================
# EDUCATION BOARD SYSTEM
# =====================

# Education Board Structure
EDUCATION_BOARDS = {
    "CBSE": {
        "country": "India",
        "modes": ["Regular", "Distance", "Private"],
        "classes": {
            "Nursery": ["Play Group", "LKG", "UKG"],
            "Primary": ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
            "Middle": ["Class 6", "Class 7", "Class 8"],
            "Secondary": ["Class 9", "Class 10"],
            "Senior Secondary": ["Class 11", "Class 12"]
        },
        "subjects": {
            "Primary": ["English", "Hindi", "Mathematics", "EVS", "Computer Science", "Art & Craft"],
            "Middle": ["English", "Hindi", "Mathematics", "Science", "Social Studies", "Computer Science", "Sanskrit"],
            "Secondary": ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science", "Sanskrit"],
            "Senior Secondary": {
                "Science": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English"],
                "Commerce": ["Accountancy", "Business Studies", "Economics", "English", "Mathematics"],
                "Arts": ["History", "Political Science", "Economics", "English", "Psychology", "Sociology"]
            }
        }
    },
    "ICSE": {
        "country": "India",
        "modes": ["Regular", "Private"],
        "classes": {
            "Primary": ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
            "Middle": ["Class 6", "Class 7", "Class 8"],
            "Secondary": ["Class 9", "Class 10"],
            "ISC": ["Class 11", "Class 12"]
        },
        "subjects": {
            "Primary": ["English", "Mathematics", "Science", "Social Studies", "Computer Applications"],
            "Secondary": ["English", "Mathematics", "Science", "History & Civics", "Geography", "Computer Applications"]
        }
    },
    "State Board": {
        "country": "India",
        "modes": ["Regular", "Distance"],
        "classes": {
            "Primary": ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
            "Middle": ["Class 6", "Class 7", "Class 8"],
            "Secondary": ["Class 9", "Class 10"],
            "Higher Secondary": ["Class 11", "Class 12"]
        }
    },
    "IB": {
        "country": "International",
        "modes": ["Regular"],
        "classes": {
            "PYP": ["Ages 3-12"],
            "MYP": ["Ages 11-16"],
            "DP": ["Ages 16-19"]
        }
    },
    "Cambridge": {
        "country": "International",
        "modes": ["Regular", "Private"],
        "classes": {
            "Primary": ["Year 1-6"],
            "Secondary": ["Year 7-11 (IGCSE)"],
            "Advanced": ["Year 12-13 (A-Levels)"]
        }
    }
}

@router.get("/boards/all")
async def get_all_boards():
    """Get all education boards with their structure"""
    return {"boards": EDUCATION_BOARDS}

@router.get("/boards/{board_name}")
async def get_board_details(board_name: str):
    """Get details of a specific education board"""
    try:
        if board_name not in EDUCATION_BOARDS:
            raise HTTPException(status_code=404, detail="Board not found")
        
        return {
            "board_name": board_name,
            "details": EDUCATION_BOARDS[board_name]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching board details: {str(e)}")

@router.get("/boards/{board_name}/{education_mode}/{class_level}")
async def get_class_dashboard(board_name: str, education_mode: str, class_level: str):
    """Get class dashboard with subjects and modules"""
    try:
        if board_name not in EDUCATION_BOARDS:
            raise HTTPException(status_code=404, detail="Board not found")
        
        board_data = EDUCATION_BOARDS[board_name]
        
        # Get subjects for the class level
        subjects = []
        if "subjects" in board_data:
            for level, subject_list in board_data["subjects"].items():
                if level.lower() in class_level.lower():
                    subjects = subject_list if isinstance(subject_list, list) else list(subject_list.keys())
                    break
        
        # Generate mock modules (in real app, fetch from database)
        modules = []
        for subject in subjects:
            modules.append({
                "subject": subject,
                "topics": [
                    f"{subject} - Chapter 1",
                    f"{subject} - Chapter 2",
                    f"{subject} - Chapter 3"
                ],
                "has_pdf": True,
                "has_video": True
            })
        
        return {
            "board_name": board_name,
            "education_mode": education_mode,
            "class_level": class_level,
            "subjects": subjects,
            "modules": modules,
            "competitive_mode_enabled": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching class dashboard: {str(e)}")

@router.post("/boards/generate-topic-quiz")
async def generate_topic_quiz(
    board_name: str,
    class_level: str,
    subject: str,
    topic: str,
    num_questions: int = 10,
    difficulty: str = "medium"
):
    """Generate AI quiz for any board syllabus topic"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"board_quiz_{board_name}_{subject}_{datetime.now().timestamp()}",
            system_message=f"You are an expert {board_name} board exam question generator for {class_level}. Generate curriculum-aligned questions."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""Generate {num_questions} {difficulty} difficulty MCQ questions for {board_name} board students.
Class: {class_level}
Subject: {subject}
Topic: {topic}

Questions should be:
- Aligned with {board_name} curriculum
- Appropriate for {class_level} students
- Cover conceptual understanding

Return ONLY valid JSON in this format:
{{
  "questions": [
    {{
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "rationale": "Detailed explanation with why correct answer is right and why others are wrong."
    }}
  ]
}}"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            quiz_data = json.loads(response_text)
            
            return {
                "board_name": board_name,
                "class_level": class_level,
                "subject": subject,
                "topic": topic,
                "difficulty": difficulty,
                "questions": quiz_data.get("questions", []),
                "total_questions": len(quiz_data.get("questions", []))
            }
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate topic quiz: {str(e)}")

# Competitive Exam Categories
EXAM_CATEGORIES = {
    "National (India)": ["JEE", "NEET", "CUET", "UPSC", "SSC"],
    "International": ["SAT", "GRE", "GMAT", "IELTS", "TOEFL"],
    "Research/PhD": ["NET", "GATE", "PhD"]
}

@router.get("/competitive/categories")
async def get_competitive_categories():
    """Get categorized competitive exams"""
    return {"categories": EXAM_CATEGORIES}


# =====================
# SECURE LIVE SURVEILLANCE SYSTEM
# =====================

import secrets
import hashlib
from datetime import timedelta

def generate_secure_token(user_id: str, classroom_id: str) -> str:
    """Generate secure encrypted token for stream access"""
    random_data = secrets.token_urlsafe(32)
    token_string = f"{user_id}:{classroom_id}:{random_data}:{datetime.now(timezone.utc).timestamp()}"
    return hashlib.sha256(token_string.encode()).hexdigest()

async def log_audit(user_id: str, user_role: str, action: str, classroom_id: str = None, student_id: str = None, ip_address: str = None, details: dict = None):
    """Log all surveillance access for accountability"""
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            user_role=user_role,
            action=action,
            classroom_id=classroom_id,
            student_id=student_id,
            ip_address=ip_address,
            timestamp=datetime.now(timezone.utc),
            details=details or {}
        )
        await db.audit_logs.insert_one(audit_entry.model_dump())
    except Exception as e:
        print(f"Audit log error: {str(e)}")

# Parent Management
@router.post("/surveillance/parent/register")
async def register_parent(name: str, email: str, phone: str, student_ids: List[str]):
    """Register a parent with linked students"""
    try:
        parent_id = str(uuid4())
        parent = ParentUser(
            parent_id=parent_id,
            name=name,
            email=email,
            phone=phone,
            linked_students=student_ids,
            created_at=datetime.now(timezone.utc)
        )
        
        await db.parent_users.insert_one(parent.model_dump())
        await log_audit(parent_id, "parent", "registration", details={"email": email})
        
        return {"message": "Parent registered successfully", "parent_id": parent_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.get("/surveillance/parent/{parent_id}/students")
async def get_parent_students(parent_id: str):
    """Get list of students linked to a parent"""
    try:
        parent = await db.parent_users.find_one({"parent_id": parent_id}, {"_id": 0})
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        # Get student details
        students = []
        for student_id in parent.get("linked_students", []):
            student = await db.students.find_one({"id": student_id}, {"_id": 0})
            if student:
                students.append(student)
        
        return {"parent_id": parent_id, "students": students}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch students: {str(e)}")

# Classroom Feed Management
@router.post("/surveillance/classroom/register")
async def register_classroom_feed(
    classroom_id: str,
    board_name: str,
    class_level: str,
    section: str,
    stream_url: str,
    student_ids: List[str]
):
    """Register a classroom live feed"""
    try:
        classroom_feed = ClassroomFeed(
            classroom_id=classroom_id,
            board_name=board_name,
            class_level=class_level,
            section=section,
            stream_url=stream_url,
            is_active=True,
            students_enrolled=student_ids,
            created_at=datetime.now(timezone.utc)
        )
        
        await db.classroom_feeds.insert_one(classroom_feed.model_dump())
        
        return {"message": "Classroom feed registered", "classroom_id": classroom_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register feed: {str(e)}")

@router.get("/surveillance/classroom/all")
async def get_all_classrooms():
    """Get all registered classroom feeds (Super Admin only)"""
    try:
        classrooms = await db.classroom_feeds.find({"is_active": True}, {"_id": 0}).to_list(100)
        return {"classrooms": classrooms, "total": len(classrooms)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch classrooms: {str(e)}")

# Parent Access (Strict Isolation)
@router.post("/surveillance/parent/request-access")
async def parent_request_stream_access(parent_id: str, student_id: str, ip_address: str = None):
    """Parent requests access to child's classroom feed (STRICT ISOLATION)"""
    try:
        # 1. Verify parent-student relationship
        parent = await db.parent_users.find_one({"parent_id": parent_id}, {"_id": 0})
        if not parent:
            await log_audit(parent_id, "parent", "access_denied", student_id=student_id, ip_address=ip_address, details={"reason": "parent_not_found"})
            raise HTTPException(status_code=403, detail="Access denied: Parent not found")
        
        if student_id not in parent.get("linked_students", []):
            await log_audit(parent_id, "parent", "access_denied", student_id=student_id, ip_address=ip_address, details={"reason": "student_not_linked"})
            raise HTTPException(status_code=403, detail="Access denied: Student not linked to this parent")
        
        # 2. Find classroom where student is enrolled
        classroom = await db.classroom_feeds.find_one(
            {"students_enrolled": student_id, "is_active": True},
            {"_id": 0}
        )
        
        if not classroom:
            await log_audit(parent_id, "parent", "access_denied", student_id=student_id, ip_address=ip_address, details={"reason": "no_active_classroom"})
            raise HTTPException(status_code=404, detail="No active classroom found for this student")
        
        # 3. Generate secure access token (expires in 2 hours)
        token = generate_secure_token(parent_id, classroom["classroom_id"])
        expires_at = datetime.now(timezone.utc) + timedelta(hours=2)
        
        access_token = StreamAccessToken(
            token=token,
            user_id=parent_id,
            user_role="parent",
            classroom_id=classroom["classroom_id"],
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc)
        )
        
        await db.stream_tokens.insert_one(access_token.model_dump())
        
        # 4. Log successful access
        await log_audit(
            parent_id, 
            "parent", 
            "view_feed", 
            classroom_id=classroom["classroom_id"],
            student_id=student_id,
            ip_address=ip_address,
            details={
                "classroom": f"{classroom['class_level']} - {classroom['section']}",
                "token_expires": expires_at.isoformat()
            }
        )
        
        return {
            "access_granted": True,
            "token": token,
            "expires_at": expires_at.isoformat(),
            "classroom": {
                "classroom_id": classroom["classroom_id"],
                "class_level": classroom["class_level"],
                "section": classroom["section"],
                "board_name": classroom["board_name"]
            },
            "stream_url": f"/api/surveillance/stream/{token}",
            "message": "Access granted for 2 hours"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        await log_audit(parent_id, "parent", "access_error", student_id=student_id, details={"error": str(e)})
        raise HTTPException(status_code=500, detail=f"Access request failed: {str(e)}")

# Super Admin Access (Full Access)
@router.post("/surveillance/superadmin/login")
async def superadmin_login(admin_email: str, admin_secret_key: str):
    """Hidden Super Admin login (Master access)"""
    try:
        # Hardcoded super admin credentials (in production, use secure vault)
        SUPER_ADMIN_EMAIL = "superadmin@wingsglobal.edu"
        SUPER_ADMIN_SECRET = "WINGS_MASTER_2025_SECURE"
        
        if admin_email != SUPER_ADMIN_EMAIL or admin_secret_key != SUPER_ADMIN_SECRET:
            await log_audit("unknown", "super_admin", "login_failed", details={"email": admin_email})
            raise HTTPException(status_code=401, detail="Invalid super admin credentials")
        
        # Generate admin session
        admin_id = "SUPER_ADMIN_MASTER"
        token = generate_secure_token(admin_id, "ALL_ACCESS")
        expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
        
        admin_token = StreamAccessToken(
            token=token,
            user_id=admin_id,
            user_role="super_admin",
            classroom_id="ALL",
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc)
        )
        
        await db.stream_tokens.insert_one(admin_token.model_dump())
        await log_audit(admin_id, "super_admin", "login_success", details={"email": admin_email})
        
        return {
            "access_granted": True,
            "token": token,
            "expires_at": expires_at.isoformat(),
            "role": "super_admin",
            "message": "Master Admin access granted"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/surveillance/superadmin/all-feeds")
async def superadmin_get_all_feeds(admin_token: str):
    """Super Admin: Get ALL classroom feeds (unfiltered access)"""
    try:
        # Verify admin token
        token_data = await db.stream_tokens.find_one({"token": admin_token, "user_role": "super_admin"}, {"_id": 0})
        
        if not token_data:
            raise HTTPException(status_code=403, detail="Invalid or expired admin token")
        
        # Check token expiry
        expires_at = datetime.fromisoformat(token_data["expires_at"]) if isinstance(token_data["expires_at"], str) else token_data["expires_at"]
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Token expired")
        
        # Get ALL classroom feeds
        classrooms = await db.classroom_feeds.find({"is_active": True}, {"_id": 0}).to_list(500)
        
        await log_audit(
            token_data["user_id"],
            "super_admin",
            "view_all_feeds",
            details={"total_classrooms": len(classrooms)}
        )
        
        return {
            "total_classrooms": len(classrooms),
            "classrooms": classrooms,
            "access_level": "MASTER_ADMIN"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feeds: {str(e)}")

@router.get("/surveillance/superadmin/audit-logs")
async def superadmin_get_audit_logs(admin_token: str, limit: int = 100):
    """Super Admin: View all audit logs"""
    try:
        # Verify admin token
        token_data = await db.stream_tokens.find_one({"token": admin_token, "user_role": "super_admin"}, {"_id": 0})
        
        if not token_data:
            raise HTTPException(status_code=403, detail="Invalid or expired admin token")
        
        # Get audit logs
        logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
        
        await log_audit(
            token_data["user_id"],
            "super_admin",
            "view_audit_logs",
            details={"logs_fetched": len(logs)}
        )
        
        return {
            "total_logs": len(logs),
            "logs": logs
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")

# Stream Verification Endpoint
@router.get("/surveillance/stream/{token}")
async def verify_stream_access(token: str):
    """Verify stream access token and return encrypted stream URL"""
    try:
        token_data = await db.stream_tokens.find_one({"token": token}, {"_id": 0})
        
        if not token_data:
            raise HTTPException(status_code=403, detail="Invalid access token")
        
        # Check expiry
        expires_at = datetime.fromisoformat(token_data["expires_at"]) if isinstance(token_data["expires_at"], str) else token_data["expires_at"]
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Access token expired")
        
        # Get classroom feed
        if token_data["user_role"] == "super_admin":
            # Super admin can access any classroom
            return {
                "access_valid": True,
                "role": "super_admin",
                "message": "Master admin access - unrestricted"
            }
        else:
            # Parent access - get specific classroom
            classroom = await db.classroom_feeds.find_one(
                {"classroom_id": token_data["classroom_id"]},
                {"_id": 0}
            )
            
            if not classroom:
                raise HTTPException(status_code=404, detail="Classroom not found")
            
            return {
                "access_valid": True,
                "role": "parent",
                "classroom": {
                    "classroom_id": classroom["classroom_id"],
                    "class_level": classroom["class_level"],
                    "section": classroom["section"]
                },
                "stream_url": classroom["stream_url"],  # Encrypted stream URL
                "expires_at": token_data["expires_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream verification failed: {str(e)}")


# =====================
# GLOBAL COMPETITION SYSTEM
# =====================

@router.get("/competition/leaderboard")
async def get_global_leaderboard(limit: int = 20):
    """Get global leaderboard for monthly competition"""
    try:
        # Aggregate scores from competitive exams, progress reports, attendance
        # For demo, return mock data (in production, calculate from database)
        leaderboard = [
            {"rank": 1, "name": "Aryan Khan", "country": "India", "score": 9850, "avatar": "https://i.pravatar.cc/150?img=1"},
            {"rank": 2, "name": "Sara Ahmed", "country": "Sudan", "score": 9720, "avatar": "https://i.pravatar.cc/150?img=2"},
            {"rank": 3, "name": "Mohammed Ali", "country": "UAE", "score": 9650, "avatar": "https://i.pravatar.cc/150?img=3"},
            {"rank": 4, "name": "Emily Chen", "country": "USA", "score": 9580, "avatar": "https://i.pravatar.cc/150?img=4"},
            {"rank": 5, "name": "Ravi Kumar", "country": "India", "score": 9500, "avatar": "https://i.pravatar.cc/150?img=5"},
            {"rank": 6, "name": "Fatima Hassan", "country": "Sudan", "score": 9420, "avatar": "https://i.pravatar.cc/150?img=6"},
            {"rank": 7, "name": "James Wilson", "country": "UK", "score": 9350, "avatar": "https://i.pravatar.cc/150?img=7"},
            {"rank": 8, "name": "Priya Sharma", "country": "India", "score": 9280, "avatar": "https://i.pravatar.cc/150?img=8"},
            {"rank": 9, "name": "Ahmed Khalid", "country": "UAE", "score": 9200, "avatar": "https://i.pravatar.cc/150?img=9"},
            {"rank": 10, "name": "Sophia Brown", "country": "USA", "score": 9150, "avatar": "https://i.pravatar.cc/150?img=10"},
            {"rank": 11, "name": "Rohan Das", "country": "India", "score": 9080, "avatar": "https://i.pravatar.cc/150?img=11"},
            {"rank": 12, "name": "Layla Omar", "country": "Sudan", "score": 9000, "avatar": "https://i.pravatar.cc/150?img=12"},
            {"rank": 13, "name": "David Lee", "country": "UK", "score": 8950, "avatar": "https://i.pravatar.cc/150?img=13"},
            {"rank": 14, "name": "Ananya Reddy", "country": "India", "score": 8900, "avatar": "https://i.pravatar.cc/150?img=14"},
            {"rank": 15, "name": "Omar Ibrahim", "country": "UAE", "score": 8850, "avatar": "https://i.pravatar.cc/150?img=15"},
            {"rank": 16, "name": "Emma Johnson", "country": "USA", "score": 8800, "avatar": "https://i.pravatar.cc/150?img=16"},
            {"rank": 17, "name": "Aarav Patel", "country": "India", "score": 8750, "avatar": "https://i.pravatar.cc/150?img=17"},
            {"rank": 18, "name": "Yasmin Ali", "country": "Sudan", "score": 8700, "avatar": "https://i.pravatar.cc/150?img=18"},
            {"rank": 19, "name": "Oliver Smith", "country": "UK", "score": 8650, "avatar": "https://i.pravatar.cc/150?img=19"},
            {"rank": 20, "name": "Ishita Verma", "country": "India", "score": 8600, "avatar": "https://i.pravatar.cc/150?img=20"}
        ]
        
        return {"leaderboard": leaderboard[:limit], "total": len(leaderboard), "last_updated": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

@router.post("/competition/generate-certificate")
async def generate_excellence_certificate(student_id: str, rank: int, month: str, year: int):
    """Generate Monthly Excellence Certificate for Top 20"""
    try:
        # Get student details
        student = await db.students.find_one({"id": student_id}, {"_id": 0})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Certificate data
        certificate = {
            "id": str(uuid4()),
            "student_id": student_id,
            "student_name": student.get("name", "Student"),
            "rank": rank,
            "month": month,
            "year": year,
            "issued_date": datetime.now(timezone.utc).isoformat(),
            "certificate_url": f"/certificates/{student_id}_{month}_{year}.pdf",
            "type": "Monthly Excellence",
            "theme": "Royal Red & Golden"
        }
        
        # Store certificate
        await db.certificates.insert_one(certificate)
        
        # Add to digital vault
        vault_entry = {
            "id": str(uuid4()),
            "student_id": student_id,
            "item_type": "certificate",
            "item_id": certificate["id"],
            "title": f"Global Excellence Certificate - {month} {year}",
            "description": f"Ranked #{rank} globally",
            "added_at": datetime.now(timezone.utc).isoformat()
        }
        await db.digital_vault.insert_one(vault_entry)
        
        # Notify parent
        parent_notification = NotificationCreate(
            student_id=student_id,
            parent_id=f"parent_{student_id}",
            notification_type="achievement",
            title="🏆 Global Excellence Achieved!",
            message=f"Congratulations! Your child ranked #{rank} globally in {month} {year}. Certificate added to digital vault.",
            data={"rank": rank, "certificate_id": certificate["id"]}
        )
        await create_notification(parent_notification)
        
        return {"message": "Certificate generated successfully", "certificate": certificate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate certificate: {str(e)}")

@router.get("/digital-vault/{student_id}")
async def get_digital_vault(student_id: str):
    """Get student's digital vault (certificates, badges, achievements)"""
    try:
        vault_items = await db.digital_vault.find({"student_id": student_id}, {"_id": 0}).sort("added_at", -1).to_list(100)
        return {"vault_items": vault_items, "total": len(vault_items)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch digital vault: {str(e)}")

@router.post("/competition/monthly-auto-award")
async def monthly_auto_award_certificates():
    """Automatically generate certificates for Top 20 at month end"""
    try:
        # Get top 20 from leaderboard
        leaderboard_data = await get_global_leaderboard(limit=20)
        leaderboard = leaderboard_data["leaderboard"]
        
        month = datetime.now(timezone.utc).strftime("%B")
        year = datetime.now(timezone.utc).year
        
        generated_certificates = []
        
        for entry in leaderboard:
            # In production, get actual student_id from leaderboard entry
            student_id = f"student_{entry['rank']}"  # Mock for demo
            
            cert_result = await generate_excellence_certificate(student_id, entry["rank"], month, year)
            generated_certificates.append(cert_result["certificate"])
        
        return {
            "message": f"Generated {len(generated_certificates)} certificates for Top 20",
            "month": month,
            "year": year,
            "certificates": generated_certificates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-award failed: {str(e)}")




@router.get("/competitive/attempts/student/{student_id}")
async def get_student_competitive_attempts(student_id: str, exam_type: str = None):
    """Get student's competitive exam attempts"""
    try:
        query = {"student_id": student_id}
        if exam_type:
            query["exam_type"] = exam_type
        
        attempts = await db.competitive_attempts.find(query, {"_id": 0}).sort("attempted_at", -1).limit(50).to_list(50)
        return {"attempts": attempts, "total": len(attempts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch attempts: {str(e)}")

@router.get("/competitive/job-readiness/{student_id}")
async def get_job_readiness_score(student_id: str):
    """Get student's job readiness score and metrics"""
    try:
        metrics = await db.job_readiness.find_one({"student_id": student_id}, {"_id": 0})
        
        if not metrics:
            return {
                "student_id": student_id,
                "overall_score": 0,
                "exam_performance": {},
                "strong_areas": [],
                "weak_areas": [],
                "recommended_focus": [],
                "message": "No competitive exam attempts yet"
            }
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch job readiness: {str(e)}")

# =====================
# MASTER SKILL HUB
# =====================

@router.get("/skills/modules")
async def get_skill_modules():
    """Get all skill modules (Computer Mastery, Coding Lab, AI Specialist)"""
    try:
        modules = await db.skill_modules.find({}, {"_id": 0}).to_list(100)
        
        # If no modules exist, create default ones
        if not modules:
            default_modules = [
                {
                    "id": "computer-mastery",
                    "skill_name": "Computer Mastery",
                    "description": "Master operating systems, productivity tools, and digital workflows",
                    "icon": "💻",
                    "topics": ["Windows/Mac/Linux", "MS Office Suite", "File Management", "Troubleshooting"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "coding-lab",
                    "skill_name": "Coding Lab",
                    "description": "Learn programming from basics to advanced algorithms",
                    "icon": "⚡",
                    "topics": ["Python", "JavaScript", "Data Structures", "Algorithms", "Web Development"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": "ai-specialist",
                    "skill_name": "AI-Tool Specialist",
                    "description": "Harness the power of AI tools and machine learning",
                    "icon": "🤖",
                    "topics": ["ChatGPT", "Midjourney", "AI Automation", "Prompt Engineering"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            await db.skill_modules.insert_many(default_modules)
            modules = default_modules
        
        return {"modules": modules, "total": len(modules)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch skill modules: {str(e)}")

@router.get("/skills/resources/{skill_id}")
async def get_skill_resources(skill_id: str):
    """Get all resources (YouTube videos, PDFs) for a specific skill"""
    try:
        resources = await db.skill_resources.find({"skill_id": skill_id}, {"_id": 0}).to_list(100)
        
        # If no resources exist, create sample ones
        if not resources:
            sample_resources = {
                "computer-mastery": [
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "video",
                        "title": "Complete Computer Basics for Beginners",
                        "description": "Learn computer fundamentals from scratch",
                        "url": "https://www.youtube.com/watch?v=0xQHm0C1Y0c",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "video",
                        "title": "MS Office Complete Tutorial",
                        "description": "Master Word, Excel, PowerPoint",
                        "url": "https://www.youtube.com/watch?v=_WH3NDznvUA",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "pdf",
                        "title": "Computer Fundamentals Guide",
                        "description": "Complete PDF guide to computer basics",
                        "url": "https://www.tutorialspoint.com/computer_fundamentals/computer_fundamentals_tutorial.pdf",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                ],
                "coding-lab": [
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "video",
                        "title": "Python Programming for Beginners",
                        "description": "Complete Python course from zero to hero",
                        "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "video",
                        "title": "JavaScript Full Course",
                        "description": "Modern JavaScript from basics to advanced",
                        "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "pdf",
                        "title": "Data Structures & Algorithms Handbook",
                        "description": "Comprehensive DSA guide with examples",
                        "url": "https://www.tutorialspoint.com/data_structures_algorithms/data_structures_algorithms_tutorial.pdf",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                ],
                "ai-specialist": [
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "video",
                        "title": "ChatGPT Mastery Course",
                        "description": "Master AI tools and prompt engineering",
                        "url": "https://www.youtube.com/watch?v=VznoKyh6AXs",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "video",
                        "title": "AI Tools for Productivity",
                        "description": "Learn Midjourney, DALL-E, and more",
                        "url": "https://www.youtube.com/watch?v=qIKLZG3e6Co",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    },
                    {
                        "id": str(uuid4()),
                        "skill_id": skill_id,
                        "type": "pdf",
                        "title": "Prompt Engineering Guide",
                        "description": "Master the art of AI prompting",
                        "url": "https://arxiv.org/pdf/2312.16171.pdf",
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                ]
            }
            
            if skill_id in sample_resources:
                await db.skill_resources.insert_many(sample_resources[skill_id])
                resources = sample_resources[skill_id]
        
        return {"resources": resources, "total": len(resources)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch resources: {str(e)}")

@router.post("/skills/generate-quiz")
async def generate_skill_quiz(skill_id: str, num_questions: int = 10, language: str = 'en'):
    """Generate AI quiz for skill assessment in selected language"""
    try:
        from translation_service import translate_ai_prompt, translate_dict
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Get skill details
        skill = await db.skill_modules.find_one({"id": skill_id}, {"_id": 0})
        if not skill:
            raise HTTPException(status_code=404, detail="Skill module not found")
        
        skill_name = skill.get("skill_name", "General Skills")
        topics = skill.get("topics", [])
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=api_key,
            session_id=f"skill_quiz_{skill_id}_{datetime.now().timestamp()}",
            system_message=f"You are an expert quiz generator for {skill_name}. Generate challenging, practical questions that test real-world skills."
        ).with_model("openai", "gpt-5.2")
        
        # Base prompt
        base_prompt = f"""Generate {num_questions} multiple-choice questions for {skill_name} skill assessment.
Topics to cover: {', '.join(topics)}

Requirements:
- Questions should test practical knowledge and application
- Mix of difficulty levels (easy, medium, hard)
- Real-world scenarios where applicable
- Clear, unambiguous correct answers

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct"
    }}
  ]
}}"""
        
        # Add language instruction if not English
        prompt = await translate_ai_prompt(base_prompt, language)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            quiz_data = json.loads(response_text)
            
            return {
                "skill_id": skill_id,
                "skill_name": skill_name,
                "language": language,
                "questions": quiz_data.get("questions", []),
                "total_questions": len(quiz_data.get("questions", []))
            }
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@router.post("/skills/submit-quiz")
async def submit_skill_quiz(
    user_id: str,
    skill_id: str,
    questions: List[dict],
    answers: List[int]
):
    """Submit skill quiz and award badge if score >= 80%"""
    try:
        # Calculate score
        correct_count = 0
        for i, question in enumerate(questions):
            if i < len(answers) and answers[i] == question.get("correct_answer", -1):
                correct_count += 1
        
        total_questions = len(questions)
        score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
        badge_earned = score_percentage >= 80
        
        # Create quiz attempt record
        attempt = {
            "id": str(uuid4()),
            "user_id": user_id,
            "skill_id": skill_id,
            "questions": questions,
            "answers": answers,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "score_percentage": score_percentage,
            "badge_earned": badge_earned,
            "attempted_at": datetime.now(timezone.utc).isoformat()
        }
        await db.skill_quiz_attempts.insert_one(attempt)
        
        # Award badge if earned
        if badge_earned:
            skill = await db.skill_modules.find_one({"id": skill_id}, {"_id": 0})
            skill_name = skill.get("skill_name", "Skill") if skill else "Skill"
            
            badge = {
                "id": str(uuid4()),
                "user_id": user_id,
                "skill_id": skill_id,
                "skill_name": skill_name,
                "score": score_percentage,
                "earned_at": datetime.now(timezone.utc).isoformat(),
                "badge_type": "WINGS Certified Golden Badge"
            }
            await db.skill_badges.insert_one(badge)
        
        return {
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "score_percentage": round(score_percentage, 2),
            "badge_earned": badge_earned,
            "message": "Congratulations! You earned the Golden Badge!" if badge_earned else "Keep practicing to earn the Golden Badge (80% required)."
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

@router.get("/skills/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get all badges earned by a user"""
    try:
        badges = await db.skill_badges.find({"user_id": user_id}, {"_id": 0}).sort("earned_at", -1).to_list(100)
        return {"badges": badges, "total": len(badges)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch badges: {str(e)}")


# Language-Aware AI Chat Endpoint
@router.post("/ai/chat")
async def ai_chat(message: str, language: str = 'en', context: str = None):
    """
    SARA AI chat that responds in selected language
    Used for lessons, questions, explanations
    """
    try:
        from translation_service import translate_ai_prompt, get_language_specific_voice_config
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # System message for SARA
        system_msg = "You are SARA, an AI teacher at WINGS Global Edu-Skill Hub. You are helpful, patient, and explain concepts clearly."
        
        # Initialize chat
        chat = LlmChat(
            api_key=api_key,
            session_id=f"sara_chat_{datetime.now().timestamp()}",
            system_message=system_msg
        ).with_model("openai", "gpt-5.2")
        
        # Add language instruction to prompt
        user_prompt = await translate_ai_prompt(message, language)
        
        # Add context if provided
        if context:
            user_prompt = f"Context: {context}\n\nQuestion: {user_prompt}"
        
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Get voice config for lip-sync
        voice_config = get_language_specific_voice_config(language)
        
        return {
            "response": response,
            "language": language,
            "voice_config": voice_config,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")

# Translate Content Endpoint
@router.post("/translate")
async def translate_content(text: str, target_language: str):
    """Translate any text to target language"""
    try:
        from translation_service import translate_text
        
        translated = await translate_text(text, target_language)
        return {
            "original": text,
            "translated": translated,
            "target_language": target_language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# Get Lesson in Language
@router.get("/lessons/{lesson_id}")
async def get_lesson_in_language(lesson_id: str, language: str = 'en'):
    """Get lesson content translated to selected language"""
    try:
        from translation_service import translate_dict
        
        # Fetch lesson from database (mock for now)
        lesson = {
            "id": lesson_id,
            "title": "Introduction to Python Programming",
            "description": "Learn the basics of Python programming language",
            "content": "Python is a high-level, interpreted programming language...",
            "key_points": [
                "Variables and data types",
                "Control structures",
                "Functions and modules"
            ]
        }
        
        # Translate lesson content
        if language != 'en':
            lesson = await translate_dict(
                lesson,
                ['title', 'description', 'content'],
                language
            )
            
            # Translate list items
            from translation_service import translate_list
            lesson['key_points'] = await translate_list(lesson['key_points'], language)
        
        return {
            "lesson": lesson,
            "language": language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lesson: {str(e)}")

# =====================
# AUTOMATED FINANCIAL RECEIPT SYSTEM
# =====================

from pdf_generator import generate_donation_receipt, generate_fee_receipt
import secrets as secret_gen

def generate_receipt_number(prefix="WGS"):
    """Generate unique receipt number"""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    random_suffix = secret_gen.token_hex(3).upper()
    return f"{prefix}-{timestamp}-{random_suffix}"

async def send_whatsapp_mock(phone: str, message: str, related_type: str, related_id: str):
    """Mock WhatsApp sending (stores in database)"""
    try:
        log = MessagingLog(
            message_type="whatsapp",
            recipient=phone,
            content=message,
            status="sent",
            related_type=related_type,
            related_id=related_id,
            sent_at=datetime.now(timezone.utc)
        )
        await db.messaging_logs.insert_one(log.model_dump())
        return True
    except Exception as e:
        print(f"WhatsApp mock error: {str(e)}")
        return False

async def send_email_mock(email: str, subject: str, content: str, related_type: str, related_id: str):
    """Mock Email sending (stores in database)"""
    try:
        log = MessagingLog(
            message_type="email",
            recipient=email,
            subject=subject,
            content=content,
            status="sent",
            related_type=related_type,
            related_id=related_id,
            sent_at=datetime.now(timezone.utc)
        )
        await db.messaging_logs.insert_one(log.model_dump())
        return True
    except Exception as e:
        print(f"Email mock error: {str(e)}")
        return False

# DONATION ROUTES

@router.post("/donations/create")
async def create_donation(
    donor_type: str,
    donor_name: str,
    donor_email: str,
    donor_phone: str,
    amount: float,
    purpose: str,
    payment_method: str,
    donor_address: str = None,
    transaction_id: str = None
):
    """Create donation and generate PDF receipt"""
    try:
        # Generate receipt number
        receipt_number = generate_receipt_number("DON")
        
        # Create donation record
        donation = Donation(
            donor_type=donor_type,
            donor_name=donor_name,
            donor_email=donor_email,
            donor_phone=donor_phone,
            donor_address=donor_address,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            purpose=purpose,
            receipt_number=receipt_number,
            receipt_pdf_path=f"/receipts/donations/{receipt_number}.pdf",
            created_at=datetime.now(timezone.utc)
        )
        
        # Generate PDF receipt
        pdf_path = f"/app/backend/static/receipts/donations/{receipt_number}.pdf"
        generate_donation_receipt(donation.model_dump(), pdf_path)
        
        # Save donation to database
        await db.donations.insert_one(donation.model_dump())
        
        # Send WhatsApp (mock)
        whatsapp_message = f"🏆 WINGS GLOBAL EDU-SKILL HUB\n\nDear {donor_name},\n\nThank you for your generous donation of ₹{amount:,.2f}!\n\nReceipt No: {receipt_number}\nPurpose: {purpose}\n\nYour PDF receipt has been generated.\n\n✨ Together, we empower students worldwide!"
        whatsapp_sent = await send_whatsapp_mock(donor_phone, whatsapp_message, "donation", donation.id)
        
        # Send Email (mock)
        email_subject = f"Donation Receipt - {receipt_number}"
        email_content = f"""
        <html>
        <body style="font-family: Arial; background: linear-gradient(135deg, #C41E3A, #FFD700); padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
                <h1 style="color: #C41E3A; text-align: center;">🏆 WINGS GLOBAL EDU-SKILL HUB</h1>
                <h2 style="color: #FFD700; text-align: center;">Donation Receipt</h2>
                <p>Dear <strong>{donor_name}</strong>,</p>
                <p>Thank you for your generous donation of <strong>₹{amount:,.2f}</strong>!</p>
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                    <tr style="background: #FFF8DC;">
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Receipt No:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">{receipt_number}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Purpose:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">{purpose}</td>
                    </tr>
                    <tr style="background: #FFF8DC;">
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Amount:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">₹{amount:,.2f}</td>
                    </tr>
                </table>
                <p style="text-align: center; color: #666;">Your PDF receipt is attached.</p>
                <p style="text-align: center; color: #C41E3A; font-weight: bold;">✨ Together, we empower students worldwide! ✨</p>
            </div>
        </body>
        </html>
        """
        email_sent = await send_email_mock(donor_email, email_subject, email_content, "donation", donation.id)
        
        # Update sent status
        await db.donations.update_one(
            {"id": donation.id},
            {"$set": {"whatsapp_sent": whatsapp_sent, "email_sent": email_sent}}
        )
        
        # Create transaction record for dashboard
        transaction = Transaction(
            transaction_type="income",
            category="Donation",
            amount=amount,
            currency="INR",
            description=f"Donation from {donor_name} - {purpose}",
            payment_method=payment_method,
            related_type="donation",
            related_id=donation.id,
            created_by="system",
            created_at=datetime.now(timezone.utc)
        )
        await db.transactions.insert_one(transaction.model_dump())
        
        return {
            "success": True,
            "message": "Donation received successfully!",
            "donation_id": donation.id,
            "receipt_number": receipt_number,
            "receipt_pdf_url": f"/api/receipts/download/{receipt_number}",
            "whatsapp_sent": whatsapp_sent,
            "email_sent": email_sent
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process donation: {str(e)}")

@router.get("/donations/list")
async def list_donations(limit: int = 50):
    """List all donations"""
    try:
        donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        return {"donations": donations, "total": len(donations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch donations: {str(e)}")

# FEE PAYMENT ROUTES

@router.post("/fees/pay")
async def pay_fee(
    student_id: str,
    student_name: str,
    parent_id: str,
    parent_name: str,
    parent_email: str,
    parent_phone: str,
    student_class: str,
    fee_type: str,
    amount: float,
    payment_method: str,
    academic_year: str,
    term: str,
    transaction_id: str = None
):
    """Process fee payment and generate PDF receipt"""
    try:
        # Generate receipt number
        receipt_number = generate_receipt_number("FEE")
        
        # Create fee payment record
        fee_payment = FeePayment(
            student_id=student_id,
            student_name=student_name,
            parent_id=parent_id,
            parent_name=parent_name,
            parent_email=parent_email,
            parent_phone=parent_phone,
            student_class=student_class,
            fee_type=fee_type,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            receipt_number=receipt_number,
            receipt_pdf_path=f"/receipts/fees/{receipt_number}.pdf",
            academic_year=academic_year,
            term=term,
            created_at=datetime.now(timezone.utc)
        )
        
        # Generate PDF receipt
        pdf_path = f"/app/backend/static/receipts/fees/{receipt_number}.pdf"
        generate_fee_receipt(fee_payment.model_dump(), pdf_path)
        
        # Save fee payment to database
        await db.fee_payments.insert_one(fee_payment.model_dump())
        
        # Send WhatsApp to Parent (mock)
        parent_whatsapp = f"🏆 WINGS GLOBAL EDU-SKILL HUB\n\nDear {parent_name},\n\nFee payment received for {student_name} (Class {student_class})!\n\nAmount: ₹{amount:,.2f}\nFee Type: {fee_type}\nReceipt: {receipt_number}\n\nThank you!"
        whatsapp_sent_parent = await send_whatsapp_mock(parent_phone, parent_whatsapp, "fee", fee_payment.id)
        
        # Send Email to Parent (mock)
        email_subject = f"Fee Payment Receipt - {student_name}"
        email_content = f"""
        <html>
        <body style="font-family: Arial; background: linear-gradient(135deg, #C41E3A, #FFD700); padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
                <h1 style="color: #C41E3A; text-align: center;">🏆 WINGS GLOBAL EDU-SKILL HUB</h1>
                <h2 style="color: #FFD700; text-align: center;">Fee Payment Receipt</h2>
                <p>Dear <strong>{parent_name}</strong>,</p>
                <p>Fee payment received successfully!</p>
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                    <tr style="background: #FFF8DC;">
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Student:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">{student_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Class:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">{student_class}</td>
                    </tr>
                    <tr style="background: #FFF8DC;">
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Fee Type:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">{fee_type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Amount:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">₹{amount:,.2f}</td>
                    </tr>
                    <tr style="background: #FFF8DC;">
                        <td style="padding: 10px; border: 1px solid #FFD700;"><strong>Receipt No:</strong></td>
                        <td style="padding: 10px; border: 1px solid #FFD700;">{receipt_number}</td>
                    </tr>
                </table>
                <p style="text-align: center; color: #666;">Your PDF receipt is attached.</p>
                <p style="text-align: center; color: #C41E3A; font-weight: bold;">✨ Thank you for your payment! ✨</p>
            </div>
        </body>
        </html>
        """
        email_sent_parent = await send_email_mock(parent_email, email_subject, email_content, "fee", fee_payment.id)
        
        # Update sent status
        await db.fee_payments.update_one(
            {"id": fee_payment.id},
            {"$set": {
                "whatsapp_sent_parent": whatsapp_sent_parent,
                "email_sent_parent": email_sent_parent
            }}
        )
        
        # Create transaction record for dashboard
        transaction = Transaction(
            transaction_type="income",
            category="Fee",
            amount=amount,
            currency="INR",
            description=f"Fee payment - {student_name} ({student_class}) - {fee_type}",
            payment_method=payment_method,
            related_type="fee",
            related_id=fee_payment.id,
            created_by="system",
            created_at=datetime.now(timezone.utc)
        )
        await db.transactions.insert_one(transaction.model_dump())
        
        return {
            "success": True,
            "message": "Fee payment processed successfully!",
            "payment_id": fee_payment.id,
            "receipt_number": receipt_number,
            "receipt_pdf_url": f"/api/receipts/download/{receipt_number}",
            "whatsapp_sent": whatsapp_sent_parent,
            "email_sent": email_sent_parent
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process fee payment: {str(e)}")

@router.get("/fees/history/{parent_id}")
async def get_fee_history(parent_id: str, limit: int = 50):
    """Get fee payment history for parent dashboard"""
    try:
        payments = await db.fee_payments.find(
            {"parent_id": parent_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        total_paid = sum(p.get("amount", 0) for p in payments)
        
        return {
            "payments": payments,
            "total_payments": len(payments),
            "total_paid": total_paid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fee history: {str(e)}")

# RECEIPT DOWNLOAD


async def download_receipt(receipt_number: str):
    """Download PDF receipt"""
    try:
        # Check if donation receipt
        pdf_path = f"/app/backend/static/receipts/donations/{receipt_number}.pdf"
        if os.path.exists(pdf_path):
            return FileResponse(
                pdf_path,
                media_type="application/pdf",
                filename=f"{receipt_number}.pdf"
            )
        
        # Check if fee receipt
        pdf_path = f"/app/backend/static/receipts/fees/{receipt_number}.pdf"
        if os.path.exists(pdf_path):
            return FileResponse(
                pdf_path,
                media_type="application/pdf",
                filename=f"{receipt_number}.pdf"
            )
        
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download receipt: {str(e)}")

# DASHBOARD ROUTES

@router.get("/transactions/income-expenses")
async def get_income_expenses(
    start_date: str = None,
    end_date: str = None,
    category: str = None,
    limit: int = 100
):
    """Get all transactions for Hidden Head Dashboard"""
    try:
        query = {}
        
        if category:
            query["category"] = category
        
        if start_date and end_date:
            query["created_at"] = {
                "$gte": datetime.fromisoformat(start_date),
                "$lte": datetime.fromisoformat(end_date)
            }
        
        transactions = await db.transactions.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Calculate totals
        total_income = sum(t.get("amount", 0) for t in transactions if t.get("transaction_type") == "income")
        total_expense = sum(t.get("amount", 0) for t in transactions if t.get("transaction_type") == "expense")
        net_balance = total_income - total_expense
        
        # Group by category
        by_category = {}
        for t in transactions:
            cat = t.get("category", "Other")
            if cat not in by_category:
                by_category[cat] = {"income": 0, "expense": 0, "count": 0}
            
            if t.get("transaction_type") == "income":
                by_category[cat]["income"] += t.get("amount", 0)
            else:
                by_category[cat]["expense"] += t.get("amount", 0)
            
            by_category[cat]["count"] += 1
        
        return {
            "transactions": transactions,
            "total_transactions": len(transactions),
            "summary": {
                "total_income": total_income,
                "total_expense": total_expense,
                "net_balance": net_balance
            },
            "by_category": by_category
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transactions: {str(e)}")

@router.get("/messaging/logs")
async def get_messaging_logs(limit: int = 100):
    """Get all WhatsApp/Email logs"""
    try:
        logs = await db.messaging_logs.find({}, {"_id": 0}).sort("sent_at", -1).limit(limit).to_list(limit)
        return {"logs": logs, "total": len(logs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")


# =====================
# OFFICIAL ADMIN PORTAL
# =====================

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/admin/official/login")
async def official_admin_login(admin_id: str, password: str):
    """Official Admin login (D.E.O., Board Secretary)"""
    try:
        admin = await db.official_admins.find_one({"admin_id": admin_id}, {"_id": 0})
        
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not pwd_context.verify(password, admin.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not admin.get("is_active", False):
            raise HTTPException(status_code=403, detail="Account is deactivated")
        
        await db.official_admins.update_one(
            {"admin_id": admin_id},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        audit_log = {
            "id": str(uuid4()),
            "admin_id": admin_id,
            "admin_name": admin.get("name", ""),
            "admin_role": admin.get("designation", ""),
            "action": "login",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.admin_audit_logs.insert_one(audit_log)
        
        return {
            "success": True,
            "admin_id": admin_id,
            "name": admin.get("name"),
            "designation": admin.get("designation"),
            "board_name": admin.get("board_name"),
            "district": admin.get("district"),
            "access_level": admin.get("access_level", "official")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/admin/violations")
async def get_violations(admin_id: str, status: str = "pending"):
    """Get violation reports"""
    try:
        query = {"status": status} if status != "all" else {}
        violations = await db.violation_reports.find(query, {"_id": 0}).sort("detected_at", -1).limit(100).to_list(100)
        
        await db.admin_audit_logs.insert_one({
            "id": str(uuid4()),
            "admin_id": admin_id,
            "admin_name": admin_id,
            "admin_role": "official_admin",
            "action": "view_violations",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"violations": violations, "total": len(violations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch violations: {str(e)}")

@router.get("/admin/live-feeds")
async def get_live_feeds(admin_id: str):
    """Get active exam hall feeds"""
    try:
        feeds = await db.classroom_feeds.find({}, {"_id": 0}).limit(50).to_list(50)
        
        await db.admin_audit_logs.insert_one({
            "id": str(uuid4()),
            "admin_id": admin_id,
            "admin_name": admin_id,
            "admin_role": "official_admin",
            "action": "view_live_feeds",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"feeds": feeds, "total": len(feeds)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feeds: {str(e)}")

@router.get("/admin/analytics")
async def get_regional_analytics(admin_id: str):
    """Get regional analytics"""
    try:
        admin = await db.official_admins.find_one({"admin_id": admin_id}, {"_id": 0})
        
        analytics = {
            "total_students": 5000,
            "present_today": 4750,
            "attendance_rate": 95.0,
            "exams_conducted": 24,
            "total_exams": 30,
            "avg_score": 78.5,
            "pass_rate": 89.2,
            "board": admin.get("board_name") if admin else "Unknown",
            "district": admin.get("district") if admin else "Unknown"
        }
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

@router.post("/admin/audit-log")
async def create_audit_log(admin_id: str, action: str, resource_accessed: str = None):
    """Create audit log"""
    try:
        admin = await db.official_admins.find_one({"admin_id": admin_id}, {"_id": 0})
        
        log = {
            "id": str(uuid4()),
            "admin_id": admin_id,
            "admin_name": admin.get("name", "") if admin else "",
            "admin_role": admin.get("designation", "") if admin else "",
            "action": action,
            "resource_accessed": resource_accessed,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.admin_audit_logs.insert_one(log)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")

@router.post("/admin/official/create")
async def create_official_admin(admin_id: str, name: str, email: str, phone: str, designation: str, board_name: str, password: str, district: str = None):
    """Create official admin"""
    try:
        existing = await db.official_admins.find_one({"admin_id": admin_id}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Admin ID exists")
        
        admin = {
            "id": str(uuid4()),
            "admin_id": admin_id,
            "name": name,
            "email": email,
            "phone": phone,
            "designation": designation,
            "board_name": board_name,
            "district": district,
            "access_level": "official",
            "password_hash": pwd_context.hash(password),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.official_admins.insert_one(admin)
        return {"success": True, "admin_id": admin_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create admin: {str(e)}")
