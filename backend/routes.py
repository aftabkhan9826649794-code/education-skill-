from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from models import (
    AttendanceRecord, AttendanceCreate,
    GeneratedContent, ContentGenerateRequest,
    ParentNotification, NotificationCreate,
    ProgressReport, ProgressReportCreate,
    Student, StudentCreate
)
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import json

router = APIRouter()

# MongoDB connection (will be set from server.py)
db = None

def set_db(database):
    global db
    db = database

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
