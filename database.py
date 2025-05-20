from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.orm import Session

# Konfigurer SQLite-databaseforbindelse
DATABASE_URL = "sqlite:///./aiamigo.db"

# Opret database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Sessionmaker til at oprette database-sessioner
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klasse for modeller
Base = declarative_base()

# Metadata til database
metadata = MetaData()

# Dependency til at få en database-session
def get_db() -> Session:
    """
    Dependency til at få en database-session.
    Sørger for at lukke forbindelsen korrekt efter brug.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Rettet metode til at lukke forbindelsen