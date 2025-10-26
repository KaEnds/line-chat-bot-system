from fastapi import FastAPI, Depends
from Routes.webhook_route import router as webhook_router
from sqlalchemy.orm import Session
from sqlalchemy import text
from Config.database_config import Base, engine, SessionLocal

app = FastAPI()

app.include_router(webhook_router)

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
