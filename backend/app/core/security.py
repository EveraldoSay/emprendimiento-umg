"""Utilidades de seguridad: JWT, bcrypt, OTP, Fernet."""

import random
import string
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# --- Hashing de contraseñas ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    """Genera hash bcrypt de la contraseña."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica la contraseña contra su hash."""
    return pwd_context.verify(plain, hashed)


# --- JWT ---
def create_access_token(subject: str | uuid.UUID, extra_claims: dict[str, Any] | None = None) -> str:
    """Genera un JWT de acceso con TTL de 15 minutos."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str | uuid.UUID) -> str:
    """Genera un JWT de refresco con TTL de 7 días."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decodifica y valida un JWT. Lanza JWTError si es inválido o expirado."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


# --- OTP alfanumérico ---
_OTP_ALPHABET = string.ascii_uppercase + string.digits


def generate_otp(length: int = settings.OTP_LENGTH) -> str:
    """Genera un OTP alfanumérico de uso único usando random criptográfico."""
    return "".join(random.SystemRandom().choices(_OTP_ALPHABET, k=length))


# --- Cifrado Fernet (datos sensibles en reposo) ---
_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        _fernet = Fernet(settings.FERNET_KEY.encode())
    return _fernet


def encrypt_data(plaintext: str) -> str:
    """Cifra datos sensibles con Fernet. Retorna token base64."""
    return _get_fernet().encrypt(plaintext.encode()).decode()


def decrypt_data(ciphertext: str) -> str:
    """Descifra datos cifrados con Fernet."""
    return _get_fernet().decrypt(ciphertext.encode()).decode()
