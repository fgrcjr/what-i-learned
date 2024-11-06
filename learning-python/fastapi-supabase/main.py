from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from enum import Enum
from datetime import date

from database import SessionLocal, engine
import models

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TransactionType(int, Enum):
    income = 0
    expense = 1

# Pydantic models for request/response
class TransactionCreate(BaseModel):
    category: TransactionType
    amount: float
    description: str
    date: date

class TransactionOut(BaseModel):
    id: int
    category: TransactionType
    amount: float
    description: str
    date: date

    class Config:
        from_attributes = True

@app.post("/transactions/", response_model=TransactionOut)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[TransactionOut])
def read_transactions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).offset(skip).limit(limit).all()
    return transactions

@app.get("/balance/")
def get_balance(db: Session = Depends(get_db)):
    income = db.query(models.Transaction).filter(models.Transaction.category == TransactionType.income).all()
    expense = db.query(models.Transaction).filter(models.Transaction.category == TransactionType.expense).all()
    total_income = sum([tran.amount for tran in income])
    total_expense = sum([tran.amount for tran in expense])
    return {"balance": total_income - total_expense}
