from fastapi import FastAPI, Depends, HTTPException
from Routes.webhook_route import router as webhook_router
from Routes.Auth import router as auth_router
from Routes.API import router as API_router
from sqlalchemy.orm import Session
from sqlalchemy import text
from Config.database_config import Base, engine, SessionLocal
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
from Config.database_config import TestBib
import os

app = FastAPI()

origins = [
    "https://form.librairy.work"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)
app.include_router(auth_router, prefix="/auth")
app.include_router(API_router, prefix="/API")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/get-books")
def get_books(
    bibid: int | None = None,  # ทำให้ bibid เป็น Optional (รับ int หรือ None)
    title: str | None = None,  # เพิ่ม: รับค่า title (optional)
    author: str | None = None, # เพิ่ม: รับค่า author (optional)
    db: Session = Depends(get_db) # ฉีด DB Session เข้ามา
):
    if bibid is not None:
        book = db.query(TestBib).filter(TestBib.bibid == bibid).first()
        if book is None:
            raise HTTPException(status_code=404, detail="Book not found")
            
        # ถ้าเจอ, FastAPI จะแปลงเป็น JSON และส่งกลับไป
        return book # คืนหนังสือเล่มเดียว
    
    # --- ถ้า bibid ไม่ถูกส่งมา, ให้ค้นหาจาก
    #     title หรือ author ---
    
    # เริ่มต้น Query
    query = db.query(TestBib)
    
    if title is not None:
        # ถ้ามี title, เพิ่มเงื่อนไขการ filter
        # .ilike() คือการค้นหาแบบ case-insensitive (A-Z, a-z เหมือนกัน)
        # f"%{title}%" คือการค้นหาว่ามีคำนี้อยู่ "ตรงไหนก็ได้" ใน title
        query = query.filter(TestBib.title.ilike(f"%{title}%"))
        
    if author is not None:
        # ถ้ามี author, เพิ่มเงื่อนไขการ filter
        query = query.filter(TestBib.author.ilike(f"%{author}%"))
        
    # ถ้าไม่มี bibid, title, หรือ author เลย
    # query ก็จะดึง 10 เล่มแรกตามปกติ
    books = query.limit(10).all()
    return books # คืนเป็น List

@app.get("/")
def home():
    return {"message": "LINE + Groq chatbot running with SDK v3! hello"}
