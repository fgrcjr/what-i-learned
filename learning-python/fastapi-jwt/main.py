from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

# Secret key to encode and decode JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_content = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2PasswordBearer scheme used for token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")