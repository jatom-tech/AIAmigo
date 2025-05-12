from passlib.context import CryptContext

# Opsætning af password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    """
    Hash en plaintext adgangskode.
    """
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificer, om et plaintext-password matcher det hashed-password.
    """
    return pwd_context.verify(plain_password, hashed_password)