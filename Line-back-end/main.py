from fastapi import FastAPI, Depends
from Routes.webhook_route import router as webhook_router
from Routes.Auth import router as auth_router
from sqlalchemy.orm import Session
from sqlalchemy import text
from Config.database_config import Base, engine, SessionLocal
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = [
    "https://form.librairy.work"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware, 
    secret_key=os.urandom(32) # หรือตั้งค่าเป็นสตริงลับใน .env
)

app.include_router(webhook_router)
app.include_router(auth_router, prefix="/auth")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/check-db")
def check_db_connection(db: Session = Depends(get_db)):
    try:
        # ทดสอบ query เบา ๆ
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection successful ✅"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed ❌: {e}"}

@app.get("/")
def home():
    return {"message": "LINE + Groq chatbot running with SDK v3! hello"}
