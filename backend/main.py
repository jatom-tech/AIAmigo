
from fastapi import FastAPI
from backend.routers import prompts, models


app = FastAPI(title="AIAmigo Compliance API")

app.include_router(prompts.router, prefix="/prompts")
app.include_router(models.router, prefix="/models")

@app.get("/")
def root():
    return {"message": "AIAmigo Compliance API is running"}
