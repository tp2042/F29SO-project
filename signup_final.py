from supabase import create_client, Client
from flask import Flask, request, jsonify
import os
import random
import uuid

app = Flask(__name__)

supabase_url = "https://aycgaggcginkdlbwskgg.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"

supabase_client = create_client(supabase_url, supabase_key)

# SIGNUP FUNCTION
def sign_up(email: str, password: str, date_of_birth: str, role: str, name: str, gender: str):
    """Registers a new user with email, password, date of birth, name, gender, and role."""
    # Step 1: Authenticate user with Supabase
    try:
        auth_response = supabase_client.auth.sign_up({"email": email, "password": password})
        print("Auth Response:", auth_response)
        user_uuid = auth_response.user.id
    except Exception as e:
        print("Sign-up Exception:", str(e))
        return {"error": f"Sign-up failed: {str(e)}"}

    # Step 2: Insert user details into the `users` table
    try:
        supabase_client.table("users").insert({
            "user_uuid": user_uuid,
            "email": email,
            "user_role": role,  # Enum value (e.g., "Home_User", "Home_Manager")
            "house_id": None,
            "date_of_birth": date_of_birth,
            "name": name,
            "gender": gender
        }).execute()
    except Exception as e:
        print("Database Insertion Exception:", str(e))
        return {"error": f"Failed to save user details: {str(e)}"}

    return {"success": "User registered successfully"}


@app.route('/register', methods=['POST'])
def register():
    """Handles user registration."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    date_of_birth = data.get('date_of_birth')
    role = data.get('role')  # Role selected via frontend (e.g., "Home_User" or "Home_Manager")
    name = data.get('name')  # Name provided during registration
    gender = data.get('gender')  # Gender provided during registration

    response = sign_up(email, password, date_of_birth, role, name, gender)
    return jsonify(response)


 

# LOGIN FUNCTION
def login(email: str, password: str):
    """Logs in a user and retrieves their role and house details."""
    print("Attempting to log in with email:", email)

    try:
        # Authenticate using Supabase
        auth_response = supabase_client.auth.sign_in_with_password({"email": email, "password": password})
        user_uuid = auth_response.user.id  # Get the user UUID from the auth response
    except Exception as e:
        print("Exception during login:", str(e))
        return {"error": "Invalid login credentials"}

    # Fetch additional user data from the `users` table
    user_data = supabase_client.table("users").select("*").eq("user_uuid", user_uuid).execute()
    if not user_data.data:
        return {"error": "User not found in database"}

    user_info = user_data.data[0]
    role = user_info["user_role"]
    house_id = user_info["house_id"]

    # Fetch the user's associated house details, if any
    houses = []
    if house_id:
        house_data = supabase_client.table("houses").select("*").eq("house_id", house_id).execute()
        houses = house_data.data

    return {
        "success": "Login successful",
        "user_uuid": user_uuid,
        "role": role,
        "house_id": house_id,
        "houses": houses
    }


@app.route('/login', methods=['POST'])
def login_route():
    """Handles user login."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    response = login(email, password)
    return jsonify(response)


# LOGOUT FUNCTION
def logout():
    """Logs out the current user."""
    response = supabase_client.auth.sign_out()
    
    if hasattr(response, 'error'):
        return {"error": "Logout failed"}
    
    return {"success": "User logged out successfully"}

@app.route('/logout', methods=['POST'])
def logout_route():
    response = logout()
    return jsonify(response)

# RESET PASSWORD FUNCTION
def reset_password(email: str):
    """Sends a password reset email."""
    response = supabase_client.auth.reset_password_for_email(email)

    if hasattr(response, 'error'):
        return {"error": "Failed to send reset email"}

    return {"success": "Password reset email sent"}

@app.route('/reset_password', methods=['POST'])
def reset_password_route():
    data = request.get_json()
    email = data.get('email')
    response = reset_password(email)
    return jsonify(response)

def update_account(user_uuid: str, new_name: str):
    """Updates the user's name."""
    if not new_name:
        return {"error": "No updates provided"}

    # Update the user's name in the `users` table
    supabase_client.table("users").update({"name": new_name}).eq("user_uuid", user_uuid).execute()

    return {"success": "Name updated successfully"}


@app.route('/update_account', methods=['PUT'])
def update_account_route():
    data = request.get_json()
    user_uuid = data.get('user_uuid')
    new_name = data.get('new_name')  # Get new_name from request data
    response = update_account(user_uuid, new_name)
    return jsonify(response)


# DELETE ACCOUNT FUNCTION
def delete_account(user_uuid: str):
    """Deletes a user from the database and authentication system."""
    response = supabase_client.auth.admin.delete_user(user_uuid)

    if hasattr(response, 'error'):
        return {"error": "Failed to delete account"}

    supabase_client.table("users").delete().eq("user_uuid", user_uuid).execute()

    return {"success": "Account deleted successfully"}

@app.route('/delete_account', methods=['DELETE'])
def delete_account_route():
    data = request.get_json()
    user_uuid = data.get('user_uuid')
    response = delete_account(user_uuid)
    return jsonify(response)

@app.route('/create_house', methods=['POST'])
def create_house_route():
    data = request.get_json()
    manager_uuid = data.get('manager_id')
    house_name = data.get('house_name')
    
    print("Received manager_uuid:", manager_uuid)
    print("Received house_name:", house_name)
    
    response = create_house(manager_uuid, house_name)
    return jsonify(response)

# CREATE HOUSE FUNCTION
def create_house(manager_uuid: str, house_name: str):
    """Creates a house, assigns a unique ID, and adds 3 default rooms."""
    user_data = supabase_client.table("users").select("role").eq("user_uuid", manager_uuid).execute()
    if not user_data.data or user_data.data[0]["role"] != "Home Manager":
        return {"error": "Only Home Managers can create a house"}

    house_id = str(uuid.uuid4())

    supabase_client.table("houses").insert({"house_id": house_id, "owner_id": manager_uuid, "house_name": house_name}).execute()
    supabase_client.table("users").update({"house_id": house_id}).eq("user_uuid", manager_uuid).execute()

    # Adding 3 default rooms to the house
    rooms = [
        {"room_id": str(uuid.uuid4()), "house_id": house_id, "room_name": "Living Room"},
        {"room_id": str(uuid.uuid4()), "house_id": house_id, "room_name": "Kitchen"},
        {"room_id": str(uuid.uuid4()), "house_id": house_id, "room_name": "Bedroom"}
    ]

    for room in rooms:
        supabase_client.table("rooms").insert(room).execute()

    return {"success": "House created successfully with default rooms", "house_id": house_id}


@app.route('/join_house', methods=['POST'])
def join_house_route():
    data = request.get_json()
    user_uuid = data.get('user_id')
    h_id = data.get('house_id')  

    print("Received user_uuid:", user_uuid)
    print("Received h_id:", h_id)
    
    response = join_house(user_uuid, h_id)
    return jsonify(response)

# JOIN HOUSE FUNCTION
def join_house(user_uuid: str, h_id: str):
    """Allows a Home User to join an existing household."""
    household = supabase_client.table("households").select("*").eq("h_id", h_id).execute()  
    
    if not household.data:
        return {"error": "Invalid household ID"}

    response = supabase_client.table("users").update({"house_id": h_id}).eq("user_uuid", user_uuid).execute()

    return {"success": "Successfully joined the household"}




if __name__ == '__main__':
    app.run(debug=True)
