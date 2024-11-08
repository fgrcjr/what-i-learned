from fastapi import FastAPI, status, HTTPException
from decouple import config
from supabase import create_client, Client
from pydantic import BaseModel

url = config("SUPABASE_URL")
key = config("SUPABASE_KEY")

app = FastAPI()
supabase: Client = create_client(url, key)

# Schema
class BudgetSchema(BaseModel):
    budget_type: str
    category: str
    description: str
    
# End points
## Display all sources
@app.get("/lists/")
def get_budget_sources():
    try:
        response = supabase.table('budget_source').select('*').execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Error retrieving data")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

## Display one source
@app.get("/lists/{id}")
def get_budget_source(id: int):
    try:
        response = supabase.table('budget_source').select("*").eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Income source not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

## Create Entry
@app.post("/add/", status_code=status.HTTP_201_CREATED)
def create_income_source(budget_source: BudgetSchema):
    try:
        response = supabase.table('budget_source').insert({
            "budget_type": budget_source.budget_type,
            "category": budget_source.category,
            "description": budget_source.description
        }).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Error creating data")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
## Deactivate Income source
@app.post("/lists/deactivate/{id}", status_code=status.HTTP_200_OK)
def deactivate_budget_source(id: int):
    try:
        response = supabase.table('budget_source').update({
            "is_active": False
        }).eq("id", id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Budget source not found or could not be updated")
        return {"message": "Income source deactivated successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
