from supabase import create_client
import os
import random

supabase_URL = "https://aycgaggcginkdlbwskgg.supabase.co"
supabase_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"

response = create_client(supabase_URL, supabase_KEY)

def sign_up(email: str, password: str):
    #Registers a new user without assigning a role yet.
    supabase = create_client(supabase_URL, supabase_KEY)

    # Check if email already exists
    existing_user = supabase.table("users").select("email").eq("email", email).execute()
    if existing_user.data:
        return {"status": "error", "message": "Email already exists."}

    # Create user account
    response = supabase.auth.sign_up({"email": email, "password": password})
    if "error" in response:
        return {"status": "error", "message": "Registration failed."}

    user_id = response.user.id

    # Save user in DB without a role yet
    user_data = {"id": user_id, "email": email, "role": None, "house_id": None}
    supabase.table("users").insert(user_data).execute()

    return {"status": "success", "message": "Signup successful. Choose a role next.", "user_id": user_id}

def choose_role(user_id: str, role: str):
    """Allows the user to choose their role (Home Manager or Home User)."""
    supabase = create_client(supabase_URL, supabase_KEY)

    if role not in ["Home Manager", "Home User"]:
        return {"status": "error", "message": "Invalid role selected."}

    # Update user role
    response = supabase.table("users").update({"role": role}).eq("id", user_id).execute()

    return {"status": "success", "message": f"Role set to {role}.", "role": role}

def create_house(manager_id: str, house_name: str):
    """Creates a new house with a random unique ID for a Home Manager."""
    supabase = create_client(supabase_URL, supabase_KEY)

    # Ensure user is a Home Manager
    user = supabase.table("users").select("role").eq("id", manager_id).execute()
    if not user.data or user.data[0]["role"] != "Home Manager":
        return {"status": "error", "message": "Only Home Managers can create a house."}

    # Generate a new unique house ID
    house_id = generate_unique_house_id()

    # Insert new house into DB
    house_data = {"house_id": house_id, "owner_id": manager_id, "house_name": house_name}
    supabase.table("houses").insert(house_data).execute()

    # Update Home Manager's house_id in DB
    supabase.table("users").update({"house_id": house_id}).eq("id", manager_id).execute()

    return {"status": "success", "message": "House created successfully.", "house_id": house_id}


def generate_unique_house_id():
    """Generates a unique H-ID for a house."""
    while True:
        house_id = f"H-{random.randint(1000, 9999)}"
        existing_house = supabase.table("houses").select("house_id").eq("house_id", house_id).execute()
        if not existing_house.data:
            return house_id

def join_house(user_id: str, house_id: str):
    """Allows a Home User to join an existing house using a valid H-ID."""
    supabase = create_client(supabase_URL, supabase_KEY)

    # Ensure house exists
    house = supabase.table("houses").select("house_id").eq("house_id", house_id).execute()
    if not house.data:
        return {"status": "error", "message": "Invalid house ID."}

    # Update user with the house ID
    response = supabase.table("users").update({"house_id": house_id}).eq("id", user_id).execute()

    return {"status": "success", "message": "Successfully joined the house."}


response = sign_up("tushithaprakash@gmail.com", "mypassword123", 19)
print(response)




