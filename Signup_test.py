from supabase import create_client
from flask import Flask, request, jsonify
import os
import random

app = Flask(__name__)

supabase_URL = "https://aycgaggcginkdlbwskgg.supabase.co"
supabase_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"
response = create_client(supabase_URL, supabase_KEY)

#SIGNUP FUNCTION
@app.route('/signup', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Call your sign_up function
    result = sign_up_user(email, password)
    return jsonify(result)

def sign_up_user(email: str, password: str):
    """Registers a new user with email and password."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    # Check if the email is already registered
    existing_user = supabase_client.table("users").select("*").eq("email", email).execute()
    if existing_user.data:
        return {"error": "Email already exists"}

    # Sign up the user in Supabase authentication
    auth_response = supabase_client.auth.sign_up({"email": email, "password": password})

    if "error" in auth_response:
        return {"error": "Sign-up failed"}

    # Get user ID and store in database
    user_id = auth_response["user"]["id"]
    supabase_client.table("users").insert({"user_id": user_id, "email": email, "role": None, "house_id": None}).execute()

    return {"success": "User registered successfully. Please choose a role (Home Manager or Home User)"}

#LOGIN FUNCTION
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Call your login function
    result = login_user(email, password)
    return jsonify(result)

def login_user(email: str, password: str):
    """Logs in a user and retrieves their role and house details."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    # Authenticate the user
    auth_response = supabase_client.auth.sign_in_with_password({"email": email, "password": password})

    if "error" in auth_response:
        return {"error": "Invalid email or password"}

    # Retrieve user details from the database
    user_id = auth_response["user"]["id"]
    user_data = supabase_client.table("users").select("*").eq("user_id", user_id).execute()

    if not user_data.data:
        return {"error": "User not found"}

    user_info = user_data.data[0]
    role = user_info["role"]
    house_id = user_info["house_id"]

    # Fetch house details if the user is in a house
    houses = []
    if house_id:
        house_data = supabase_client.table("houses").select("*").eq("house_id", house_id).execute()
        houses = house_data.data

    return {
        "success": "Login successful",
        "user_id": user_id,
        "role": role,
        "house_id": house_id,
        "houses": houses
    }

#LOGOUT FUNCTION
@app.route('/logout', methods=['POST'])
def logout():
    # Call your logout function
    result = logout_user()
    return jsonify(result)

def logout_user():
    """Logs out the current user."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)
    response = supabase_client.auth.sign_out()
    
    if "error" in response:
        return {"error": "Logout failed"}
    
    return {"success": "User logged out successfully"}

#RESET PASSWORD
@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    
    # Call your reset_password function
    result = reset_user_password(email)
    return jsonify(result)

def reset_user_password(email: str):
    """Sends a password reset email."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)
    response = supabase_client.auth.reset_password_for_email(email)

    if "error" in response:
        return {"error": "Failed to send reset email"}

    return {"success": "Password reset email sent"}

#UPDATE ACCOUNT
@app.route('/update_account', methods=['PUT'])
def update_account():
    data = request.get_json()
    user_id = data.get('user_id')
    new_email = data.get('new_email')
    new_password = data.get('new_password')
    
    # Call your update_account function
    result = update_user_account(user_id, new_email, new_password)
    return jsonify(result)

def update_user_account(user_id: str, new_email: str = None, new_password: str = None):
    """Updates the user's email or password."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    update_data = {}
    if new_email:
        update_data["email"] = new_email
    if new_password:
        update_data["password"] = new_password

    if not update_data:
        return {"error": "No updates provided"}

    response = supabase_client.auth.update_user(update_data)

    if "error" in response:
        return {"error": "Failed to update account"}

    return {"success": "Account updated successfully"}

#DELETE ACCOUNT
@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    data = request.get_json()
    user_id = data.get('user_id')
    
    # Call your delete_account function
    result = delete_user_account(user_id)
    return jsonify(result)

def delete_user_account(user_id: str):
    """Deletes a user from the database and authentication system."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    # Delete from authentication
    response = supabase_client.auth.admin.delete_user(user_id)

    if "error" in response:
        return {"error": "Failed to delete account"}

    # Delete user from database
    supabase_client.table("users").delete().eq("user_id", user_id).execute()

    return {"success": "Account deleted successfully"}

#CHOOSING ROLE
@app.route('/choose_role', methods=['POST'])
def choose_role():
    data = request.get_json()
    user_id = data.get('user_id')
    role = data.get('role')
    
    # Call your choose_role function
    result = choose_user_role(user_id, role)
    return jsonify(result)

def choose_user_role(user_id: str, role: str):
    """Sets the user's role."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    if role not in ["Home Manager", "Home User"]:
        return {"error": "Invalid role"}

    response = supabase_client.table("users").update({"role": role}).eq("user_id", user_id).execute()

    return {"success": f"Role set to {role}"}

#CREATE HOUSE
@app.route('/create_house', methods=['POST'])
def create_house():
    data = request.get_json()
    manager_id = data.get('manager_id')
    house_name = data.get('house_name')
    
    # Call your create_house function
    result = create_new_house(manager_id, house_name)
    return jsonify(result)

def create_new_house(manager_id: str, house_name: str):
    """Creates a house and assigns a unique ID."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    # Ensure the user is a Home Manager
    user_data = supabase_client.table("users").select("role").eq("user_id", manager_id).execute()
    if not user_data.data or user_data.data[0]["role"] != "Home Manager":
        return {"error": "Only Home Managers can create a house"}

    # Generate a unique house ID
    house_id = f"H-{random.randint(1000, 9999)}"

    # Insert house data
    supabase_client.table("houses").insert({"house_id": house_id, "owner_id": manager_id, "house_name": house_name}).execute()

    # Update user's house ID
    supabase_client.table("users").update({"house_id": house_id}).eq("user_id", manager_id).execute()

    return {"success": "House created successfully", "house_id": house_id}

#JOIN HOUSE
@app.route('/join_house', methods=['POST'])
def join_house():
    data = request.get_json()
    user_id = data.get('user_id')
    house_id = data.get('house_id')
    
    # Call your join_house function
    result = join_existing_house(user_id, house_id)
    return jsonify(result)

def join_existing_house(user_id: str, house_id: str):
    """Allows a Home User to join an existing house."""
    supabase_client = supabase.create_client(supabase_URL, supabase_KEY)

    # Ensure house exists
    house = supabase_client.table("houses").select("*").eq("house_id", house_id).execute()
    if not house.data:
        return {"error": "Invalid house ID"}

    # Update user's house ID
    response = supabase_client.table("users").update({"house_id": house_id}).eq("user_id", user_id).execute()

    return {"success": "Successfully joined the house"}

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
