from fastapi import FastAPI, HTTPException, Depends
from models import User, Account, Category, Transaction, Budget
from crud import create_user, get_users, get_user, delete_user

app = FastAPI()

@app.post("/users/", response_model=User)
async def create_new_user(user: User):
    new_user = await create_user(user.model_dump())
    if new_user:
        return new_user
    raise HTTPException(status_code=400, detail="User could not be created.")

@app.get("/users/")
async def get_all_users():
    users = await get_users()
    return users

@app.get("/users/{id}/")
async def get_user_id(id: str):
    user = await get_user(id)
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found.")

@app.delete("/users/{id}/")
async def remove_user(id: str):
    result = await delete_user(id)
    if result:
        return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")