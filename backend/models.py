from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Attendance Model
class AttendanceRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    timestamp: datetime
    confidence: float
    course_name: str
    status: str  # "present", "absent", "late"

class AttendanceCreate(BaseModel):
    student_id: str
    student_name: str
    confidence: float
    course_name: str
    status: str = "present"

# Auto-Generated Content Model
class GeneratedContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_type: str  # "quiz", "homework", "worksheet"
    subject: str
    topic: str
    content: dict  # Stores questions, answers, etc.
    generated_at: datetime
    for_class: str

class ContentGenerateRequest(BaseModel):
    content_type: str
    subject: str
    topic: str
    for_class: str
    difficulty: Optional[str] = "medium"

# Parent Notification Model
class ParentNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    parent_id: str
    notification_type: str  # "attendance", "marks", "weak_topic", "homework"
    title: str
    message: str
    data: Optional[dict] = None
    timestamp: datetime
    read: bool = False

class NotificationCreate(BaseModel):
    student_id: str
    parent_id: str
    notification_type: str
    title: str
    message: str
    data: Optional[dict] = None

# Progress Report Model
class ProgressReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    subject: str
    topic: str
    score: float
    total: float
    weak_areas: List[str]
    timestamp: datetime

class ProgressReportCreate(BaseModel):
    student_id: str
    subject: str
    topic: str
    score: float
    total: float
    weak_areas: List[str]

# Student Model
class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    class_name: str
    student_id_number: str
    parent_id: str
    enrolled_at: datetime

class StudentCreate(BaseModel):
    name: str
    class_name: str
    student_id_number: str
    parent_id: str

# Exam Schedule Model
class ExamSchedule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_type: str  # "weekly", "monthly", "half_yearly", "final"
    subject: str
    class_name: str
    scheduled_date: datetime
    duration_minutes: int
    total_marks: int
    created_at: datetime

class ExamScheduleCreate(BaseModel):
    exam_type: str


# Education Board System Models
class EducationBoard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    board_name: str  # "CBSE", "ICSE", "State", "IB", "Cambridge"
    country: str
    education_mode: str  # "Regular", "Distance", "Private"
    class_level: str  # "Nursery", "1-12", "Diploma", "Degree", "Masters", "PhD"

class CourseModule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    board_name: str
    class_level: str
    subject: str
    topic: str
    module_name: str
    pdf_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: datetime

class ClassDashboard(BaseModel):
    board_name: str
    education_mode: str
    class_level: str
    subjects: List[str]
    modules: List[dict]

    subject: str
    class_name: str
    scheduled_date: str  # ISO format
    duration_minutes: int
    total_marks: int

# Exam Result Model
class ExamResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    exam_id: str
    score: float
    total: float
    percentage: float
    weak_topics: List[str]
    submitted_at: datetime
    answers: Optional[dict] = None

class ExamResultCreate(BaseModel):
    student_id: str
    exam_id: str
    score: float
    total: float
    weak_topics: List[str]
    answers: Optional[dict] = None

# Global Skill Recommendation Model
class SkillRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    country: str
    region: Optional[str] = None
    recommended_skills: List[str]
    job_market_trend: str
    priority: str  # "high", "medium", "low"

# Research Project Model (PhD Portal)
class ResearchProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    researcher_id: str
    field: str
    description: str
    status: str  # "proposal", "ongoing", "completed"
    created_at: datetime
    keywords: List[str]

class ResearchProjectCreate(BaseModel):
    title: str
    researcher_id: str
    field: str
    description: str
    keywords: List[str]

# Competitive Exam Models
class CompetitiveExamQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_type: str  # "SAT", "JEE", "GRE", "GMAT", "PhD", etc.
    topic: str
    subtopic: Optional[str] = None
    question_type: str  # "objective", "scenario_based"
    question: str
    options: List[str]
    correct_answer: int  # Index of correct option
    rationale: str  # AI-generated explanation
    difficulty: str  # "easy", "medium", "hard", "expert"
    points: int

class CompetitiveExamAttempt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    exam_type: str
    topic: str
    questions: List[dict]
    student_answers: List[int]
    score: float
    total_points: int
    percentage: float
    time_taken_seconds: int
    weak_topics: List[str]
    job_readiness_score: float  # 0-100
    attempted_at: datetime

class CompetitiveExamAttemptCreate(BaseModel):
    student_id: str
    exam_type: str
    topic: str
    questions: List[dict]
    student_answers: List[int]
    time_taken_seconds: int

class JobReadinessMetrics(BaseModel):
    student_id: str
    overall_score: float  # 0-100
    exam_performance: dict  # {exam_type: score}
    strong_areas: List[str]
    weak_areas: List[str]
    recommended_focus: List[str]
    last_updated: datetime
