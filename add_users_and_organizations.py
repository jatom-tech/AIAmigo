from sqlalchemy.orm import Session
from database import engine
from organization_models import Organization, User

# Opret en ny session
session = Session(bind=engine)

# Opret to fiktive organisationer
org1 = Organization(name="TechCorp")
org2 = Organization(name="EduSoft")

# Tilføj organisationerne til databasen
session.add_all([org1, org2])
session.commit()

print(f"Organisationer '{org1.name}' og '{org2.name}' tilføjet!")

# Liste over brugere til hver organisation
users_org1 = [
    {"username": "tech_user1", "hashed_password": "hashed_password1", "is_active": True, "role": "admin"},
    {"username": "tech_user2", "hashed_password": "hashed_password2", "is_active": True, "role": "user"},
    {"username": "tech_user3", "hashed_password": "hashed_password3", "is_active": True, "role": "user"},
    {"username": "tech_user4", "hashed_password": "hashed_password4", "is_active": True, "role": "user"},
    {"username": "tech_user5", "hashed_password": "hashed_password5", "is_active": False, "role": "user"},
]

users_org2 = [
    {"username": "edu_user1", "hashed_password": "hashed_password6", "is_active": True, "role": "admin"},
    {"username": "edu_user2", "hashed_password": "hashed_password7", "is_active": True, "role": "user"},
    {"username": "edu_user3", "hashed_password": "hashed_password8", "is_active": False, "role": "user"},
    {"username": "edu_user4", "hashed_password": "hashed_password9", "is_active": True, "role": "user"},
    {"username": "edu_user5", "hashed_password": "hashed_password10", "is_active": True, "role": "user"},
]

# Tilføj brugere til organisation 1
for user_data in users_org1:
    new_user = User(
        username=user_data["username"],
        hashed_password=user_data["hashed_password"],
        is_active=user_data["is_active"],
        role=user_data["role"],
        organization_id=org1.id,
    )
    session.add(new_user)

# Tilføj brugere til organisation 2
for user_data in users_org2:
    new_user = User(
        username=user_data["username"],
        hashed_password=user_data["hashed_password"],
        is_active=user_data["is_active"],
        role=user_data["role"],
        organization_id=org2.id,
    )
    session.add(new_user)

# Gem ændringerne i databasen
session.commit()

print("Brugere tilføjet til begge organisationer!")

# Luk sessionen
session.close()