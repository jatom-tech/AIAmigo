from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from user_models import User
from backend.utils.auth_utils import verify_password
from fastapi import Request
from pydantic import BaseModel

# JWT konfiguration
SECRET_KEY = "your_secret_key"  # SKIFT denne nøgle i produktion!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Swagger auth – bemærk: ingen skråstreg
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

# Login input
class LoginRequest(BaseModel):
    username: str
    password: str

# Token payload
class TokenData(BaseModel):
    username: str
    role: str

# JWT token-generator
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Login endpoint (RET HER)
@router.post("/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    # Returnér også username og role!
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }

# Brugervalidering via token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

# Endpoint til at få oplysninger om nuværende bruger
@router.get("/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "role": current_user.role,
        "organization_id": current_user.organization_id
    }

# 🔐 Log-data model
class PromptLog(BaseModel):
    user: str
    prompt: str
    score: int
    timestamp: datetime

# 🔒 Endpoint: modtag prompt og log den
@router.post("/api/log")
async def log_prompt(
    log: PromptLog,
    current_user: User = Depends(get_current_user)
):
    print(f"[AIAmigo-LOG] {log.timestamp} | {log.user} | {log.score}% → {log.prompt}")

    # TODO: Her kan du gemme i database hvis ønsket
    return {"message": "Prompt modtaget og logget"}