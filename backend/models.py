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
