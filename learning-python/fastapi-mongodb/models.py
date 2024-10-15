from pydantic import BaseModel, EmailStr, Field
from decimal import Decimal
from typing import Optional
from datetime import datetime, date
from enum import Enum

class AccountType(str, Enum):
    savings = "Savings"
    credit_card = "Credit Card"
    e_wallet = "E-Wallet"
    debit_card = "Debit Card"

class TransactionType(str, Enum):
    bills = "Bills Payment"
    grocery = "Grocery"
    utilities = "Utilities"
    game_purchase = "Game Purchases"

class CategoryType(str, Enum):
    income = "Income"
    expense = "Expense"
    
# 1. User Model
class User(BaseModel):
    username: str
    email: EmailStr | None = Field(default=None)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.now)

# 2. Account Model    
class Account(BaseModel):
    user_id: str
    account_name: str
    account_type: AccountType
    balance: float
    created_at: datetime = Field(default_factory=datetime.now)
    
# 3. Category Model
class Category(BaseModel):
    user_id: str
    category_name: str
    category_type: CategoryType
    
# 4. Transaction Model
class Transaction(BaseModel):
    user_id: str
    account_id: str
    category_id: str
    amount: float
    transaction_type: TransactionType
    transaction_date: date
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
# 5. Budget Model
class Budget(BaseModel):
    user_id: str
    category_id: str
    amount: Decimal = Field(..., max_digits=10, decimal_places=2) 