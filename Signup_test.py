from supabase import create_client
from flask import Flask, request, jsonify
import os
import random

app = Flask(__name__)

supabase_URL = "https://aycgaggcginkdlbwskgg.supabase.co"
supabase_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"

supabase_client = create_client(supabase_URL, supabase_KEY)

@app.route('/signup', methods=['POST'])
def sign_up():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    existing_user = supabase_client.table("users").select("*").eq("email", email).execute()
    if existing_user.data:
        return jsonify({"error": "Email already exists"}), 400
    
    auth_response = supabase_client.auth.sign_up({"email": email, "password": password})
    if "error" in auth_response:
        return jsonify({"error": "Sign-up failed"}), 400
    
    user_id = auth_response["user"]["id"]
    supabase_client.table("users").insert({"user_id": user_id, "email": email, "role": None, "house_id": None}).execute()
    
    return jsonify({"success": "User registered successfully. Please choose a role."})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    auth_response = supabase_client.auth.sign_in_with_password({"email": email, "password": password})
    if "error" in auth_response:
        return jsonify({"error": "Invalid email or password"}), 400
    
    user_id = auth_response["user"]["id"]
    user_data = supabase_client.table("users").select("*").eq("user_id", user_id).execute()
    
    if not user_data.data:
        return jsonify({"error": "User not found"}), 400
    
    return jsonify({"success": "Login successful", "user": user_data.data[0]})

@app.route('/logout', methods=['POST'])
def logout():
    response = supabase_client.auth.sign_out()
    if "error" in response:
        return jsonify({"error": "Logout failed"}), 400
    return jsonify({"success": "User logged out successfully"})

@app.route('/create_house', methods=['POST'])
def create_house():
    data = request.json
    manager_id = data.get("manager_id")
    house_name = data.get("house_name")
    
    user_data = supabase_client.table("users").select("role").eq("user_id", manager_id).execute()
    if not user_data.data or user_data.data[0]["role"] != "Home Manager":
        return jsonify({"error": "Only Home Managers can create a house"}), 403
    
    house_id = f"H-{random.randint(1000, 9999)}"
    supabase_client.table("houses").insert({"house_id": house_id, "owner_id": manager_id, "house_name": house_name}).execute()
    supabase_client.table("users").update({"house_id": house_id}).eq("user_id", manager_id).execute()
    
    return jsonify({"success": "House created successfully", "house_id": house_id})

if __name__ == '__main__':
    app.run(debug=True)
