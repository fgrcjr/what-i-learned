from pydantic import BaseModel
from enum import Enum

class TransactionType(str, Enum):
    income = "Income"
    expense = "Expense"

class TransactionCreate(BaseModel):
    type: TransactionType
    amount: float
    description: str
    date: str  # Date stored as a string


class TransactionResponse(BaseModel):
    id: int
    type: TransactionType
    amount: float
    description: str
    date: str