from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Interview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_name: str
    company_name: str
    interview_date: str  # Format: YYYY-MM-DD
    interview_time: str  # Format: HH:MM
    duration: int  # 30 or 60 minutes
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InterviewCreate(BaseModel):
    candidate_name: str
    company_name: str
    interview_date: str
    interview_time: str
    duration: int

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    message: str


# Helper functions
def create_token(username: str) -> str:
    return jwt.encode({"username": username}, JWT_SECRET, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


# Routes
@api_router.get("/")
async def root():
    return {"message": "Interview Scheduler API"}

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(login_data: AdminLogin):
    if login_data.username == ADMIN_USERNAME and login_data.password == ADMIN_PASSWORD:
        token = create_token(login_data.username)
        return TokenResponse(token=token, message="Login successful")
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/interviews", response_model=Interview)
async def create_interview(interview_data: InterviewCreate):
    interview_dict = interview_data.model_dump()
    interview_obj = Interview(**interview_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = interview_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.interviews.insert_one(doc)
    return interview_obj

@api_router.get("/interviews", response_model=List[Interview])
async def get_all_interviews(payload: dict = Depends(verify_token)):
    interviews = await db.interviews.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for interview in interviews:
        if isinstance(interview['created_at'], str):
            interview['created_at'] = datetime.fromisoformat(interview['created_at'])
    
    return interviews

@api_router.get("/interviews/date/{date}", response_model=List[Interview])
async def get_interviews_by_date(date: str, payload: dict = Depends(verify_token)):
    interviews = await db.interviews.find({"interview_date": date}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for interview in interviews:
        if isinstance(interview['created_at'], str):
            interview['created_at'] = datetime.fromisoformat(interview['created_at'])
    
    return interviews


# Include the router in the main app
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()