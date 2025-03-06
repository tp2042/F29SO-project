from supabase import create_client
from flask import Flask, request, jsonify
import os
import random

# Initialize Flask app
app = Flask(__name__)

# Supabase credentials
supabase_URL = "https://aycgaggcginkdlbwskgg.supabase.co"  # Replace with your actual Supabase URL
supabase_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"  # Replace with your actual Supabase API Key

# Initialize the Supabase client
supabase = create_client(supabase_URL, supabase_KEY)

# SIGNUP FUNCTION
def sign_up(email: str, password: str):
    """Registers a new user with email and password."""
    # Check if the email is already registered
    existing_user = supabase.table("users").select("*").eq("email", email).execute()
    if existing_user.data:
        return {"error": "Email already exists"}

    # Sign up the user in Supabase authentication
    auth_response = supabase.auth.sign_up({"email": email, "password": password})

    if "error" in auth_response:
        return {"error": "Sign-up failed"}

    # Get user ID and store in database
    user_id = auth_response["user"]["id"]
    supabase.table("users").insert({"user_id": user_id, "email": email, "role": None, "house_id": None}).execute()

    return {"success": "User registered successfully. Please choose a role (Home Manager or Home User)"}

# LOGIN FUNCTION
def login(email: str, password: str):
    """Logs in a user and retrieves their role and house details."""
    # Authenticate the user
    auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})

    if "error" in auth_response:
        return {"error": "Invalid email or password"}

    # Retrieve user details from the database
    user_id = auth_response["user"]["id"]
    user_data = supabase.table("users").select("*").eq("user_id", user_id).execute()

    if not user_data.data:
        return {"error": "User not found"}

    user_info = user_data.data[0]
    role = user_info["role"]
    house_id = user_info["house_id"]

    # Fetch house details if the user is in a house
    houses = []
    if house_id:
        house_data = supabase.table("houses").select("*").eq("house_id", house_id).execute()
        houses = house_data.data

    return {
        "success": "Login successful",
        "user_id": user_id,
        "role": role,
        "house_id": house_id,
        "houses": houses
    }

# USER LOGOUT
def logout():
    """Logs out the current user."""
    response = supabase.auth.sign_out()
    
    if "error" in response:
        return {"error": "Logout failed"}
    
    return {"success": "User logged out successfully"}

# RESET PASSWORD
def reset_password(email: str):
    """Sends a password reset email."""
    response = supabase.auth.reset_password_for_email(email)

    if "error" in response:
        return {"error": "Failed to send reset email"}

    return {"success": "Password reset email sent"}

# UPDATE ACCOUNT
def update_account(user_id: str, new_email: str = None, new_password: str = None):
    """Updates the user's email or password."""
    update_data = {}
    if new_email:
        update_data["email"] = new_email
    if new_password:
        update_data["password"] = new_password

    if not update_data:
        return {"error": "No updates provided"}

    response = supabase.auth.update_user(update_data)

    if "error" in response:
        return {"error": "Failed to update account"}

    return {"success": "Account updated successfully"}

# DELETE ACCOUNT
def delete_account(user_id: str):
    """Deletes a user from the database and authentication system."""
    # Delete from authentication
    response = supabase.auth.admin.delete_user(user_id)

    if "error" in response:
        return {"error": "Failed to delete account"}

    # Delete user from database
    supabase.table("users").delete().eq("user_id", user_id).execute()

    return {"success": "Account deleted successfully"}

# CHOOSING ROLE
def choose_role(user_id: str, role: str):
    """Sets the user's role."""
    if role not in ["Home Manager", "Home User"]:
        return {"error": "Invalid role"}

    response = supabase.table("users").update({"role": role}).eq("user_id", user_id).execute()

    return {"success": f"Role set to {role}"}

# CREATE HOUSE
def create_house(manager_id: str, house_name: str):
    """Creates a house and assigns a unique ID."""
    # Ensure the user is a Home Manager
    user_data = supabase.table("users").select("role").eq("user_id", manager_id).execute()
    if not user_data.data or user_data.data[0]["role"] != "Home Manager":
        return {"error": "Only Home Managers can create a house"}

    # Generate a unique house ID
    house_id = f"H-{random.randint(1000, 9999)}"

    # Insert house data
    supabase.table("houses").insert({"house_id": house_id, "owner_id": manager_id, "house_name": house_name}).execute()

    # Create default rooms
    default_rooms = [
        {"house_id": house_id, "room_name": "Living Room"},
        {"house_id": house_id, "room_name": "Kitchen"},
        {"house_id": house_id, "room_name": "Bedroom"}
    ]
    supabase.table("rooms").insert(default_rooms).execute()

    # Update user's house ID
    supabase.table("users").update({"house_id": house_id}).eq("user_id", manager_id).execute()

    return {"success": "House created successfully", "house_id": house_id}

# JOIN HOUSE
def join_house(user_id: str, house_id: str):
    """Allows a Home User to join an existing house."""
    # Ensure house exists
    house = supabase.table("houses").select("*").eq("house_id", house_id).execute()
    if not house.data:
        return {"error": "Invalid house ID"}

    # Update user's house ID
    response = supabase.table("users").update({"house_id": house_id}).eq("user_id", user_id).execute()

    return {"success": "Successfully joined the house"}

if __name__ == "__main__":
    app.run(debug=True)
