from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import modules, prompts, auth, admin  # Tilføj admin-router
import sys
import os


app = FastAPI()

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chat.openai.com",
        "https://chatgpt.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello, FastAPI is running!"}


# Inkluder routers
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(prompts.router, prefix="/prompts", tags=["Prompts"])
app.include_router(auth.router, tags=["Auth"])  # Inkluder auth-router
app.include_router(admin.router, tags=["Admin"])  # Tilføj admin-router