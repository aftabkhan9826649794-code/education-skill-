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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class DrawingSave(BaseModel):
    title: str = ""
    image_data: str


class Drawing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    image_data: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/")
async def root():
    return {"message": "AirWrite API - Smart Air-Writing for Teachers"}


@api_router.get("/health")
async def health():
    return {"status": "healthy"}


@api_router.post("/drawings", response_model=Drawing)
async def save_drawing(input_data: DrawingSave):
    drawing = Drawing(title=input_data.title, image_data=input_data.image_data)
    doc = drawing.model_dump()
    await db.drawings.insert_one(doc)
    return drawing


@api_router.get("/drawings", response_model=List[Drawing])
async def get_drawings():
    drawings = await db.drawings.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return drawings


@api_router.delete("/drawings/{drawing_id}")
async def delete_drawing(drawing_id: str):
    result = await db.drawings.delete_one({"id": drawing_id})
    if result.deleted_count == 0:
        return {"error": "Drawing not found"}
    return {"message": "Drawing deleted"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
