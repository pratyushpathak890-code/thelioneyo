from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import jwt as pyjwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'lioneyo-jwt-secret-2024')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@thelioneyo.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Lioneyo@123')


class AdminLoginRequest(BaseModel):
    email: str
    password: str


@api_router.get("/")
async def root():
    return {"message": "THE LIONEYO API"}


@api_router.post("/admin/login")
async def admin_login(credentials: AdminLoginRequest):
    if credentials.email != ADMIN_EMAIL or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = pyjwt.encode(
        {
            "email": credentials.email,
            "role": "admin",
            "exp": datetime.now(timezone.utc) + timedelta(hours=48),
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return {"token": token, "email": credentials.email}


@api_router.get("/admin/verify")
async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    token = authorization.split(" ")[1]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"valid": True, "email": payload.get("email")}
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
