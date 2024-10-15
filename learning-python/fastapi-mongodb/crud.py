from database import user_collection, account_collection, category_collection, transaction_collection, budget_collection, user_helper
from bson import ObjectId

# Create new user
async def create_user(user_data: dict) -> dict:
    user = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": user.inserted_id})
    return new_user

# Get all users
async def get_users():
    users = []
    async for user in user_collection.find():
        users.append(user_helper(user))
    return users

# Get user by ID
async def get_user(id: str) -> dict:
    user = await user_collection.find_one({"_id": ObjectId(id)})
    if user:
        return user_helper(user)

# Delete user by ID
async def delete_user(id: str):
    user = await user_collection.find_one({"_id": ObjectId(id)})
    if user:
        await user_collection.delete_row({"_id": ObjectId(id)})
        return True
    return False