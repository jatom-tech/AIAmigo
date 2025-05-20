from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os

# JWT konfiguration
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  # Brug en sikker værdi i produktion!
ALGORITHM = "HS256"

# Brug HTTPBearer i stedet for OAuth2PasswordBearer
security = HTTPBearer()

router = APIRouter()

# Funktion til at verificere token
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

# Admin-beskyttet endpoint
@router.get("/admin/panel")
async def admin_panel(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = verify_token(credentials)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return {"message": f"Welcome to the admin panel, {user['username']}"}
