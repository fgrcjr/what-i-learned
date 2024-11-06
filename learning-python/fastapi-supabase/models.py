from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum as PyEnum

Base = declarative_base()

class TransactionType(PyEnum):
    income = 0
    expense = 1

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(Integer, nullable=False)  # Store as Integer (0 for income, 1 for expense)
    date = Column(Date, nullable=False)

    @property
    def category_enum(self):
        return TransactionType(self.category)
