from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
stored_models = []

class ModelInput(BaseModel):
    model: str

@router.post("/")
def receive_model(data: ModelInput):
    stored_models.append(data.model)
    return {"message": "Model received", "total": len(stored_models)}

@router.get("/")
def get_models():
    return {"models": stored_models}
