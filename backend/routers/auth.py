from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str
    pin: str

@router.post("/auth/login")
async def login(request: LoginRequest):
    if request.username == "admin" and request.password == "adminpassword" and request.pin == "1234":
        return {"message": "Login succesfuldt"}
    raise HTTPException(status_code=401, detail="Ugyldige loginoplysninger")