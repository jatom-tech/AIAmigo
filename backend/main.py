from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import modules, prompts, auth, admin
import sys
import os

app = FastAPI()

# ✅ CORS Middleware (tillader lokal frontend at kalde backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🌱 Root endpoint (valgfrit test)
@app.get("/")
async def root():
    return {"message": "Hello, FastAPI is running!"}

# 📦 Inkluder routers
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(prompts.router, prefix="/prompts", tags=["Prompts"])
app.include_router(auth.router, tags=["Auth"])
app.include_router(admin.router, tags=["Admin"])
