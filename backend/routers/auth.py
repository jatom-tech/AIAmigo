import random
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

# Dummy data for admin credentials
ADMIN_USERNAME = "admin123"
ADMIN_PASSWORD = "adminpassword"
ADMIN_PIN = "1301"

# Temporary storage for generated codes
verification_codes = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class VerifyCodeRequest(BaseModel):
    username: str
    pin: str
    code: int

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/auth/login")
async def admin_login(request: LoginRequest):
    if request.username == ADMIN_USERNAME and request.password == ADMIN_PASSWORD:
        # Generate a random 6-digit verification code
        code = random.randint(100000, 999999)
        verification_codes[request.username] = code
        # Simulate sending the code (e.g., via email or SMS)
        print(f"Verification code for {request.username}: {code}")
        return {"message": "Login successful, verification code sent"}
    raise HTTPException(status_code=401, detail="Invalid login credentials")

@router.post("/auth/verify-code")
async def verify_code(request: VerifyCodeRequest):
    if request.username == ADMIN_USERNAME and request.pin == ADMIN_PIN:
        if request.username in verification_codes and verification_codes[request.username] == request.code:
            # Remove the code after successful verification
            del verification_codes[request.username]
            # Create a JWT token
            access_token = create_access_token(data={"sub": request.username})
            return {"access_token": access_token, "token_type": "bearer"}
        raise HTTPException(status_code=400, detail="Invalid verification code")
    raise HTTPException(status_code=401, detail="Invalid PIN or username")