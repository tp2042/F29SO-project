from flask import Flask, request, jsonify
from supabase import create_client, Client
import os

app = Flask(__name__)

supabase_url ="https://aycgaggcginkdlbwskgg.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"
supabase: Client = create_client(supabase_url, supabase_key)

#--------------------------------- DEVICE STATUS (GET) -------------------------------------#

# get status of all devices
@app.route('/device_status', methods=['GET'])
def get_all_device_status():
    try:
        response = supabase.table("device_status").select("*").execute()
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
        response = supabase.table("devices").insert({
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

#-------------------------------------------------------------------------------------------#


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
        response = supabase.table("devices").update(data).eq("device_id", device_id).execute()

        # Check if update was successful
        if response.data:
            return jsonify({"Device Data": "Updated Successfully", "Dpdated Data": response.data}), 200
        else:
            return jsonify({"Device Data": "Updated Unsuccessfully", "Error": "Device not found or no changes made"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------------------------------------------------------#


#-------------------------------- DELETE DEVICE (DELETE) -----------------------------------#

#-------------------------------------------------------------------------------------------#


#--------------------------------- DEVICE DETAILS (GET) ------------------------------------#

#-------------------------------------------------------------------------------------------#


#----------------------------- DEVICE HEALTH CHECK (POST) ----------------------------------#

#-------------------------------------------------------------------------------------------#


if __name__ == '__main__':
    app.run(debug=True)

