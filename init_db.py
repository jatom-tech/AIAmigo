from database import engine, Base
from organization_models import Organization, User

# Opret tabellerne i databasen
print("Initialiserer databasen og opretter tabeller...")
Base.metadata.create_all(bind=engine)
print("Tabeller oprettet!")