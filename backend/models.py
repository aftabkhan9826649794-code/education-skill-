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
