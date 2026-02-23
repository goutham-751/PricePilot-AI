from db.supabase_client import supabase

data = {
    "name": "iPhone 15",
    "category": "smartphones",
    "base_price": 800
}

response = supabase.table("products").insert(data).execute()

print(response)
