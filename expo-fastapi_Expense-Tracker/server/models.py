# models.py
from sqlalchemy import Column, Integer, String, Float, Enum
from database import Base
import enum


class TransactionType(enum.Enum):
    income = "Income"
    expense = "Expense"


class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(String, nullable=False)