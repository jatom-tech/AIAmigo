from passlib.context import CryptContext

# Skriv dit ønskede kodeord her:
password = "test123"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash = pwd_context.hash(password)
print(f"Brug dette hash i din database:\n{hash}")