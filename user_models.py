from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")  # f.eks. "admin" eller "user"

# Eksempel på rollebeskrivelse:
# - "admin": Har adgang til alle endpoints og kan administrere systemet.
# - "user": Begrænset adgang til specifikke funktioner.