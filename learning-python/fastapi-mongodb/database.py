import motor.motor_asyncio
from bson import ObjectId

# MongoDB Connection
MONGO_DATABASE = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DATABASE)
database = client.financial_tracker

# Collections
user_collection = database.get_collection("users")
account_collection = database.get_collection("accounts")
category_collection = database.get_collection("categories")
transaction_collection = database.get_collection("transactions")
budget_collection = database.get_collection("budgets")

# Convert BSON to JSON
def user_helper(user) -> dict:
    return{
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "created_at": user["created_at"],
    }