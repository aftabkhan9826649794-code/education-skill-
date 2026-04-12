from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import routes
import auth


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

# Include routes from routes.py
routes.set_db(db)
app.include_router(routes.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    """Initialize database with indexes and seed admin accounts"""
    try:
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
        await db.login_attempts.create_index("identifier")
        logger.info("✅ Database indexes created")
        
        # Seed admin account
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@wingsedu.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "WingsAdmin@2026")
        
        existing_admin = await db.users.find_one({"email": admin_email}, {"_id": 0})
        
        if existing_admin is None:
            # Create new admin
            admin_id = str(uuid.uuid4())
            admin_doc = {
                "id": admin_id,
                "email": admin_email,
                "name": "Admin",
                "role": "admin",
                "password_hash": auth.hash_password(admin_password),
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(admin_doc)
            logger.info(f"✅ Admin account created: {admin_email}")
        elif not auth.verify_password(admin_password, existing_admin["password_hash"]):
            # Update password if changed in .env
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": auth.hash_password(admin_password)}}
            )
            logger.info(f"✅ Admin password updated: {admin_email}")
        else:
            logger.info(f"✅ Admin account exists: {admin_email}")
        
        # Seed test student account
        student_email = os.environ.get("STUDENT_TEST_EMAIL", "student@test.com")
        student_password = os.environ.get("STUDENT_TEST_PASSWORD", "Student@123")
        
        existing_student = await db.users.find_one({"email": student_email}, {"_id": 0})
        
        if existing_student is None:
            student_id = str(uuid.uuid4())
            student_doc = {
                "id": student_id,
                "email": student_email,
                "name": "Test Student",
                "role": "student",
                "class_name": "Class 10",
                "student_id_number": "STU001",
                "parent_id": "",
                "password_hash": auth.hash_password(student_password),
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(student_doc)
            logger.info(f"✅ Test student account created: {student_email}")
        
        # Seed test parent account
        parent_email = os.environ.get("PARENT_TEST_EMAIL", "parent@test.com")
        parent_password = os.environ.get("PARENT_TEST_PASSWORD", "Parent@123")
        
        existing_parent = await db.users.find_one({"email": parent_email}, {"_id": 0})
        
        if existing_parent is None:
            parent_id = str(uuid.uuid4())
            parent_doc = {
                "id": parent_id,
                "email": parent_email,
                "name": "Test Parent",
                "role": "parent",
                "phone": "+919876543210",
                "linked_students": [],
                "password_hash": auth.hash_password(parent_password),
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(parent_doc)
            logger.info(f"✅ Test parent account created: {parent_email}")
        
        # Update test_credentials.md
        credentials_content = f"""# 🔐 WINGS EDU-SKILL HUB - Test Credentials

## Authentication Credentials

### Admin Account
```
Email: {admin_email}
Password: {admin_password}
Role: admin
```

### Test Student Account  
```
Email: {student_email}
Password: {student_password}
Role: student
Class: Class 10
Student ID: STU001
```

### Test Parent Account
```
Email: {parent_email}
Password: {parent_password}
Role: parent
Phone: +919876543210
```

## Official Admin Portal (D.E.O.)

**URL:** /admin-portal
```
Username: DEO-001
Password: test123
```

## Authentication Endpoints

### Register
POST /api/auth/register
Body: {{"email", "password", "name", "role", "phone"?, "class_name"?, "student_id_number"?}}

### Login
POST /api/auth/login
Body: {{"email", "password"}}

### Logout
POST /api/auth/logout

### Get Current User
GET /api/auth/me
(Requires authentication - sends JWT in cookie or Authorization header)

### Refresh Token
POST /api/auth/refresh

### Forgot Password
POST /api/auth/forgot-password
Body: {{"email"}}

### Reset Password
POST /api/auth/reset-password
Body: {{"token", "new_password"}}

---

**Last Updated:** {datetime.now().strftime("%B %d, %Y")}
**Status:** Production Ready with JWT Authentication
"""
        
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write(credentials_content)
        
        logger.info("✅ Test credentials saved to /app/memory/test_credentials.md")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()