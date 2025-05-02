from sqlalchemy.orm import Session
from database import engine
from user_models import User

# Opret en ny session
session = Session(bind=engine)

# Tilføj en ny bruger
new_user = User(
    username="johndoe",
    hashed_password="hashed_password_example",  # Adgangskoden skal hashes i praksis
    is_active=True,
    role="user"
)

# Gem brugeren i databasen
session.add(new_user)
session.commit()

print("Bruger tilføjet!")

# Luk sessionen
session.close()