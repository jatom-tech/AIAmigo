from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os

# JWT konfiguration
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"

security = HTTPBearer()
router = APIRouter()

# Token-validering
def verify_token(credentials: HTTPAuthorizationCredentials):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if not username or not role:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {"username": username, "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Admin-ping
@router.get("/admin/panel")
async def admin_panel(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = verify_token(credentials)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return {"message": f"Welcome to the admin panel, {user['username']}"}

# ✅ Nyt endpoint til frontend-dashboard
@router.get("/admin/users")
async def get_admin_users(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = verify_token(credentials)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Midlertidigt hardcodet svar
    return [
        {"navn": "Admin", "kilde": "CP", "score": 90},
        {"navn": "Bruger 1", "kilde": "DS", "score": 73},
        {"navn": "Bruger 2", "kilde": "ChatGPT", "score": 63},
        {"navn": "Bruger 3", "kilde": "GPT", "score": 83},
    ]
