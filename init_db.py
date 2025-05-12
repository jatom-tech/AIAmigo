from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from organization_models import Base, Organization, User
from passlib.hash import bcrypt

# Database URL
DATABASE_URL = "sqlite:///./aiamigo.db"

# Opret engine og Base
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

# Session
from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db: Session = SessionLocal()

# Tjek om org findes
org = db.query(Organization).filter_by(name="AIAmigo Org").first()
if not org:
    org = Organization(name="AIAmigo Org")
    db.add(org)
    db.commit()
    db.refresh(org)

# Tilføj brugere
users = [
    {"username": "Jan", "password": "jan123", "role": "admin"},
    {"username": "Sofie", "password": "sofie123", "role": "user"},
    {"username": "Erik", "password": "erik123", "role": "user"},
    {"username": "Martin", "password": "martin123", "role": "user"},
    {"username": "Liz", "password": "liz123", "role": "user"},
]

for u in users:
    existing = db.query(User).filter_by(username=u["username"]).first()
    if not existing:
        user = User(
            username=u["username"],
            hashed_password=bcrypt.hash(u["password"]),
            role=u["role"],
            organization_id=org.id,
        )
        db.add(user)

db.commit()
db.close()
