from sqlalchemy.orm import Session
from database import engine
from user_models import User
from organization_models import Organization

# Opret en session
session = Session(bind=engine)

# Hent og udskriv alle organisationer og deres brugere
organizations = session.query(Organization).all()

print("Eksisterende data i databasen:")
for org in organizations:
    print(f"Organisation: {org.name}")
    for user in org.users:
        print(f"  Bruger: {user.username}, Rolle: {user.role}, Aktiv: {user.is_active}")

session.close()