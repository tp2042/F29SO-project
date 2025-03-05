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

@app.route('/delete_device/<int:device_id>', methods=['DELETE'])
def delete_device(device_id):
    try:
        # Attempt to delete the device with the given device_id
        response = supabase.table("devices").delete().eq("device_id", device_id).execute()

        # Check if the device was found and deleted
        if response.data:
            return jsonify({"Device Deletion": "Successful"}), 200
        else:
            return jsonify({"Error": "Device not found"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------------------------------------------------------#


#--------------------------------- DEVICE DETAILS (GET) ------------------------------------#

# get status of all devices
@app.route('/get_device', methods=['GET'])
def get_all_devices():
    try:
        response = supabase.table("devices").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# get status of a specific device (by device_id)
@app.route('/get_device/<int:device_id>', methods=['GET'])
def get_device(device_id):
    try:
        response = (
            supabase.table("devices")
            .select("*")
            .eq("device_id", device_id)
            .single()
            .execute()
        )

        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"Error":"Device not found"}), 404

#-------------------------------------------------------------------------------------------#


#----------------------------- DEVICE HEALTH CHECK (POST) ----------------------------------#

@app.route('/add_devicefault', methods=['POST'])
def add_fault():
    # Extract data from the request body
    data = request.json

    # Prepare the fault data to be inserted into the table
    device_id = data.get("device_id")
    fault_description = data.get("fault_description")
    intensity = data.get("intensity")
    resolved = data.get("resolved", False)  # Default to False if not provided

    # Check if all necessary data is provided
    if not data or not device_id or not fault_description or not intensity:
        return jsonify({"Error": "Missing required fields"}), 404

    try:
        # Insert the fault data into the Device_Faults table
        response = supabase.table("device_faults").insert({
            "device_id": device_id,
            "fault_description": fault_description,
            "intensity": intensity,
            "resolved": resolved
        }).execute()

        # Check if the insert was successful
        if response.data:
            return jsonify({"Fault Report": "Successfull", "fault_id": response.data[0]["fault_id"]}), 201
        else:
            return jsonify({"Fault Report": "Failed"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------------------------------------------------------#


#----------------------------- UPDATE DEVICE HEALTH (PUT) ----------------------------------#

@app.route('/update_devicefault/<int:fault_id>', methods=['PUT'])
def update_fault(fault_id):
    try:
        # Extract JSON data from request
        data = request.json

        # Ensure there is data to update
        if not data:
            return jsonify({"Error": "No Data found"}), 400

        # Attempt to update the device
        response = supabase.table("device_faults").update(data).eq("fault_id", fault_id).execute()

        # Check if update was successful
        if response.data:
            return jsonify({"Fault Data": "Updated Successfully", "Updated Data": response.data}), 200
        else:
            return jsonify({"Fault Data": "Updated Unsuccessfully", "Error": "Device Fault not found or no changes made"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------------------------------------------------------#


#--------------------------------- ADD ROOM (POST) ------------------------------------------#

@app.route('/add_room', methods=['POST'])
def add_room():
    try:
        # Extract JSON data from the request
        data = request.json

        household_id = data.get("household_id")
        room_id = data.get("room_id")
        room_name = data.get("room_name")

        # Ensure required fields are provided
        if not data or not household_id or not room_id or not room_name:
            return jsonify({"Room Addition": "Failed", "Error": "room_name, room_id and household_id haven't been provided"}), 404

        # Insert the room into the database
        response = supabase.table("rooms").insert({
            "household_id": household_id,
            "room_id": room_id,
            "room_name": room_name,
        }).execute()

        # Check if the insertion was successful
        if response.data:
            return jsonify({"Room Data": "Addition Successfull", "Room Data": response.data}), 200
        else:
            return jsonify({"Room Data": "Addition Failed", "Error": response.error}), 500

    except Exception as e:
        return jsonify({"Error": str(e)}), 500
#-------------------------------------------------------------------------------------------#


#-------------------------------- DELETE ROOM (DELETE) -------------------------------------#

@app.route('/delete_room/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    try:
        # Attempt to delete the device with the given device_id
        response = supabase.table("rooms").delete().eq("room_id", room_id).execute()

        # Check if the device was found and deleted
        if response.data:
            return jsonify({"Room Deletion": "Successful"}), 200
        else:
            return jsonify({"Error": "Room not found"}), 404

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

#-------------------------------------------------------------------------------------------#


if __name__ == '__main__':
    app.run(debug=True)

