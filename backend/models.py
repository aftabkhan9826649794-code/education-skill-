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

# Live Surveillance System Models
class ParentUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: str
    name: str
    email: str
    phone: str
    linked_students: List[str]  # List of student_ids
    created_at: datetime

class SuperAdmin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_id: str
    name: str
    email: str
    access_level: str = "master"  # Full access to everything
    created_at: datetime

class ClassroomFeed(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    classroom_id: str
    board_name: str
    class_level: str
    section: str
    stream_url: str  # Encrypted stream URL
    is_active: bool
    students_enrolled: List[str]  # List of student_ids
    created_at: datetime

class StreamAccessToken(BaseModel):
    token: str


# Adaptive Learning System Models
class StudentLearningProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    learning_style: str  # "visual", "auditory", "kinesthetic", "reading_writing"
    primary_interests: List[str]  # ["Technology", "Science", "Arts", "Sports"]
    interest_scores: dict  # {"Technology": 85, "Science": 70, ...}
    preferred_content_type: str  # "video", "interactive_quiz", "reading", "audio"
    engagement_level: float  # 0-100
    last_updated: datetime

class StudentBehavior(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    action_type: str  # "view_video", "take_quiz", "rate_topic", "complete_lesson"
    content_id: str
    content_type: str  # "video", "quiz", "reading"
    topic: str
    time_spent_seconds: int
    rating: Optional[int] = None  # 1-5 stars
    performance_score: Optional[float] = None  # Quiz score
    timestamp: datetime

class PersonalizedRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    recommendation_type: str  # "skill", "career_path", "content", "topic"
    title: str
    description: str
    relevance_score: float  # 0-100
    recommended_actions: List[str]
    created_at: datetime

class SARAPersonality(BaseModel):
    student_id: str
    teaching_style: str  # "visual_focused", "step_by_step", "exploratory", "practical"
    explanation_complexity: str  # "simple", "moderate", "advanced"
    interaction_tone: str  # "encouraging", "direct", "motivational"
    use_analogies: bool
    use_real_world_examples: bool
    last_adapted: datetime

    user_id: str
    user_role: str  # "parent" or "super_admin"
    classroom_id: str
    expires_at: datetime
    created_at: datetime

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_role: str  # "parent" or "super_admin"
    action: str  # "view_feed", "access_denied", "login", "logout"
    classroom_id: Optional[str] = None
    student_id: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
    details: Optional[dict] = None

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

# Master Skill Hub Models
class SkillModule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    skill_name: str  # "Computer Mastery", "Coding Lab", "AI-Tool Specialist"
    description: str
    icon: str
    topics: List[str]
    created_at: datetime

class SkillResource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    skill_id: str
    type: str  # "video", "pdf"
    title: str
    description: str
    url: str  # YouTube or PDF external link
    created_at: datetime

class SkillBadge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    skill_id: str
    skill_name: str
    score: float  # Percentage score from quiz
    earned_at: datetime
    badge_type: str = "WINGS Certified Golden Badge"

class SkillQuizAttempt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    skill_id: str
    questions: List[dict]
    answers: List[int]
    correct_answers: int
    total_questions: int
    score_percentage: float
    badge_earned: bool
    attempted_at: datetime

# Automated Financial Receipt System Models
class Donation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_type: str  # "Trust", "Company", "Person"
    donor_name: str
    donor_email: str
    donor_phone: str
    donor_address: Optional[str] = None
    amount: float
    currency: str = "INR"
    payment_method: str  # "UPI", "Card", "NetBanking", "Cash"
    transaction_id: Optional[str] = None
    purpose: str  # "General Donation", "Scholarship Fund", "Infrastructure"
    receipt_number: str
    receipt_pdf_path: str
    payment_status: str = "completed"  # "pending", "completed", "failed"
    whatsapp_sent: bool = False
    email_sent: bool = False
    created_at: datetime
    
class FeePayment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    parent_id: str
    parent_name: str
    parent_email: str
    parent_phone: str
    student_class: str
    fee_type: str  # "Tuition", "Exam", "Library", "Transport", "Other"
    amount: float
    currency: str = "INR"
    payment_method: str
    transaction_id: Optional[str] = None
    receipt_number: str
    receipt_pdf_path: str
    payment_status: str = "completed"
    academic_year: str
    term: str  # "Q1", "Q2", "Q3", "Q4", "Annual"
    whatsapp_sent_student: bool = False
    whatsapp_sent_parent: bool = False
    email_sent_student: bool = False
    email_sent_parent: bool = False
    created_at: datetime

class Receipt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    receipt_number: str
    receipt_type: str  # "donation", "fee"
    related_id: str  # donation_id or fee_payment_id
    pdf_path: str
    generated_at: datetime

class MessagingLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message_type: str  # "whatsapp", "email"
    recipient: str  # phone or email
    subject: Optional[str] = None
    content: str
    status: str  # "sent", "failed", "pending"
    related_type: str  # "donation", "fee"
    related_id: str
    sent_at: datetime

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_type: str  # "income", "expense"
    category: str  # "Donation", "Fee", "Salary", "Infrastructure"
    amount: float
    currency: str = "INR"
    description: str
    payment_method: str
    related_type: Optional[str] = None  # "donation", "fee"
    related_id: Optional[str] = None
    created_by: str  # admin_id
    created_at: datetime
