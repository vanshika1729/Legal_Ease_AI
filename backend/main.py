import os
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import FastAPI, Body, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from uuid import uuid4
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from typing import Optional, List
from datetime import datetime, timedelta
import json
from google.oauth2 import service_account

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from google.cloud import translate_v2 as translate

load_dotenv()

# --- Database setup ---
DATABASE_URL = "sqlite:///./legalease.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

pdfmetrics.registerFont(TTFont('NotoSansDevanagari', 'NotoSansDevanagari-Regular.ttf'))

# --- Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    notices = relationship("Notice", back_populates="owner")

class Notice(Base):
    __tablename__ = "notices"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    translated_content = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="notices")

Base.metadata.create_all(bind=engine)

# --- Utility functions ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- FastAPI app ---
app = FastAPI()

origins = [
    "http://localhost:3000", 
    "https://legal-ease-ai-eight.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for JWT. Please set it in your .env file.")

load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=gemini_api_key)

# --- Schemas ---
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class NoticeRequest(BaseModel):
    notice_type: str
    name: str
    details: str
    # recipient: Optional[str] = None

class SaveNoticeRequest(BaseModel):
    title: str
    content: str
    translated_content: Optional[str] = None

class TranslationRequest(BaseModel):
    text: str
    target_language: str

class NoticeOut(BaseModel):
    id: int
    title: str
    content: str
    translated_content: Optional[str] = None
    created_at: str
    class Config:
        orm_mode = True

# --- Auth endpoints ---
@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Notice endpoints ---
@app.post("/generate_notice")
async def generate_notice(req: NoticeRequest, current_user: User = Depends(get_current_user)):
    if req.notice_type == 'other':
        prompt = (
            f"Write a formal legal notice for the following issue described by the user.\n"
            f"Sender: {req.name}\n"
            f"Issue: {req.details}\n"
            "The notice should be clear, polite, and legally sound."
        )
    else:
        prompt = (
            f"Write a formal legal notice for a {req.notice_type.replace('_', ' ')}.\n"
            f"Sender: {req.name}\n"
            f"Details: {req.details}\n"
            "The notice should be clear, polite, and legally sound."
        )
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    response = model.generate_content(prompt)
    notice_text = response.text.strip()
    return {"notice": notice_text}

@app.post("/save_notice")
def save_notice(req: SaveNoticeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_notice = Notice(title=req.title, content=req.content,translated_content=req.translated_content, owner_id=current_user.id)
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return {"message": "Notice saved", "id": new_notice.id}

@app.get("/list_notices", response_model=List[NoticeOut])
def list_notices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notices = db.query(Notice).filter(Notice.owner_id == current_user.id).order_by(Notice.created_at.desc()).all()
    return notices

@app.get("/get_notice", response_model=NoticeOut)
def get_notice(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == id, Notice.owner_id == current_user.id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return notice



@app.delete("/delete_notice/{notice_id}", status_code=status.HTTP_200_OK)
def delete_notice(notice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    #Deletes a notice by its ID for the currently authenticated user.

    notice_to_delete = db.query(Notice).filter(
        Notice.id == notice_id,
        Notice.owner_id == current_user.id
    ).first()

    if not notice_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notice not found or you don't have permission to delete it."
        )

    db.delete(notice_to_delete)
    db.commit()
    return {"message": "Notice deleted successfully"}

@app.post("/translate_text")
async def do_translate(request: TranslationRequest, current_user: User = Depends(get_current_user)):
    try:
        # Get the JSON credentials string from the environment variable
        creds_json_str = os.getenv('GOOGLE_CREDENTIALS_JSON')
        if not creds_json_str:
            raise ValueError("GOOGLE_CREDENTIALS_JSON environment variable not set.")

        # Load the string into a Python dictionary
        credentials_info = json.loads(creds_json_str)
        
        # Create credentials from the dictionary
        credentials = service_account.Credentials.from_service_account_info(credentials_info)
        
        # Initialize Google client with the credentials
        translate_client = translate.Client(credentials=credentials)

        
        original_paragraphs = request.text.split('\n\n')
        translated_paragraphs = []

        # 2. Translate each paragraph individually
        for paragraph in original_paragraphs:
            if paragraph.strip(): # Only translate non-empty paragraphs
                result = translate_client.translate(
                    paragraph, 
                    target_language=request.target_language
                )
                translated_paragraphs.append(result['translatedText'])

        final_translated_text = '\n\n'.join(translated_paragraphs)

        return {"translated_text": final_translated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation service failed: {str(e)}")


#@app.post("/export_pdf")
#async def export_pdf(notice: str = Body(..., embed=True)):
#    pdf_filename = f"notice_{uuid4().hex}.pdf"
#    c = canvas.Canvas(pdf_filename, pagesize=letter)
#    width, height = letter
#    lines = notice.split('\n')
#    y = height - 40
#    for line in lines:
#        c.drawString(40, y, line)
#        y -= 18
#        if y < 40:
#            c.showPage()
#            y = height - 40
#    c.save()
#    return FileResponse(pdf_filename, media_type='application/pdf', filename=pdf_filename)

@app.post("/export_pdf")
async def export_pdf(notice: str = Body(..., embed=True)):
    pdf_filename = f"notice_{uuid4().hex}.pdf"

    styles = getSampleStyleSheet()
    custom_style = ParagraphStyle(
        name='CustomStyle',
        parent=styles['Normal'],
        fontName='NotoSansDevanagari',  
        fontSize=11,
        leading=14  
    )

    try:
        text_with_breaks = notice.replace('\n', '<br/>')
        p = Paragraph(text_with_breaks, custom_style)

        doc = SimpleDocTemplate(pdf_filename, pagesize=letter)
        doc.build([p])
        
        return FileResponse(pdf_filename, media_type='application/pdf', filename="LegalNotice.pdf")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@app.get("/")
def read_root():
    print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))
    return {"message": "LegalEase AI Backend Running"} 