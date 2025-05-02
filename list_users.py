from sqlalchemy.orm import Session
from database import engine
from user_models import User

# Opret en ny session
session = Session(bind=engine)

# Hent og udskriv alle brugere
users = session.query(User).all()
for user in users:
    print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}, Active: {user.is_active}")

# Luk sessionen
session.close()