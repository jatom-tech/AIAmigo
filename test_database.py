from sqlalchemy.orm import Session
from database import engine
from organization_models import Organization, User

# Opret en session
session = Session(bind=engine)

try:
    # Tilføj en ny organisation
    new_org = Organization(name="Test Organization")
    session.add(new_org)
    session.commit()
    print(f"Organisation '{new_org.name}' tilføjet!")

    # Tilføj en ny bruger til organisationen
    new_user = User(
        username="test_user",
        hashed_password="hashed_password",
        is_active=1,
        role="user",
        organization_id=new_org.id,
    )
    session.add(new_user)
    session.commit()
    print(f"Bruger '{new_user.username}' tilføjet til organisationen '{new_org.name}'!")

    # Bekræft relationen
    org = session.query(Organization).filter_by(name="Test Organization").first()
    print(f"Organisation: {org.name}")
    for user in org.users:
        print(f"  Bruger: {user.username}, Rolle: {user.role}")

finally:
    session.close()
    