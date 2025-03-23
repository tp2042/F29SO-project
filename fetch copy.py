from supabase import create_client, Client
from flask import Flask, request, jsonify, send_file
import requests
from requests.exceptions import HTTPError, ConnectionError, Timeout, RequestException
import os
import random
import uuid
import os
import random
from datetime import datetime, timedelta
import io
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import matplotlib.pyplot as plt
plt.switch_backend('Agg')
from matplotlib import rcParams
import io
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from matplotlib import rcParams

from flask_cors import CORS

app = Flask(__name__)
CORS(app)


supabase_url = "https://aycgaggcginkdlbwskgg.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk1NjU2NCwiZXhwIjoyMDU1NTMyNTY0fQ.43_EYJrhuMq8mVUnSw4PLM7p8JBT5gMNepuABGPH1MI" 
supabase_client = create_client(supabase_url, supabase_key)



#-------------------------register----------------------------------------------------
@app.route('/register', methods=['POST'])
def register():
    """Handles user registration with email verification."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'date_of_birth', 'role', 'name', 'gender']
    for field in required_fields:
        if field not in data or not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
            
    email = data.get('email')
    password = data.get('password')
    date_of_birth = data.get('date_of_birth')
    role = data.get('role')
    name = data.get('name')
    gender = data.get('gender')
    
    try:
        # Sign up the user
        auth_response = supabase_client.auth.sign_up({
            "email": email, 
            "password": password,
        })
            
        print("Auth Response:", auth_response)
            
        # Check if we received a user object (even without a session)
        if hasattr(auth_response, 'user') and auth_response.user:
            user_uuid = auth_response.user.id
                
            try:
                # Insert user data into your database
                user_response = supabase_client.table("users").insert({
                    "user_uuid": user_uuid,
                    "email": email,
                    "user_role": role,
                    "house_id": None,
                    "date_of_birth": date_of_birth,
                    "name": name,
                    "gender": gender
                }).execute()
                
                # Get the user ID from the response
                user_id = user_response.data[0]['id']  # Assuming the ID field is named 'id'
                
                # Add entry to user_status table
                supabase_client.table("user_status").insert({
                    "user_id": user_id,
                    "is_active": False,
                    "last_login": None
                }).execute()
                    
                # Return success response
                return jsonify({
                    "success": True,
                    "message": "Registration successful! Please check your email to verify your account before logging in."
                }), 200
                    
            except Exception as db_error:
                print("Database Error:", str(db_error))
                return jsonify({"error": f"Failed to save user details: {str(db_error)}"}), 500
        else:
            print("No user object in auth response:", auth_response)
            return jsonify({"error": "Failed to create user account"}), 500
            
    except Exception as e:
        print("Registration Exception:", str(e))
        error_message = str(e).lower()
        if "already registered" in error_message or "already exists" in error_message:
            return jsonify({"error": "Email is already registered"}), 409
        else:
            return jsonify({"error": f"Registration failed: {str(e)}"}), 500
        


# LOGIN FUNCTION--------------------------------------------------------------------------------

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
    name = user_info["name"]
    user_id = user_info["id"]  # Make sure this matches your actual ID field name
    
    
    # Update user_status to active and set the last_login time
    try:
        current_time = datetime.now().isoformat()
        supabase_client.table("user_status").update({
            "is_active": True,
            "last_login": current_time
        }).eq("user_id", user_id).execute()
    except Exception as status_error:
        print("Failed to update user status:", str(status_error))
        # Continue with login even if status update fails
    
    # Fetch the user's associated house details, if any
    
    
    return {
        "success": "Login successful",
        "user_uuid": user_uuid,
        "role": role,
        "email": email,
        "name": name,
        #"house_id": house_id,
        #"household_id": household_id,
        #"houses": houses,
        'user_id': user_id
    }

@app.route('/login', methods=['POST'])
def login_route():
    """Handles user login."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    response = login(email, password)
    return jsonify(response)


# LOGOUT FUNCTION------------------------------------------------------------------------------------
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

# RESET PASSWORD FUNCTION---------------------------------------------------------------------------
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

#-----------update acc -------------------------------------------------------------------------------------
def update_account(user_id: int, new_name: str):
    """Updates the user's name."""
    if not new_name:
        return {"success": False, "error": "No updates provided"}
    
    try:
        # Update the user's name in the `users` table
        result = supabase_client.table("users").update({"name": new_name}).eq("user_id", user_id).execute()
        if result.data:
            return {"success": True, "message": "Name updated successfully"}
        else:
            return {"success": False, "error": "User not found or no changes made"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.route('/update_account', methods=['PUT'])
def update_account_route():
    data = request.get_json()
    user_id = data.get('user_id')
    new_name = data.get('new_name') # Get new_name from request data
    
    if not user_id or not new_name:
        return jsonify({"success": False, "error": "Missing required fields"})
    
    response = update_account(user_id, new_name)
    return jsonify(response)

#---------------privacy--------------------------------------------------------------------
@app.route('/update_privacy_settings', methods=['PUT'])
def update_privacy_settings_route():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        # Validate user_id is present and is an integer
        if user_id is None:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
            
        try:
            user_id = int(user_id)  # Ensure it's an integer
        except ValueError:
            return jsonify({"success": False, "message": "Invalid user ID format"}), 400
        
        # Extract privacy settings
        privacy_settings = {
            'location': data.get('location'),
            'camera': data.get('camera'),
            'bluetooth': data.get('bluetooth'),
            'notifications': data.get('notifications')
        }
        
        # Update settings and return response
        result = update_privacy_settings(user_id, privacy_settings)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def update_privacy_settings(user_id: int, settings: dict):
    """Updates the user's privacy settings."""
    if not settings:
        return {"error": "No updates provided"}
    
    update_data = {
        "location": settings.get("location"),
        "camera": settings.get("camera"),
        "bluetooth": settings.get("bluetooth"),
        "notifications": settings.get("notifications")
    }
    
    # Filter out None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    if not update_data:
        return {"error": "No valid updates provided"}
    
    # Update the user's privacy settings in the `users` table
    supabase_client.table("users").update(update_data).eq("user_id", user_id).execute()
    
    return {"success": "Privacy settings updated successfully"}

def fetch_privacy_settings(user_id: int):
    """Fetches the user's privacy settings."""
    if not user_id:
        return {"error": "User UUID is required"}
    
    # Query the users table to get the privacy settings
    response = supabase_client.table("users").select(
        "location, camera, bluetooth, notifications"
    ).eq("user_id", user_id).execute()
    
    # Check if user exists and has settings
    if not response.data or len(response.data) == 0:
        return {"error": "User not found"}
    
    # Return the settings
    settings = response.data[0]
    return {
        "success": True,
        "settings": {
            "location": settings.get("location", False),
            "camera": settings.get("camera", False),
            "bluetooth": settings.get("bluetooth", False),
            "notifications": settings.get("notifications", False)
        }
    }

@app.route('/user_settings/<user_uuid>', methods=['GET'])
def get_user_settings(user_uuid):
    response = fetch_privacy_settings(user_uuid)
    return jsonify(response)

@app.route('/delete_account', methods=['DELETE'])
def delete_account_route():
    data = request.get_json()
    user_uuid = data.get('user_uuid')
    response = delete_account(user_uuid)
    return jsonify(response)



# DELETE ACCOUNT FUNCTION-------------------------------------------------------------------
def delete_account(user_uuid: str):
    """Deletes a user from the database and authentication system."""
    response = supabase_client.auth.admin.delete_user(user_uuid)

    if hasattr(response, 'error'):
        return {"error": "Failed to delete account"}

    supabase_client.table("users").delete().eq("user_id", user_id).execute()

    return {"success": "Account deleted successfully"}

#get rooms----------------------------------------------------------------------------------
@app.route('/rooms/<household_id>', methods=['GET'])
def fetch_rooms(household_id):
    try:
        print(f"Fetching rooms for household ID: {household_id}")
        
        if not household_id:
            return jsonify({"Error": "household_id is required"}), 400
        
        # Select both room_id and room_name
        response = supabase_client.table("rooms").select("room_id, room_name").eq("household_id", household_id).execute()
        
        print(f"Supabase response: {response}")
        print(f"Response data: {response.data}")
        
        if not response.data:
            print("No rooms found for this household")
            return jsonify({"rooms": []}), 200  # Return empty list instead of 404
        
        # Return list of dictionaries with both room_id and room_name
        rooms = [{"id": room["room_id"], "name": room["room_name"]} for room in response.data]
        print(f"Formatted rooms: {rooms}")
        
        return jsonify({"rooms": rooms}), 200
    except Exception as e:
        print(f"Error in fetch_rooms: {str(e)}")
        return jsonify({"Error": str(e)}), 500

#--------------------------------- ADD ROOM ------------------------------------------#
import traceback

@app.route('/add_room', methods=['POST'])
def add_room():
    try:
        # Extract JSON data from the request
        data = request.json
        household_id = data.get("household_id")
        room_id = int(data.get("room_id"))
        room_name = data.get("room_name")

        # Ensure required fields are provided
        if not household_id or not room_id or not room_name:
            return jsonify({"Room Addition": "Failed", "Error": "room_name, room_id and household_id haven't been provided"}), 400

        # Insert the room into the database
        response = supabase_client.table("rooms").insert({
            "household_id": household_id,
            "room_id": room_id,
            "room_name": room_name,
        }).execute()

        # Check if the insertion was successful
        if response.data:
            return jsonify({"Room Data": "Addition Successful", "Room": response.data}), 200
        else:
            return jsonify({"Room Data": "Addition Failed", "Error": response.error}), 500

    except Exception as e:
        print("Exception occurred:", e)
        traceback.print_exc()  # This prints the full error traceback in the logs
        return jsonify({"Error": str(e)}), 500
#-------------------------------------------------------------------------------------------#


#-------------------------------- DELETE ROOM (DELETE) -------------------------------------#

@app.route('/delete_room/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    try:
        # Attempt to delete the device with the given device_id
        response = supabase_client.table("rooms").delete().eq("room_id", room_id).execute()

        # Check if the device was found and deleted
        if response.data:
            return jsonify({"Room Deletion": "Successful"}), 200
        else:
            return jsonify({"Error": "Room not found"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500
    


# get status of all devices
@app.route('/device_status', methods=['GET'])
def get_all_device_status():
    try:
        response = supabase_client.table("device_status").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# get status of a specific device (by device_id)
@app.route('/device_status/<int:device_id>', methods=['GET'])
def get_device_status(device_id):
    try:
        response = (
            supabase.table("device_status")
            .select("*")
            .eq("device_id", device_id)
            .single()
            .execute()
        )

        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"Error":"Device not found"}), 404

#-------------------------------------------------------------------------------------------#


#--------------------------------- ADD DEVICE (POST) ---------------------------------------#

@app.route('/add_device', methods=['POST'])
def add_device():
    try:
        data = request.json  # Get JSON data from request

        # Extract data fields
        device_id = data.get("device_id")
        room_id = data.get("room_id")
        household_id = data.get("household_id")
        device_name = data.get("device_name")
        device_type = data.get("device_type")
        is_active = data.get("is_active", True)  # Default is True


        if not room_id or not household_id or not device_name:
            return jsonify({"Device Addition": "Failed", "Error": "room_id, household_id, and device_name haven't been provided"}), 404

        #insert into Supabase
        response = supabase_client.table("devices").insert({
            "device_id": device_id,
            "room_id": room_id,
            "household_id": household_id,
            "device_name": device_name,
            "device_type": device_type,
            "is_active": is_active
        }).execute()

        return jsonify({"Device Addition": "Successful", "data": response.data}), 201

    except Exception as e:
        return jsonify({"Device Addition": "Failed", "Error": str(e)}), 500  # Handle errors

#-------------------------------------------get devices------------------------------------------------#
@app.route('/devices', methods=['GET'])
def fetch_devices():
    try:
        room_id = request.args.get('roomId')
        household_id = request.args.get('householdId')
        
        if not room_id:
            return jsonify({"error": "roomId is required"}), 400
            
        # Include household_id in the query if needed
        query = supabase_client.table("devices").select("*").eq("room_id", room_id)
        
        if household_id:
            query = query.eq("household_id", household_id)
            
        response = query.execute()
        
        if not response.data:
            return jsonify({"error": "No devices found in this room"}), 404
            
        return jsonify(response.data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
#--------------------------------- UPDATE DEVICE (PUT) -------------------------------------#

@app.route('/update_device/<int:device_id>', methods=['PUT'])
def update_device(device_id):
    try:
        # Extract JSON data from request
        data = request.json

        # Ensure there is data to update
        if not data:
            return jsonify({"Error": "No Data found"}), 400

        # Attempt to update the device
        response = supabase_client.table("devices").update(data).eq("device_id", device_id).execute()

        # Check if update was successful
        if response.data:
            return jsonify({"Device Data": "Updated Successfully", "Dpdated Data": response.data}), 200
        else:
            return jsonify({"Device Data": "Updated Unsuccessfully", "Error": "Device not found or no changes made"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------------------------------------------------------#


#-------------------------------- DELETE DEVICE (DELETE) -----------------------------------#

@app.route('/delete_device/<int:device_id>', methods=['DELETE'])
def delete_device(device_id):
    try:
        # Attempt to delete the device with the given device_id
        response = supabase_client.table("devices").delete().eq("device_id", device_id).execute()

        # Check if the device was found and deleted
        if response.data:
            return jsonify({"Device Deletion": "Successful"}), 200
        else:
            return jsonify({"Error": "Device not found"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------energy ------------------------------------------------#
from datetime import datetime, timedelta


def generate_household_energy_data(household_id):
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    random.seed(int(household_id) + int(datetime.now().strftime('%Y%m')))
    return{
        'household_id':household_id,
        'household_name': household_name,
        'energy_consumed':round(random.uniform(10,500),2),
        'energy_generated': round(random.uniform(0,200),2),
        'renewable_percentage': round(random.uniform(0,100),2),
        'carbon_emission': round(random.uniform(1,50),2),
        'recorded_at': datetime.now().isoformat()

    }

def generate_room_energy_data(room_id):
    room_response = supabase_client.table('rooms').select('room_name').eq('room_id', room_id).execute()
    room_name = room_response.data[0]['room_name'] if room_response.data else f"Room {room_id}"
    random.seed(int(room_id) + int(datetime.now().strftime('%Y%m')))
    return{
        'room_id': room_id,
        'room_name': room_name, 
        'energy_consumed': round(random.uniform(1,100),2),
        'recorded_at': datetime.now().isoformat()
    }
      

@app.route('/household_energy', methods=['GET'])
def get_household_energy():
    household_id = request.args.get('household_id')
    time_period = request.args.get('period', 'week')  # day, week, month, quarter
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int, default=50)
    
    
    # Calculate date ranges based on period
    today = datetime.now()
    if not start_date:
        if time_period == 'day':
            start_date = today.replace(hour=0, minute=0, second=0).isoformat()
            data_points = 24  # Hourly data for a day
            group_by = 'hour'
        elif time_period == 'week':
            start_date = (today - timedelta(days=7)).isoformat()
            data_points = 7  # Daily data for a week
            group_by = 'day'
        elif time_period == 'month':
            start_date = (today - timedelta(days=30)).isoformat()
            data_points = 30  # Daily data for a month
            group_by = 'day'
        elif time_period == 'quarter':
            start_date = (today - timedelta(days=90)).isoformat()
            data_points = 12  # Weekly data for 3 months
            group_by = 'week'
    
    if not end_date:
        end_date = today.isoformat()
    
    # Generate data with appropriate time intervals
    if household_id:
        random.seed(int(household_id) + int(today.strftime('%Y%m')))
        
        if group_by == 'hour':
            labels = [f"{h}:00" for h in range(24)]
            data = [generate_hourly_energy_data(household_id, h) for h in range(24)]
        elif group_by == 'day' and time_period == 'week':
            labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            data = [generate_daily_energy_data(household_id, i) for i in range(7)]
        elif group_by == 'day':
            # For month view
            days = min(30, limit)
            labels = [(today - timedelta(days=days-i-1)).strftime('%d') for i in range(days)]
            data = [generate_daily_energy_data(household_id, i) for i in range(days)]
        elif group_by == 'week':
            # For quarter view
            weeks = min(12, limit)
            labels = [f"W{i+1}" for i in range(weeks)]
            data = [generate_weekly_energy_data(household_id, i) for i in range(weeks)]
        
        response_data = {
            'labels': labels,
            'data': data,
            'household_name': get_household_name(household_id),
            'period': time_period,
            'summary': generate_summary_statistics(data)
        }
        
        return jsonify(response_data)
    
    return jsonify({'error': 'Missing required parameters'}), 400

# Helper functions for data generation
def generate_hourly_energy_data(household_id, hour):
    random.seed(int(household_id) + hour + int(datetime.now().strftime('%Y%m%d')))
    return {
        'label': f"{hour}:00",
        'usage': round(random.uniform(5, 30), 2),
        'energy_generated': round(random.uniform(0, 15), 2),
        'carbon_emission': round(random.uniform(0.5, 5), 2)
    }

def generate_daily_energy_data(household_id, day_offset):
    random.seed(int(household_id) + day_offset + int(datetime.now().strftime('%Y%m')))
    return {
        'usage': round(random.uniform(20, 50), 2),
        'energy_generated': round(random.uniform(0, 25), 2),
        'carbon_emission': round(random.uniform(1, 8), 2)
    }

def generate_weekly_energy_data(household_id, week_offset):
    random.seed(int(household_id) + week_offset + int(datetime.now().strftime('%Y')))
    return {
        'usage': round(random.uniform(100, 300), 2),
        'energy_generated': round(random.uniform(0, 150), 2),
        'carbon_emission': round(random.uniform(10, 40), 2)
    }

def generate_summary_statistics(data):
    total_usage = sum(item['usage'] for item in data)
    avg_usage = total_usage / len(data) if data else 0
    max_usage = max(item['usage'] for item in data) if data else 0
    max_day_index = next((i for i, item in enumerate(data) if item['usage'] == max_usage), 0)
    
    return {
        'total_usage': round(total_usage, 2),
        'average_usage': round(avg_usage, 2),
        'peak_day': max_day_index,
        'carbon_footprint': round(sum(item['carbon_emission'] for item in data), 2)
    }

def get_household_name(household_id):
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    return household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"

@app.route('/room_energy',methods = ['GET'])
def get_room_energy():
    room_id = request.args.get('room_id')
    household_id = request.args.get('household_id')
    room_name = request.args.get('room_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int, default = 50)
    
 
    if room_id:
        data = [generate_room_energy_data(room_id)for _ in range(limit)]

    elif household_id:
        room_response = supabase_client.table('rooms').select('room_id').eq('household_id', household_id).execute()
        room_ids = [room['room_id'] for room in  room_response.data ]
        if not room_ids:
             return jsonify({'error': 'room id not found'}), 404
        data = [generate_room_energy_data(room_id) for room_id in room_ids[:limit]]
    
    else: 
        return jsonify({'error': 'room id not found'}), 404
    
    return jsonify(data)
@app.route('/device_energy/<device_id>', methods=['GET'])
def get_device_energy(device_id):
    household_id = request.args.get('household_id')
    device_name = request.args.get('device_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int, default=50)
    
    # Try to get real data first
    try:
        query = supabase_client.table('energy_data').select('*').eq('device_id', device_id)
        
        if household_id:
            query = query.eq('household_id', household_id)
        
        if start_date and end_date:
            query = query.gte('recorded_at', start_date).lte('recorded_at', end_date)
        
        result = query.limit(limit).execute()
        if result.data and len(result.data) > 0:
            return jsonify(result.data)
    except Exception as e:
        print(f"Error querying energy data: {e}")
    
    # Fall back to generated data if no real data exists
    data = [generate_device_energy_data(device_id) for _ in range(limit)]
    return jsonify(data)

def generate_device_energy_data(device_id):
    device_response = supabase_client.table('devices').select('device_name').eq('device_id', device_id).execute()
    device_name = device_response.data[0]['device_name'] if device_response.data else f"Device {device_id}"
    random.seed(int(device_id) + int(datetime.now().strftime('%Y%m')))
    return{
        'device_id': device_id,
        'device_name': device_name,
        'energy_consumed': round(random.uniform(0.1,50),2),
        'recorded_at': datetime.now().isoformat()
    }

'''
def generate_device_energy_data(device_id):
    # Get device name from database - don't query for type anymore
    device_name = f"Device {device_id}"
    try:
        device_response = supabase_client.table('devices').select('device_name').eq('device_id', device_id).execute()
        if device_response.data and len(device_response.data) > 0:
            device_name = device_response.data[0]['device_name']
    except Exception as e:
        print(f"Error fetching device name: {e}")
    
    # Use device_id to determine device type instead of querying the database
    # This is a workaround since we don't have device type in the database
    device_type = "unknown"
    device_id_int = int(device_id) if device_id.isdigit() else hash(device_id) % 5
    
    # Assign a type based on device_id
    type_mapping = {
        0: "light",
        1: "climate",
        2: "entertainment",
        3: "power",
        4: "security"
    }
    device_type = type_mapping.get(device_id_int % 5, "unknown")
    
    # Generate energy values based on device type
    energy_ranges = {
        'light': (5, 15),
        'climate': (500, 1500),
        'entertainment': (50, 200),
        'power': (10, 50),
        'security': (1, 10),
        'unknown': (5, 20)
    }
    
    min_val, max_val = energy_ranges.get(device_type, (5, 20))
    
    # Use a more predictable seed to avoid too much randomness
    seed_value = hash(f"{device_id}:{datetime.now().strftime('%Y%m%d')}")
    random.seed(seed_value)
    
    return {
        'device_id': device_id,
        'device_name': device_name,
        'device_type': device_type,  # Include type in the response for frontend use
        'energy_consumed': round(random.uniform(min_val, max_val), 2),
        'recorded_at': datetime.now().isoformat()
    }
'''
#-------------------------------------------emood------------------------------------------------#
@app.route('/activate_mood/<int:mood_id>', methods=['POST'])
def activate_mood(mood_id):
  
    try:
        # Fetch the mood profile by mood_id
        mood_response = supabase_client.table("mood_profiles").select("*").eq("mood_id", mood_id).execute()
        
        if not mood_response.data:
            return jsonify({"Error": "Mood profile not found"}), 404
            
        mood_profile = mood_response.data[0]
        room_id = mood_profile.get("room_id")
        devices_config = mood_profile.get("devices", {})
        
        # Fetch all devices in the room
        device_response = supabase_client.table("devices").select("*").eq("room_id", room_id).execute()
        
        if not device_response.data:
            return jsonify({"Warning": "No devices found in this room"}), 200
            
        # Update each device according to the mood configuration
        for device in device_response.data:
            device_name = device.get("device_name")
            device_id = device.get("device_id")
            
            # Check if this device is configured in the mood
            if device_name in devices_config:
                # Update device state
                device_state = {"is_active": devices_config[device_name]}
                supabase_client.table("devices").update(device_state).eq("device_id", device_id).execute()
                
        return jsonify({"Mood Activation": "Successful"}), 200
        
    except Exception as e:
        print(f"Error activating mood: {str(e)}")
        return jsonify({"Error": str(e)}), 500

@app.route('/mood_profiles/<household_id>', methods=['GET'])
def fetch_mood_profiles(household_id):
    try:
        print(f"Fetching mood profiles for household ID: {household_id}")
        
        if not household_id:
            return jsonify({"Error": "household_id is required"}), 400
        
        # Get optional room_id filter from query params
        room_id = request.args.get('room_id')
        
        # Build the query
        query = supabase_client.table("mood_profiles").select("*").eq("household_id", household_id)
        
        # Add room filter if provided
        if room_id:
            query = query.eq("room_id", room_id)
            
        response = query.execute()
        print(f"Supabase response: {response}")
        
        if not response.data:
            print("No mood profiles found for this household")
            return jsonify({"mood_profiles": []}), 200  # Return empty list
            
        # Format the response data
        mood_profiles = []
        for profile in response.data:
            mood_profiles.append({
                "id": profile["mood_id"],
                "name": profile["name"],
                "color": profile["color"],
                "room_id": profile["room_id"],
                "devices": profile["devices"]
            })
            
        print(f"Formatted mood profiles: {mood_profiles}")
        return jsonify({"mood_profiles": mood_profiles}), 200
        
    except Exception as e:
        print(f"Error in fetch_mood_profiles: {str(e)}")
        return jsonify({"Error": str(e)}), 500
    
@app.route('/add_mood_profile', methods=['POST'])
def add_mood_profile():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ["household_id", "name", "color"]
        for field in required_fields:
            if field not in data:
                return jsonify({"Error": f"{field} is required"}), 400
        
        # Create the new mood profile
        new_profile = {
            "household_id": data["household_id"],
            "name": data["name"],
            "color": data["color"],
            "devices": data.get("devices", {}),  # Optional field
            "room_id": data.get("room_id")  # Optional field
        }
        
        # Insert into database
        response = supabase_client.table("mood_profiles").insert(new_profile).execute()
        
        if response.data:
            return jsonify({
                "Mood Profile": "Addition Successful",
                "mood_profile": response.data[0]
            }), 201
        else:
            return jsonify({"Error": "Failed to add mood profile"}), 500
            
    except Exception as e:
        print(f"Error in add_mood_profile: {str(e)}")
        return jsonify({"Error": str(e)}), 500
    
@app.route('/update_mood_profile/<int:mood_id>', methods=['PUT'])
def update_mood_profile(mood_id):
    try:
        data = request.json
        
        # Ensure there is data to update
        if not data:
            return jsonify({"Error": "No data provided"}), 400
            
        # Update the mood profile
        response = supabase_client.table("mood_profiles").update(data).eq("mood_id", mood_id).execute()
        
        if response.data:
            return jsonify({
                "Mood Profile": "Update Successful",
                "Updated Data": response.data[0]
            }), 200
        else:
            return jsonify({"Error": "Mood profile not found or no changes made"}), 404
            
    except Exception as e:
        print(f"Error in update_mood_profile: {str(e)}")
        return jsonify({"Error": str(e)}), 500


@app.route('/delete_mood_profile/<int:mood_id>', methods=['DELETE'])
def delete_mood_profile(mood_id):
    print(f"Received DELETE request for mood_id: {mood_id}")
    try:
        response = supabase_client.table("mood_profiles").delete().eq("mood_id", mood_id).execute()
        

        if response.data:
            return jsonify({"Mood Profile Deletion": "Successful"}), 200
        else:
            return jsonify({"Error": "Mood profile not found"}), 404
            
    except Exception as e:
        
        return jsonify({"Error": str(e)}), 500
    
#-------------------------------------------energy is-----------------------------------------------#
@app.route('/energy_insights', methods = ['GET'])
def get_energy_insights():
    household_id = request.args.get('household_id')

    if not household_id:
        return jsonify({"error: household id not found"}), 404
    household_energy_data = [generate_household_energy_data(household_id) for _ in range(10)]
    room_response = supabase_client.table('rooms').select('room_id').eq('household_id', household_id).execute()
    room_ids = [room['room_id'] for room in  room_response.data ]
    room_energy_data = [generate_room_energy_data(room_id) for room_id in room_ids[:10]]
    
    device_response = supabase_client.table('devices').select('device_id').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in  device_response.data ]
    device_energy_data = [generate_device_energy_data(device_id) for device_id in device_ids[:10]]
    


    insights = {
        'household_energy':{
            'total_records': len(household_energy_data),
            'total_energy_consumed': sum(entry.get('energy_consumed',0) for entry in household_energy_data),
            'total_energy_generated': sum(entry.get('energy_generated', 0) for entry in household_energy_data),
            'average_renewable_percentage': sum(entry.get('renewable_percentage', 0) for entry in household_energy_data)/ len(household_energy_data)

        },
        'room_energy': {
             'total_records': len(room_energy_data),
             'total_energy_consumed': sum(entry.get('energy_consumed', 0) for entry in room_energy_data)
        },
        'device_energy':{
             'total_records': len(device_energy_data),
             'total energy_consumed': sum(entry.get('energy_consumed',0) for entry in device_energy_data)
        }

    }
    

    household_energy_data = [generate_household_energy_data(household_id) for _ in range(10)]
    room_response = supabase_client.table('rooms').select('room_id').eq('household_id', household_id).execute()
    room_ids = [room['room_id'] for room in room_response.data]
    room_energy_data = [generate_room_energy_data(room_id) for room_id in room_ids[:10]]

    device_response = supabase_client.table('devices').select('device_id').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in device_response.data]
    device_energy_data = [generate_device_energy_data(device_id) for device_id in device_ids[:10]]

   
    total_household_energy = sum(entry.get('energy_consumed', 0) for entry in household_energy_data)
    total_household_generated = sum(entry.get('energy_generated', 0) for entry in household_energy_data)
    avg_renewable_percentage = (
        sum(entry.get('renewable_percentage', 0) for entry in household_energy_data) / len(household_energy_data)
        if household_energy_data else 0
    )

  
    total_room_energy = sum(entry.get('energy_consumed', 0) for entry in room_energy_data)
    total_device_energy = sum(entry.get('energy_consumed', 0) for entry in device_energy_data)

    
    insights_text = []
    if total_household_energy > 500:
        insights_text.append("High energy consumption detected. Consider optimizing usage during peak hours.")
    elif total_household_energy < 100:
        insights_text.append("Your household has low energy consumption. Good job on energy efficiency!")

    if avg_renewable_percentage > 50:
        insights_text.append("More than half of your energy comes from renewable sources. Keep it up!")
    else:
        insights_text.append("Less than 50% of your energy comes from renewable sources. Consider installing solar panels or using more green energy.")

    if total_device_energy > total_room_energy:
        insights_text.append("Devices consume more energy than rooms. Consider unplugging unused devices to save power.")

    insights = {
        'household_energy': {
            'total_records': len(household_energy_data),
            'total_energy_consumed': total_household_energy,
            'total_energy_generated': total_household_generated,
            'average_renewable_percentage': avg_renewable_percentage
        },
        'room_energy': {
            'total_records': len(room_energy_data),
            'total_energy_consumed': total_room_energy
        },
        'device_energy': {
            'total_records': len(device_energy_data),
            'total_energy_consumed': total_device_energy
        },
        'text_insights': insights_text  # Added textual insights
    }

    return jsonify(insights)
#-------------------------------------------energy report------------------------------------------------#
import random
import random
import random
import math
from datetime import datetime, timedelta

@app.route('/household_users', methods=['GET'])
def get_household_users():
    household_id = request.args.get('household_id', type=int)
    timeframe = request.args.get('timeframe', 'weekly')
    current_user_id = request.args.get('current_user_id', type=int)
    
    if not household_id:
        return jsonify({'error': 'household_id is required'}), 400
    
    # Fetch household details
    household_response = supabase_client.table('households').select('household_name, h_id').eq('household_id', household_id).execute()
    
    if not household_response.data:
        return jsonify({'error': 'Household not found'}), 404
    
    household_name = household_response.data[0]['household_name']
    h_id = household_response.data[0]['h_id']
    
    # Find all users in the household using homeuser_household
    homeuser_response = supabase_client.table('homeuser_household').select('user_id').eq('h_id', h_id).execute()
    
    if not homeuser_response.data:
        return jsonify({'household_name': household_name, 'users': []})
    
    user_ids = [user['user_id'] for user in homeuser_response.data]
    num_users_in_house = len(user_ids)  # Total people in the house for ranking
    
    # Fetch user details from users table
    users_response = supabase_client.table('users') \
    .select('user_id, name, user_pfp, user_role') \
    .in_('user_id', user_ids) \
    .eq('user_role', 'Home User') \
    .execute()

    users_data = []
    now = datetime.utcnow()

    for user in users_response.data:
        # Fetch watt points from watt_points_history
        points_query = supabase_client.table('watt_points_history').select('points_earned', 'created_at').eq('user_id', user['user_id']).eq('household_id', household_id)
        points_response = points_query.execute()

        total_points = 0

        if points_response.data:
            for entry in points_response.data:
                created_at = datetime.strptime(entry['created_at'], "%Y-%m-%dT%H:%M:%S.%fZ")
                days_old = (now - created_at).days

                # Apply time-based decay
                if timeframe == 'weekly':
                    decay_factor = math.exp(-0.1 * days_old)  # Faster decay
                elif timeframe == 'monthly':
                    decay_factor = math.exp(-0.05 * days_old)  # Slower decay
                else:
                    decay_factor = 1  # No decay for all-time

                total_points += entry['points_earned'] * decay_factor
        else:
            total_points = random.randint(50, 500)  # Random points if no history

        is_current_user = user['user_id'] == current_user_id if current_user_id else False
        users_data.append({
            'id': user['user_id'],
            'name': user['name'],
            'avatar': user['user_pfp'] or f"https://ui-avatars.com/api/?name={user['name']}&background=random",
            'role': user['user_role'],
            'points': round(total_points),  # Round for cleaner display
            'isCurrentUser': is_current_user
        })
    
    # Sort users by watt points
    users_data.sort(key=lambda x: x['points'], reverse=True)
    
    # Assign ranks based on total number of users in the house
    for i, user in enumerate(users_data, 1):
        user['rank'] = f"{i}/{num_users_in_house}"  # Example: "1/5" if 5 users in the house
    
    return jsonify({'household_name': household_name, 'users': users_data})


def generate_household_energy_data(household_id):
    """
    Generate household energy consumption data for a given household ID.
    
    Parameters:
    household_id (str): The ID of the household
    
    Returns:
    dict: A dictionary containing various energy metrics
    """
    # Seed the random generator with household_id for consistent results
    random.seed(int(household_id) + int(datetime.now().strftime('%Y%m')))
    
    # Generate base energy consumption (varies by household)
    energy_consumed = round(random.uniform(200, 400), 2)
    
    # Generate energy generated (e.g., from solar panels)
    energy_generated = round(random.uniform(50, 150), 2)
    
    # Calculate renewable percentage (both from generation and grid renewable sources)
    renewable_percentage = round(random.uniform(20, 60), 2)
    
    # Calculate carbon emission based on consumption and renewable percentage
    carbon_factor = (100 - renewable_percentage) / 100  # Higher renewables = lower carbon
    carbon_emission = round(carbon_factor * energy_consumed * 0.85, 2)  # Scaling factor
    
    # Generate daily/hourly breakdown if needed
    daily_breakdown = {
        'weekday_avg': round(energy_consumed / 30 * 5/7, 2),  # Weekday average
        'weekend_avg': round(energy_consumed / 30 * 7/7, 2)   # Weekend average
    }
    
    # Return comprehensive data structure that works for both API and report
    return {
        'household_id': household_id,
        'energy_consumed': energy_consumed,
        'energy_generated': energy_generated,
        'energy_imported': max(0, energy_consumed - energy_generated),
        'renewable_percentage': renewable_percentage,
        'carbon_emission': carbon_emission,
        'daily_breakdown': daily_breakdown,
        'timestamp': datetime.now().isoformat()
    }




plt.rcParams['font.family'] = 'Times New Roman'  

def generate_energy_graphs_page1(household_id):
    """Generate the first set of energy analysis graphs (3 graphs)"""
    
    plt.close('all')
    
    fig, axs = plt.subplots(3, 1, figsize=(20, 25)) 
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"

    current_month = datetime.now().strftime('%B %Y')
    fig.suptitle(f'Monthly Energy Analysis (Part 1) - {household_name} - {current_month}', fontsize=35)  

    # 1st graph - Energy Sources Pie Chart 
    energy_types = ['Grid', 'Renewable', 'Storage']
    energy_values = np.random.dirichlet(np.ones(3), size=1)[0]*100
    wedges, texts, autotexts = axs[0].pie(
        energy_values, 
        labels=energy_types, 
        autopct='%1.1f%%', 
        startangle=90, 
        colors=['#3498db', '#2ecc71', '#f39c12'],
    )
    axs[0].set_title('Energy Sources Distribution', fontsize=30)  
    
    renewable_pct = energy_values[1]
    if renewable_pct > 50:
        analysis = f"Great job! Renewable energy ({renewable_pct:.1f}%) is your primary source."
    elif renewable_pct > 30:
        analysis = f"Good progress. Renewable sources at {renewable_pct:.1f}%. Consider increasing further."
    else:
        analysis = f"Opportunity for improvement. Renewable sources only at {renewable_pct:.1f}%. "
    axs[0].text(0, -1.3, analysis, ha='center', va='center', fontsize=20, bbox=dict(facecolor='#f0f0f0', alpha=0.5))  

    # 2nd graph - Daily Consumption 
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    daily_consumption = np.random.uniform(10, 50, 7)
    axs[1].plot(days, daily_consumption, marker='o', color='#3498db', linewidth=3, markersize=12)
    axs[1].set_title('Daily Energy Consumption Pattern', fontsize=30)  
    axs[1].set_ylabel('Energy (kWh)', fontsize=20) 
    axs[1].tick_params(axis='both', which='major', labelsize=18)  
    axs[1].grid(True, linestyle='--', alpha=0.7)
    
    weekday_avg = np.mean(daily_consumption[:5])
    weekend_avg = np.mean(daily_consumption[5:])
    diff_pct = ((weekend_avg - weekday_avg) / weekday_avg) * 100
    
    if diff_pct > 20:
        trend_analysis = f"Weekend consumption is {diff_pct:.1f}% higher than weekdays. Consider scheduling energy-intensive activities during weekdays."
    elif diff_pct < -20:
        trend_analysis = f"Weekday consumption is {-diff_pct:.1f}% higher than weekends. Your home appears more efficient during weekends."
    else:
        trend_analysis = f"Consumption is relatively balanced throughout the week (±{abs(diff_pct):.1f}%)."
    
    axs[1].text(0.5, -0.2, trend_analysis, ha='center', va='center', transform=axs[1].transAxes, fontsize=20, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 3rd graph - Carbon Emissions by devices 
    device_response = supabase_client.table('devices').select('device_id', 'device_name').eq('household_id', household_id).execute()
    device_names = [device['device_name'] for device in device_response.data]
    additional_sources = ['Heating', 'Cooling', 'Lighting', 'Cooking', 'Water Heating']
    sources = device_names + additional_sources
    emissions = np.random.uniform(5, 30, len(sources))
    
    sorted_indices = np.argsort(emissions)[::-1]  
    sorted_sources = [sources[i] for i in sorted_indices]
    sorted_emissions = [emissions[i] for i in sorted_indices]
    
    colors = plt.cm.viridis(np.linspace(0, 0.8, len(sorted_sources)))
    bars = axs[2].bar(sorted_sources, sorted_emissions, color=colors)
    axs[2].set_title('Carbon Emission by Sources', fontsize=30) 
    axs[2].set_ylabel('CO2 (kg)', fontsize=20) 
    axs[2].tick_params(axis='x', rotation=45, labelsize=18)  
    axs[2].tick_params(axis='y', labelsize=18) 
    
    for bar in bars:
        height = bar.get_height()
        axs[2].text(bar.get_x() + bar.get_width()/2., height, f'{height:.1f}', ha='center', va='bottom', fontsize=16)  
    
    top_emitter = sorted_sources[0]
    top_emission = sorted_emissions[0]
    total_emission = sum(sorted_emissions)
    axs[2].text(0.5, -0.3, f"Highest emission source: {top_emitter} ({top_emission:.1f}kg, {top_emission/total_emission*100:.1f}% of total)", 
                ha='center', va='center', transform=axs[2].transAxes, fontsize=20, bbox=dict(facecolor='#f0f0f0', alpha=0.5))  # Increased fontsize

    plt.tight_layout(pad=6.0, rect=[0, 0, 1, 0.97])  
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_energy_graphs_page2(household_id):
    """Generate the second set of energy analysis graphs (3 graphs)"""
    plt.close('all')
    
    fig, axs = plt.subplots(2, 1, figsize=(30, 30))
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"

    current_month = datetime.now().strftime('%B %Y')
    fig.suptitle(f'Monthly Energy Analysis (Part 2) - {household_name} - {current_month}', fontsize=40)

    # 4th graph - Renewable Trend 
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    trend = np.cumsum(np.random.uniform(1, 5, 6))
    
    forecast_months = ['Jul', 'Aug', 'Sep']
    last_increase = trend[-1] - trend[-2]
    forecasted_trend = [trend[-1] + (i+1)*last_increase for i in range(len(forecast_months))]
    
    all_months = months + forecast_months
    all_trend = np.append(trend, forecasted_trend)
    
    axs[0].plot(months, trend, marker='o', color='#2ecc71', linewidth=3, markersize=10, label='Actual')
    axs[0].plot(forecast_months, forecasted_trend, marker='o', color='#e74c3c', linewidth=3, markersize=10, linestyle='--', label='Projected')
    
    axs[0].set_title('Renewable Energy Adoption Trend', fontsize=25)
    axs[0].set_ylabel('Renewable Energy (%)', fontsize=20)
    axs[0].tick_params(axis='both', which='major', labelsize=18)
    axs[0].grid(True, linestyle='--', alpha=0.7)
    axs[0].legend(fontsize=14)
    
    growth_rate = (trend[-1] - trend[0]) / trend[0] * 100
    if growth_rate > 30:
        future_analysis = f"Excellent renewable growth rate of {growth_rate:.1f}%. Projected to reach {forecasted_trend[-1]:.1f}% by {forecast_months[-1]}."
    elif growth_rate > 10:
        future_analysis = f"Good renewable growth rate of {growth_rate:.1f}%. Projected to reach {forecasted_trend[-1]:.1f}% by {forecast_months[-1]}."
    else:
        future_analysis = f"Slow renewable growth rate of {growth_rate:.1f}%. Consider additional renewable sources."
    
    axs[0].text(0.5, -0.2, future_analysis, ha='center', va='center', transform=axs[0].transAxes, fontsize=20, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 6th graph - Hourly Consumption Pattern
    hours = np.arange(0, 24)
    hourly_pattern = 15 + 10 * np.sin((hours - 6) * np.pi / 12)  
    hourly_pattern += np.random.normal(0, 2, 24) 
    
    axs[1].plot(hours, hourly_pattern, '-', color='#9b59b6', linewidth=3)
    axs[1].fill_between(hours, 0, hourly_pattern, alpha=0.3, color='#9b59b6')
    axs[1].set_title('24-Hour Energy Consumption Pattern', fontsize=25)
    axs[1].set_xlabel('Hour of Day', fontsize=16)
    axs[1].set_ylabel('Energy Consumption (kWh)', fontsize=20)
    axs[1].set_xticks(np.arange(0, 24, 3))
    axs[1].tick_params(axis='both', which='major', labelsize=18)
    axs[1].grid(True, linestyle='--', alpha=0.7)
    
    peak_hour = np.argmax(hourly_pattern)
    off_peak_hour = np.argmin(hourly_pattern)
    
    peak_hour_formatted = f"{peak_hour}:00" if peak_hour < 12 else f"{peak_hour-12 if peak_hour > 12 else 12}:00 PM"
    off_peak_hour_formatted = f"{off_peak_hour}:00" if off_peak_hour < 12 else f"{off_peak_hour-12 if off_peak_hour > 12 else 12}:00 PM"
    
    hourly_analysis = f"Peak usage at {peak_hour_formatted} ({hourly_pattern[peak_hour]:.1f} kWh). Lowest at {off_peak_hour_formatted} ({hourly_pattern[off_peak_hour]:.1f} kWh)."
    recommendation = "Consider shifting energy-intensive activities to off-peak hours to reduce costs and grid load."
    
    axs[1].text(0.5, -0.2, hourly_analysis + "\n" + recommendation, ha='center', va='center', transform=axs[1].transAxes, fontsize=20, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    plt.tight_layout(pad=6.0, rect=[0, 0, 1, 0.97])
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_room_energy_distribution_chart(household_id):
    plt.figure(figsize=(7, 7)) 
    
    rooms_response = supabase_client.table('rooms').select('room_id', 'room_name').eq('household_id', household_id).execute()
    room_names = [room['room_name'] for room in rooms_response.data] if rooms_response.data else ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Others"]
    
   
    room_energy_data = {room: np.random.uniform(5, 30) for room in room_names}

   
    sorted_room_energy_data = dict(sorted(room_energy_data.items(), key=lambda item: item[1], reverse=True))

    
    colors = plt.cm.tab10(np.linspace(0, 1, len(sorted_room_energy_data)))
    
    
    
    wedges, texts, autotexts = plt.pie(
        sorted_room_energy_data.values(), 
        labels=sorted_room_energy_data.keys(), 
        autopct='%1.1f%%', 
        startangle=140, 
        colors=colors,
        textprops={'fontsize': 12, 'fontweight': 'bold'},
        wedgeprops={'edgecolor': 'white', 'linewidth': 2}
    )
    
  
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(12)
        autotext.set_fontweight('bold')
    
    plt.title('Room Energy Distribution', fontsize=18, fontweight='bold', pad=20)
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_device_energy_pie_chart(device_energy_data):
    plt.figure(figsize=(7, 7)) 

    
    sorted_device_energy = dict(sorted(device_energy_data.items(), key=lambda item: item[1], reverse=True))

  
    colors = plt.cm.tab20(np.linspace(0, 1, len(sorted_device_energy)))
    
   
    
    wedges, texts, autotexts = plt.pie(
        sorted_device_energy.values(), 
        labels=sorted_device_energy.keys(), 
        autopct='%1.1f%%', 
        startangle=140, 
        colors=colors,
        textprops={'fontsize': 12},
        wedgeprops={'edgecolor': 'white', 'linewidth': 2}
    )


    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(12)
        autotext.set_fontweight('bold')
    
  
    for i, text in enumerate(texts):
        text.set_fontsize(12)
        
    plt.title('Device Energy Consumption', fontsize=18, fontweight='bold', pad=20)
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_pdf_report_with_graphs(household_id):
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    household_energy = generate_household_energy_data(household_id)

    devices_response = supabase_client.table('devices').select('device_id', 'device_name').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in devices_response.data]
    device_names = {device['device_id']: device['device_name'] for device in devices_response.data} if devices_response.data else {}

    rooms_response = supabase_client.table('rooms').select('room_id','room_name').eq('household_id', household_id).execute()
    room_ids = [room['room_id'] for room in rooms_response.data]
    room_names = {room['room_id']: room['room_name'] for room in rooms_response.data} if rooms_response.data else {}
    

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=18)
    
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(name='Insight', 
                             parent=styles['Normal'],
                             spaceAfter=6,
                             bulletIndent=20,
                             leftIndent=20))
    
    styles.add(ParagraphStyle(name='SectionHeader', 
                             parent=styles['Heading3'],
                             spaceAfter=12,
                             spaceBefore=12,
                             textColor=colors.HexColor('#2980b9')))
    
    styles.add(ParagraphStyle(
        name='ReportTitle',
        parent=styles['Title'],
        fontSize=18,
        spaceAfter=12,
        textColor=colors.HexColor('#2c3e50'),  # Dark blue
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#2980b9'),
        alignment=TA_CENTER,
    ))

 
    styles.add(ParagraphStyle(
        name='CenteredHeading',
        parent=styles['Heading2'],
        alignment=TA_CENTER,
        spaceAfter=12,
        spaceBefore=12,
    ))


    styles.add(ParagraphStyle(
        name='IntroText',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        spaceAfter=10,
        alignment=TA_CENTER
    ))

    elements = []

    current_month = datetime.now().strftime('%B %Y')
    elements.append(Paragraph(f"Monthly Energy Report", styles['ReportTitle']))
    elements.append(Paragraph(f"{household_name}", styles['Subtitle']))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph(f"<b>Period:</b> {current_month}", styles['Normal']))
    elements.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 30))

 
    elements.append(Paragraph(
        "This report provides insights into household energy usage, "
        "highlighting key consumption trends, renewable energy contributions, "
        "and carbon footprint metrics.", styles['IntroText']
    ))
    elements.append(Spacer(1, 25))


    elements.append(Paragraph("Executive Summary", styles['CenteredHeading']))
    elements.append(Spacer(1, 20))


    summary_data = [
        ['Metric', 'Value', 'Analysis'],
        ['Total Energy Consumed', f"{household_energy['energy_consumed']:.2f} kWh",
         'Higher than average' if household_energy['energy_consumed'] > 300 else 'Within normal range'],
        ['Energy Generated', f"{household_energy['energy_generated']:.2f} kWh",
         'Good production' if household_energy['energy_generated'] > 100 else 'Below potential'],
        ['Renewable %', f"{household_energy['renewable_percentage']:.2f}%",
         'Excellent mix' if household_energy['renewable_percentage'] > 50 else 'Potential to increase'],
        ['Carbon Emission', f"{household_energy['carbon_emission']:.2f} kg CO2",
         'Low impact' if household_energy['carbon_emission'] < 200 else 'Reduction needed']
    ]

 
    table_style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor('#f0f0f0')), 
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ])

    for i in range(1, len(summary_data)):
        if i % 2 == 0:
            table_style.add('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f9f9f9')) 

    summary_table = Table(summary_data, colWidths=[2.5*inch, 2*inch, 2.9*inch])
    summary_table.setStyle(table_style)

    elements.append(Spacer(1, 15))
    elements.append(summary_table)
    elements.append(Spacer(1, 20))

    elements.append(PageBreak())
    if room_ids:
        elements.append(Paragraph("Room Energy Analysis", styles['SectionHeader']))
        
        elements.append(Paragraph("The table below shows energy consumption by room. Identifying high-consumption areas helps prioritize energy efficiency efforts.", styles['Normal']))
        elements.append(Spacer(1, 10))
        
        room_data = [['Room', 'Energy (kWh)', 'Percentage', 'Recommendation']]
        
        room_energy_values = {}
        total_room_energy = 0
        
        for room_id in room_ids:
            room_energy = generate_room_energy_data(room_id)['energy_consumed']
            room_energy_values[room_names.get(room_id, f"Room {room_id}")] = room_energy
            total_room_energy += room_energy
        
        for room_name, energy in room_energy_values.items():
            percentage = (energy / total_room_energy) * 100
            
            if percentage > 30:
                recommendation = "High priority for optimization"
            elif percentage > 20 and percentage <=30:
                recommendation = "Consider energy-efficient upgrades"
            else:
                recommendation = "Maintaining good efficiency"
                
            room_data.append([
                room_name, 
                f"{energy:.2f}", 
                f"{percentage:.1f}%", 
                recommendation
            ])
        
        room_data[1:] = sorted(room_data[1:], key=lambda x: float(x[1]), reverse=True)
        
        room_table = Table(room_data, colWidths=[1.5*inch, 1.3*inch, 1.2*inch, 2*inch])
        room_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (2,-1), 'CENTER'), 
            ('ALIGN', (0,0), (0,-1), 'LEFT'),  
            ('ALIGN', (3,0), (3,-1), 'LEFT'), 
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        
        elements.append(room_table)
        elements.append(Spacer(1, 30))
        
        room_chart_buffer = generate_room_energy_distribution_chart(household_id)
        elements.append(Image(room_chart_buffer, width=5*inch, height=5*inch))
        elements.append(Spacer(1, 20))
    elements.append(PageBreak())
    if device_ids:
        elements.append(Paragraph("Device Energy Analysis", styles['SectionHeader']))
        
        elements.append(Paragraph("This section analyzes individual device energy consumption. Identifying energy-hungry devices can help prioritize replacements or usage modifications.", styles['Normal']))
        elements.append(Spacer(1, 10))
        
        device_data = [['Device', 'Energy (kWh)', 'Efficiency Rating', 'Recommendation']]
        
        device_energy_values = {}
        
        for device_id in device_ids:
            device_energy = generate_device_energy_data(device_id)
            device_name = device_names.get(device_id, f"Device {device_id}")
            device_energy_values[device_name] = device_energy['energy_consumed']
            
            efficiency_ratings = ['A++', 'A+', 'A', 'B', 'C', 'D', 'E']
            weights = [0.1, 0.15, 0.2, 0.2, 0.15, 0.1, 0.1]  
            efficiency = random.choices(efficiency_ratings, weights=weights, k=1)[0]
            
            if  efficiency in ['D', 'E']: #device_energy['energy_consumed'] > 30 or
                recommendation = "Consider replacement with energy-efficient model"
            elif efficiency == 'C':# device_energy['energy_consumed'] > 20 and 
                recommendation = "Monitor usage; potential for optimization"
            else:
                recommendation = "Energy efficient; maintain current usage"
                
            device_data.append([
                device_name, 
                f"{device_energy['energy_consumed']:.2f}", 
                efficiency, 
                recommendation
            ])
        
        device_data[1:] = sorted(device_data[1:], key=lambda x: float(x[1]), reverse=True)
        
        device_table = Table(device_data, colWidths=[1.65*inch, 1.1*inch, 1.3*inch, 3.22*inch])
        device_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (2,-1), 'CENTER'), 
            ('ALIGN', (0,0), (0,-1), 'LEFT'),  
            ('ALIGN', (3,0), (3,-1), 'LEFT'),  
            ('BACKGROUND', (2,1), (2,-1), colors.HexColor('#f0f0f0')),  
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        
        elements.append(device_table)
        elements.append(Spacer(1, 30))
        
      
        device_energy_chart_buffer = generate_device_energy_pie_chart(device_energy_values)
        elements.append(Image(device_energy_chart_buffer, width=5*inch, height=5*inch))
        elements.append(Spacer(1, 15))
    
    elements.append(PageBreak())
    elements.append(Paragraph("Comprehensive Energy Analytics", styles['SectionHeader']))
    elements.append(Paragraph("The following visualizations provide a detailed analysis of your household's energy profile, consumption patterns, and sustainability metrics.", styles['Normal']))
    elements.append(Spacer(1, 10))
    

    graphs_buffer1 = generate_energy_graphs_page1(household_id)
    elements.append(Image(graphs_buffer1, width=7.5*inch, height=7.5*inch))
    elements.append(Spacer(1, 20))
    
   
    elements.append(PageBreak())
    
    elements.append(Paragraph("Comprehensive Energy Analytics (Continued)", styles['SectionHeader']))
    elements.append(Spacer(1, 10))
    
  
    graphs_buffer2 = generate_energy_graphs_page2(household_id)
    elements.append(Image(graphs_buffer2, width=7.5*inch, height=7.5*inch))
    elements.append(Spacer(1, 20))
    
  
    elements.append(PageBreak())
    elements.append(Paragraph("Key Insights & Recommendations", styles['SectionHeader']))
    
    peak_times = {
        "Morning (6 AM - 10 AM)": 0.3,  
        "Afternoon (12 PM - 3 PM)": 0.2,  
        "Evening (6 PM - 10 PM)": 0.5  
    }
    peak_time = random.choices(list(peak_times.keys()), weights=peak_times.values(), k=1)[0]
    
    carbon_emissions = household_energy['carbon_emission']
    renewable_percentage = household_energy['renewable_percentage']
    storage_efficiency = random.uniform(70, 95)
    comparison_percentage = random.uniform(5, 25)
    comparison_trend = "higher" if random.random() > 0.5 else "lower"
    renewable_utilization = random.uniform(40, 90)
    
    consumption_insights = [
        f"Total energy consumption for {household_name}: {household_energy['energy_consumed']:.2f} kWh",
        f"Peak energy consumption occurs during {peak_time}. Consider shifting some usage to off-peak hours to reduce costs.",
        f"Your energy consumption is {comparison_percentage:.1f}% {comparison_trend} than similar households.",
        "Small changes in high-use areas can lead to significant energy savings."
    ]
    
    sustainability_insights = [
        f"Renewable energy contribution: {renewable_percentage:.1f}%",
        f"Your household's carbon emissions from energy use are estimated at {carbon_emissions:.2f} kg CO₂.",
        f"You are utilizing {renewable_utilization:.1f}% of available renewable energy.",
        "Increasing renewable reliance can reduce both costs and environmental impact."
    ]
    
    efficiency_insights = [
        f"Battery storage efficiency is at {storage_efficiency:.1f}%. Ensure batteries are optimally charged to maximize savings.",
        "Smart scheduling of appliances can reduce peak demand charges.",
        "Regular maintenance of HVAC systems can improve efficiency by up to 15%.",
        "Upgrading to smart home controls could provide additional 10-20% savings."
    ]
    
    actionable_recommendations = [
        "Schedule energy-intensive activities during off-peak hours (typically nights and weekends).",
        "Consider upgrading highest-energy consuming devices to more efficient models.",
        "Implement smart power strips to eliminate phantom power usage from electronics.",
        "Evaluate potential for additional solar capacity or other renewable sources.",
        "Schedule a professional energy audit to identify hidden efficiency opportunities."
    ]
    


    elements.append(Paragraph("Consumption Patterns:", styles['Heading4']))
    for insight in consumption_insights:
        elements.append(Paragraph(f"• {insight}", styles['Insight']))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("Sustainability Metrics:", styles['Heading4']))
    for insight in sustainability_insights:
        elements.append(Paragraph(f"• {insight}", styles['Insight']))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("Efficiency Analysis:", styles['Heading4']))
    for insight in efficiency_insights:
        elements.append(Paragraph(f"• {insight}", styles['Insight']))
    elements.append(Spacer(1, 10))
    
    elements.append(Paragraph("Recommended Actions:", styles['Heading4']))
    for i, recommendation in enumerate(actionable_recommendations, 1):
        elements.append(Paragraph(f"{i}. {recommendation}", styles['Insight']))
    
    elements.append(PageBreak())
    elements.append(Paragraph("Monthly Progress Tracker", styles['SectionHeader']))
    elements.append(Paragraph("This section helps you track your household's energy performance over time. Use this to monitor the impact of your energy optimization efforts.", styles['Normal']))
    elements.append(Spacer(1, 15))
    
    current_month = datetime.now()
    month_names = []
    for i in range(3, 0, -1):
        past_month = current_month - timedelta(days=30*i)
        month_names.append(past_month.strftime('%B'))
    month_names.append(current_month.strftime('%B'))
    
    progress_data = [
        ['Metric'] + month_names + ['Trend'],
        ['Total Energy (kWh)']
    ]
    
    base_consumption = household_energy['energy_consumed'] * 1.15
    consumptions = [base_consumption]
    for i in range(1, 3):
        consumptions.append(consumptions[-1] * (1 - random.uniform(0.02, 0.05)))
    consumptions.append(household_energy['energy_consumed'])
    
    if consumptions[-1] < consumptions[0]:
        trend_icon = "↓ Improving"
    else:
        trend_icon = "↑ Increasing"
    
    progress_data[1].extend([f"{c:.1f}" for c in consumptions])
    progress_data[1].append(trend_icon)
    
    renewable_row = ['Renewable (%)']
    base_renewable = max(10, household_energy['renewable_percentage'] * 0.85)
    renewables = [base_renewable]
    for i in range(1, 3):
        renewables.append(renewables[-1] * (1 + random.uniform(0.03, 0.08)))
    renewables.append(household_energy['renewable_percentage'])
    
    renewable_row.extend([f"{r:.1f}%" for r in renewables])
    if renewables[-1] > renewables[0]:
        renewable_row.append("↑ Improving")
    else:
        renewable_row.append("↓ Decreasing")
    progress_data.append(renewable_row)
    
    carbon_row = ['Carbon (kg CO2)']
    base_carbon = household_energy['carbon_emission'] * 1.2
    carbons = [base_carbon]
    for i in range(1, 3):
        carbons.append(carbons[-1] * (1 - random.uniform(0.02, 0.07)))
    carbons.append(household_energy['carbon_emission'])
    
    carbon_row.extend([f"{c:.1f}" for c in carbons])
    if carbons[-1] < carbons[0]:
        carbon_row.append("↓ Improving")
    else:
        carbon_row.append("↑ Increasing")
    progress_data.append(carbon_row)
    
    col_widths = [1.5*inch] + [1*inch] * len(month_names) + [1*inch]
    progress_table = Table(progress_data, colWidths=col_widths)
    progress_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor('#f0f0f0')),
        ('BACKGROUND', (-1,1), (-1,-1), colors.HexColor('#f0f0f0')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (-2,-1), 'CENTER'),
        ('ALIGN', (-1,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(progress_table)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph("Conclusion & Next Steps", styles['SectionHeader']))
    
    energy_trend = "decreasing" if random.random() > 0.5 else "increasing slightly"
    renewable_trend = "improving" if household_energy['renewable_percentage'] > 30 else "has potential for improvement"
    
    conclusion_text = f"""This monthly energy report for {household_name} shows that your overall energy consumption is {energy_trend} 
    compared to previous months. Your renewable energy utilization {renewable_trend}.
    
    Based on the analysis in this report, we recommend focusing on the following areas:
    
    1. Optimize energy usage in {room_data[1][0]} which accounts for the highest energy consumption.
    2. Consider upgrading or modifying usage patterns for your highest-consuming devices.
    3. Shift energy-intensive activities away from {peak_time} to reduce peak demand charges.
    
    By implementing these recommendations, you could potentially reduce your energy consumption by 10-15% and increase renewable utilization by up to 20%.
    
    Your next report will be generated on {(datetime.now() + timedelta(days=30)).strftime('%B %d, %Y')}. We look forward to helping you track your progress!
    """
    
    elements.append(Paragraph(conclusion_text.replace("\n", "<br />"), styles['Normal']))
    
    def add_page_number(canvas, doc):
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.drawRightString(7.5*inch, 0.5*inch, text)
        canvas.restoreState()
    
    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    buffer.seek(0)
    return buffer


@app.route('/energy_report', methods=['GET'])
def generate_comprehensive_energy_report():
    household_id = request.args.get('household_id')
   
    
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    
   
    current_month = datetime.now().strftime('%B_%Y')
    pdf_buffer = generate_pdf_report_with_graphs(household_id)
    
    return send_file(
        pdf_buffer, 
        mimetype='application/pdf', 
        as_attachment=True, 
        download_name=f'{household_name}_monthly_energy_report_{current_month}.pdf'
    )
#-------------------------------------------houses------------------------------------------------#
@app.route('/create_house', methods=['POST'])
def create_house_route():
    data = request.get_json()
    manager_uuid = data.get('manager_id')
    house_name = data.get('house_name')
    
    print("Received manager_uuid:", manager_uuid)
    print("Received house_name:", house_name)
    
    response = create_house(manager_uuid, house_name)
    return jsonify(response)
import uuid
import string
def create_house(manager_uuid: str, house_name: str):
    """Creates a house, assigns a unique ID, and adds 3 default rooms."""
    # Verify manager role
    user_data = supabase_client.table("users").select("user_role").eq("user_id", manager_uuid).execute()
    if not user_data.data or user_data.data[0]["user_role"] != "Home Manager":
        return {"error": "Only Home Managers can create a house"}
    
    # Generate house ID and h_id (shareable code)
    house_id = random.randint(100000, 99999999)
    h_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    
    # Create entry in households table
    supabase_client.table("households").insert({
        "household_id": house_id,
        "household_name": house_name,
        "h_id": h_id,
        "home_manager_id": manager_uuid,
        
    }).execute()
    
    
    # Adding 3 default rooms to the house
    rooms = [
        {"room_id": random.randint(100000, 99999999), "household_id": house_id, "room_name": "Living Room"},
        {"room_id": random.randint(100000, 99999999), "household_id": house_id, "room_name": "Kitchen"},
        {"room_id": random.randint(100000, 99999999), "household_id": house_id, "room_name": "Bedroom"}
    ]
    
    for room in rooms:
        supabase_client.table("rooms").insert(room).execute()
    
    return {
        "success": "House created successfully with default rooms", 
        "house_id": h_id,  # Return the shareable code
        "house_name": house_name
    }

@app.route('/join_house', methods=['POST'])
def join_house_route():
    data = request.get_json()
    user_uuid = data.get('user_id')
    h_id = data.get('house_id')  # This is the shareable code
   
    print("Received user_uuid:", user_uuid)
    print("Received h_id:", h_id)
    
    response = join_house(user_uuid, h_id)
    return jsonify(response)

def join_house(user_uuid: str, h_id: str):
    """Allows a Home User to join an existing household."""
    # Check if household exists using the shareable code
    household = supabase_client.table("households").select("*").eq("h_id", h_id).execute()
    
    if not household.data:
        return {"error": "Invalid house code"}
    
    household_data = household.data[0]
    household_id = household_data["household_id"]
    
    # Update user's house_id
    supabase_client.table("users").update({"house_id": household_id}).eq("user_id", user_uuid).execute()
    
    # Create homeuser_household association
    supabase_client.table("homeuser_household").insert({
        "userhouse_id": str(uuid.uuid4()),
        "user_id": user_uuid,
        "household_id": household_id,
        "h_id": h_id,
        
    }).execute()
    
    return {
        "success": "Successfully joined the household",
        "house_id": household_id,
        "house_name": household_data["household_name"]
    }

@app.route('/get_user_houses', methods=['GET'])
def get_user_houses_route():
    user_uuid = request.args.get('user_id')
    
    response = get_user_houses(user_uuid)
    return jsonify(response)

def get_user_houses(user_uuid: str):
    """Gets all houses that a user is a member of."""
    # Get all houses the user is a member of from homeuser_household
    memberships = supabase_client.table("homeuser_household").select("household_id").eq("user_id", user_uuid).execute()
    
    if not memberships.data:
        return {"houses": []}
    
    household_ids = [membership["household_id"] for membership in memberships.data]
    
    # Get household details
    households = supabase_client.table("households").select("household_id,household_name,home_manager_id").in_("household_id", household_ids).execute()
    
    if not households.data:
        return {"houses": []}
    
    # Convert to houses format for frontend
    houses = []
    for household in households.data:
        houses.append({
        "house_id": household["household_id"],
        "house_name": household["household_name"],
        "owner_id": household["home_manager_id"],
        "is_owner": household["home_manager_id"] == user_uuid
    })
    return {"houses": houses}
@app.route('/get_managed_houses', methods=['GET'])
def get_managed_houses_route():
    user_uuid = request.args.get('user_id')
    
    response = get_managed_houses(user_uuid)
    return jsonify(response)

def get_managed_houses(user_uuid: str):
    """Gets all houses that a user manages (i.e., where they are the home manager)."""
    # Get all households where the user is the home manager
    households = supabase_client.table("households").select(
        "household_id,household_name,h_id,household_icon,home_manager_id"
    ).eq("home_manager_id", user_uuid).execute()
    
    if not households.data:
        return {"houses": []}
    
    # Convert to houses format for frontend
    houses = [
        {
            "house_id": household["household_id"],
            "house_name": household["household_name"],
            "h_id": household["h_id"],
            "household_icon": household["household_icon"],
            "is_owner": True  # Since the user is the home manager
        }
        for household in households.data
    ]
    
    return {"houses": houses}


@app.route('/delete_house', methods=['POST'])
def delete_house_route():
    data = request.get_json()
    manager_uuid = data.get('manager_id')
    house_id = data.get('house_id')
    
    print("Received delete request:")
    print("Manager UUID:", manager_uuid)
    print("House ID:", house_id)
    
    response = delete_house(manager_uuid, house_id)
    return jsonify(response)

def delete_house(manager_uuid: str, house_id: str):
    """
    Deletes a house and all associated data including rooms and user associations.
    
    Args:
        manager_uuid (str): The UUID of the manager requesting deletion
        house_id (str): The ID of the house to delete
        
    Returns:
        dict: Response indicating success or error
    """
    # Verify that the user is the home manager for this house
    house_data = supabase_client.table("households").select("*").eq("household_id", house_id).execute()
    
    if not house_data.data:
        return {"error": "House not found"}
    
    
    try:
        # Delete associated rooms first
        supabase_client.table("rooms").delete().eq("household_id", house_id).execute()

        # Delete user associations
        supabase_client.table("homeuser_household").delete().eq("household_id", house_id).execute()

        # Delete the house itself
        supabase_client.table("households").delete().eq("household_id", house_id).execute()

        return {"success": True, "message": "House deleted successfully"}

    except Exception as e:
        return {"error": f"Failed to delete house: {str(e)}"}
    


# 3. Get schedules for devices in a specific room

#-------------------------------------------scheduke------------------------------------------------#
@app.route('/get_device_schedule/<int:device_id>', methods=['GET'])
def get_device_schedules_by_room_and_device(device_id):
    try:
        # Join device_schedule with devices to filter by room_id
        response = supabase_client.table('device_schedule').select('*').eq('device_id', device_id).execute()

        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# 4. Create a new device schedule
@app.route('/create_device_schedule/<int:device_id>', methods=['POST'])
def create_device_schedule(device_id):
    data = request.json
    
    # Validate required fields
    required_fields = ['start_time', 'end_time', 'repeat_days', 'is_active']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Add device_id to data
    data['device_id'] = device_id
    data['is_active'] = data.get('is_active', True)
    
    try:
        # Insert new schedule
        response = supabase_client.table('device_schedule').insert(data).execute()
        
        # Return the newly created schedule ID
        return jsonify({"success": True, "device_schedule_id": response.data[0]['device_schedule_id']})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. Update an existing device schedule
@app.route('/update_device_schedule/<int:device_id>', methods=['PUT'])
def update_device_schedule(device_id):
    data = request.json
    
    try:
        # Update schedule by ID
        response = supabase_client.table('device_schedule').update(data).eq('device_id', device_id).execute()
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6. Delete a device schedule
@app.route('/delete_schedule/<int:device_id>', methods=['DELETE'])
def delete_device_schedule(device_id):
    try:
        # Delete schedule by ID
        supabase_client.table('device_schedule').delete().eq('device_id', device_id).execute()
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#-------------------------------------------user energy report------------------------------------------------#
def generate_daily_energy_summary(household_id):
    
    
   
    rcParams.update({
        'font.family': 'DejaVu Sans',
        'font.size': 12,
        'axes.titlesize': 14,
        'axes.labelsize': 12,
        'xtick.labelsize': 11,
        'ytick.labelsize': 11,
    })
    
  
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    
   
    current_date = datetime.now()
    report_date = current_date.strftime('%Y-%m-%d')
   
    hours = np.arange(0, 24)
   
    hourly_pattern = 5 + 15 * np.sin((hours - 6) * np.pi / 12)  
    hourly_pattern = np.maximum(hourly_pattern, 2) 
    morning_peak = np.random.normal(20, 5, 4)  
    evening_peak = np.random.normal(25, 7, 5) 
    
   
    hourly_pattern[6:10] += morning_peak
    hourly_pattern[17:22] += evening_peak
    

    hourly_pattern += np.random.normal(0, 1, 24)
    hourly_pattern = np.maximum(hourly_pattern, 0)  
    
 
    current_hour = current_date.hour
    energy_consumed_so_far = np.sum(hourly_pattern[:current_hour+1])
    peak_hour = np.argmax(hourly_pattern[:current_hour+1]) 
    peak_value = hourly_pattern[peak_hour]
    
   
    plt.figure(figsize=(8, 4))
 
    plt.bar(hours[:current_hour+1], hourly_pattern[:current_hour+1], color='#3498db', label='Actual Usage')

    plt.axvspan(6, 10, alpha=0.2, color='yellow', label='Morning Peak')
    plt.axvspan(17, 22, alpha=0.2, color='orange', label='Evening Peak')

    if current_hour < 23:
        plt.axvline(x=current_hour, color='red', linestyle='--', label='Current Time')
    

    plt.title('Daily Energy Consumption Pattern (Up to Current Time)', fontsize=16, fontweight='bold')
    plt.xlabel('Hour of Day (24-hour format)', fontsize=12)
    plt.ylabel('Energy (kWh)', fontsize=12)
    plt.xticks(np.arange(0, 24, 2))
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend(loc='upper right')
    

    graph_buffer = io.BytesIO()
    plt.savefig(graph_buffer, format='png', dpi=150, bbox_inches='tight')
    graph_buffer.seek(0)
    plt.close()
    
 
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='ReportTitle',
        parent=styles['Title'],
        fontSize=18,
        spaceAfter=12,
        textColor=colors.HexColor('#2c3e50'),
        alignment=TA_CENTER,
    ))
    
    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#2980b9'),
        alignment=TA_CENTER,
    ))
    
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading3'],
        fontSize=14,
        spaceBefore=8,
        spaceAfter=8,
        textColor=colors.HexColor('#2980b9'),
    ))
    
    styles.add(ParagraphStyle(
        name='KeyMetric',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=3,
        leftIndent=10,
    ))
    
    
    elements = []
    

    elements.append(Paragraph(f"Daily Energy Summary", styles['ReportTitle']))
    elements.append(Paragraph(f"{household_name}", styles['Subtitle']))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>Date:</b> {current_date.strftime('%A, %B %d, %Y')}", styles['Normal']))
    elements.append(Paragraph(f"<b>Report Time:</b> {current_date.strftime('%H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    

    elements.append(Paragraph("Today's Energy Snapshot", styles['SectionHeader']))
    

    percent_of_day = (current_hour / 24) * 100

    elements.append(Paragraph(f"• <b>Energy Used So Far:</b> {energy_consumed_so_far:.1f} kWh ({(energy_consumed_so_far/np.sum(hourly_pattern)*100):.1f}% of projected daily total)", styles['KeyMetric']))
    elements.append(Paragraph(f"• <b>Peak Usage Time:</b> {peak_hour}:00 ({peak_value:.1f} kWh)", styles['KeyMetric']))

    elements.append(Spacer(1, 10))
    elements.append(Paragraph("Smart Energy Tips", styles['SectionHeader']))
    
    if 6 <= current_hour <= 10:
        elements.append(Paragraph("• You're in a morning peak period. Consider delaying energy-intensive activities if possible.", styles['KeyMetric']))
    elif 17 <= current_hour <= 22:
        elements.append(Paragraph("• You're in an evening peak period. Minimizing usage now can reduce your peak demand charges.", styles['KeyMetric']))
    else:
        elements.append(Paragraph("• Current period is off-peak. This is an ideal time for energy-intensive activities.", styles['KeyMetric']))
    

    tips = [
        "Use the delay feature on appliances to run them during off-peak hours.",
        "Lower your thermostat by 1-2 degrees to reduce heating/cooling costs.",
        "Unplug devices and chargers when not in use to avoid phantom power usage.",
        "Use natural light when possible and turn off lights in unoccupied rooms.",
        "Run full loads in dishwashers and washing machines to maximize efficiency."
    ]
    import random
    elements.append(Paragraph(f"• <b>Today's Tip:</b> {random.choice(tips)}", styles['KeyMetric']))
    

    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Daily Energy Consumption Pattern (Up to Current Time)", styles['SectionHeader']))
    elements.append(Image(graph_buffer, width=450, height=225))
    

    elements.append(Spacer(1, 20))
    previous_day = np.sum(hourly_pattern) * (1 + random.uniform(-0.15, 0.15))
    week_average = np.sum(hourly_pattern) * (1 + random.uniform(-0.1, 0.2))
    
    comparison_data = [
        ['Period', 'Energy (kWh)', 'Comparison'],
        ['Today (Up to Current Time)', f"{energy_consumed_so_far:.1f}", "-"],
        ['Yesterday', f"{previous_day:.1f}", f"{((energy_consumed_so_far-previous_day)/previous_day*100):.1f}% {'lower' if energy_consumed_so_far < previous_day else 'higher'}"],
        ['Week Average', f"{week_average:.1f}", f"{((energy_consumed_so_far-week_average)/week_average*100):.1f}% {'lower' if energy_consumed_so_far < week_average else 'higher'}"]
    ]
    
    comparison_table = Table(comparison_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    comparison_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(comparison_table)
    

    doc.build(elements)
    buffer.seek(0)
    return buffer


@app.route('/daily_energy_summary', methods=['GET'])
def generate_daily_summary_report():
    household_id = request.args.get('household_id')
    
    
    household_response = supabase_client.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    

    current_date = datetime.now().strftime('%Y_%m_%d')
    pdf_buffer = generate_daily_energy_summary(household_id)
    
    return send_file(
        pdf_buffer, 
        mimetype='application/pdf', 
        as_attachment=True, 
        download_name=f'{household_name}_daily_energy_summary_{current_date}.pdf'
    )

#-------------------------------------------challenget------------------------------------------------#

@app.route('/create_challenge', methods=['POST'])
def create_challenge():
    """Create a new energy-saving challenge"""
    data = request.json
    
    required_fields = ['household_id', 'goal_type', 'target_value', 'deadline']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Convert deadline string to date
    try:
        deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid deadline format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
    
    # Generate a unique challenge ID
    challenge_id = uuid.uuid4().int % (10**8)
    
    # Insert into energy_goals table
    challenge = {
        "goals_id": challenge_id,
        "household_id": data['household_id'],
        "goal_type": data['goal_type'],
        "target_value": data['target_value'],
        "current_value": 0,  # Starting value
        "deadline": data['deadline'],
        "achieved": False
    }
    
    result = supabase_client.table("energy_goals").insert(challenge).execute()
    
    if result.data:
        # Notify household members about the new challenge
        members_response = supabase_client.table("homeuser_household").select(
            "user_id"
        ).eq("household_id", data['household_id']).execute()
        
        for member in members_response.data:
            notification = {
                "user_id": member["user_id"],
                "type": "SUGGESTION",
                "message": f"New energy challenge started with goal to save {data['target_value']} {data['goal_type']}",
                "is_read": False,
                "created_at": datetime.now().isoformat()
            }
            supabase_client.table("notifications").insert(notification).execute()
        
        return jsonify({
            "success": True,
            "challenge_id": challenge_id,
            "message": "Challenge created successfully"
        })
    else:
        return jsonify({"error": "Failed to create challenge"}), 500

@app.route('/challenges', methods=['GET'])
def get_challenges():
    """Get all challenges for a household"""
    household_id = request.args.get('household_id')
    
    if not household_id:
        return jsonify({"error": "Missing household_id parameter"}), 400
    
    # Get challenges for the household
    response = supabase_client.table("energy_goals").select(
        "*"
    ).eq("household_id", household_id).order("deadline", desc=False).execute()
    
    return jsonify({
        "challenges": response.data
    })

@app.route('/challenges/<challenge_id>', methods=['PATCH'])
def update_challenge(challenge_id):
    """Update a challenge's current value or status"""
    data = request.json
    
    if 'current_value' not in data:
        return jsonify({"error": "Missing current_value field"}), 400
    
    # Get current challenge
    challenge_response = supabase_client.table("energy_goals").select(
        "*"
    ).eq("goals_id", challenge_id).execute()
    
    if not challenge_response.data or len(challenge_response.data) == 0:
        return jsonify({"error": "Challenge not found"}), 404
    
    challenge = challenge_response.data[0]
    current_value = float(data['current_value'])
    target_value = float(challenge['target_value'])
    
    # Check if goal is achieved
    achieved = current_value >= target_value
    
    # Update challenge
    update_data = {
        "current_value": current_value,
        "achieved": achieved
    }
    
    result = supabase_client.table("energy_goals").update(
        update_data
    ).eq("goals_id", challenge_id).execute()
    
    if achieved and not challenge['achieved']:
        # Create notification for achievement
        household_id = challenge['household_id']
        members_response = supabase_client.table("homeuser_household").select(
            "user_id"
        ).eq("household_id", household_id).execute()
        
        for member in members_response.data:
            notification = {
                "user_id": member["user_id"],
                "type": "challenge_completed",
                "content": f"Congratulations! Your household achieved the {challenge['goal_type']} challenge goal!",
                "read": False,
                "created_at": datetime.now().isoformat()
            }
            supabase_client.table("notifications").insert(notification).execute()
    
    return jsonify({
        "success": True,
        "challenge": result.data[0] if result.data else None,
        "achieved": achieved
    })


if __name__ == '__main__':
    app.run(debug=True, port=5003)


