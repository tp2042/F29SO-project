from supabase import create_client, Client
import os
import tkinter as tk
import random
import flask as flask

supabase_URL = "https://aycgaggcginkdlbwskgg.supabase.co"
supabase_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"

import random
 
def login(email: str, password: str):
    #Logs in a user and shows houses based on their role.
    supabase = create_client(supabase_URL, supabase_KEY)

    response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    if response is None or "error" in response:
        return {"status": "error", "message": "Login failed."}

    user_id = response.user.id

    # Fetch user details
    user_data = supabase.table("users").select("role", "house_id").eq("id", user_id).execute()
    if not user_data.data:
        return {"status": "error", "message": "User not found."}

    role = user_data.data[0]["role"]
    house_id = user_data.data[0]["house_id"]

    if role == "Home Manager":
        houses = supabase.table("houses").select("*").eq("owner_id", user_id).execute()
        return {"status": "success", "role": role, "houses": houses.data}

    elif role == "Home User":
        houses = supabase.table("houses").select("*").eq("house_id", house_id).execute()
        return {"status": "success", "role": role, "houses": houses.data}

    return {"status": "error", "message": "Unexpected error."}


