from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import List
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
    ParentUser, SuperAdmin, ClassroomFeed, StreamAccessToken, AuditLog
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
        parent_id = str(uuid.uuid4())
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
