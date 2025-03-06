
from flask import Flask, Blueprint, jsonify, request, send_file
from supabase import create_client, Client
from flask_cors import CORS
import os
import random
from datetime import datetime
import io
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
import matplotlib.pyplot as plt
plt.switch_backend('Agg')

app = Flask(__name__)
url = "https://aycgaggcginkdlbwskgg.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Y2dhZ2djZ2lua2RsYndza2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY1NjQsImV4cCI6MjA1NTUzMjU2NH0.NLkx-mJEr5ydeQUVo410mALxGF0Qg5Go4zOO98I15f0"  # Replace with your Supabase anon/public API key
supabase: Client = create_client(url, key)
CORS(app)
energy_retrieval = Blueprint('energy_retrieval', __name__)

#_______________________________________________ENERGY RETRIEVAL FUNCTIONS_________________________________________________________#

def verify_id_exists (table_name, id_column, id_value):
    response = supabase.table(table_name).select(id_column).eq(id_column, id_value).execute()
    return len(response.data)>0

def generate_household_energy_data(household_id):
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
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
    room_response = supabase.table('rooms').select('room_name').eq('room_id', room_id).execute()
    room_name = room_response.data[0]['room_name'] if room_response.data else f"Room {room_id}"
    return{
        'room_id': room_id,
        'room_name': room_name, 
        'energy_consumed': round(random.uniform(1,100),2),
        'recorded_at': datetime.now().isoformat()
    }
      
def generate_device_energy_data(device_id):
    device_response = supabase.table('devices').select('device_name').eq('device_id', device_id).execute()
    device_name = device_response.data[0]['device_name'] if device_response.data else f"Device {device_id}"
    return{
        'device_id': device_id,
        'device_name': device_name,
        'energy_consumed': round(random.uniform(0.1,50),2),
        'recorded_at': datetime.now().isoformat()
    }

@energy_retrieval.route('/household_energy', methods = ['GET'])
def get_household_energy():
    household_id = request.args.get('household_id')
    household_name = request.args.get('household_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int, default = 50)

    if household_id and not verify_id_exists('households', 'household_id', household_id):
        return jsonify({'error': 'household id not found'}), 404
    
    if household_id:
        data = [generate_household_energy_data(household_id)for _ in range(limit)]
    return jsonify(data)

@energy_retrieval.route('/room_energy',methods = ['GET'])
def get_room_energy():
    room_id = request.args.get('room_id')
    household_id = request.args.get('household_id')
    room_name = request.args.get('room_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int, default = 50)
    
    if room_id and not verify_id_exists('rooms', 'room_id', room_id):
        return jsonify({'error': 'room id not found'}), 404
    
    if household_id and not verify_id_exists('rooms', 'household_id', household_id):
        return jsonify({'error': 'household id not found'}), 404
    
    if room_id:
        data = [generate_room_energy_data(room_id)for _ in range(limit)]

    elif household_id:
        room_response = supabase.table('rooms').select('room_id').eq('household_id', household_id).execute()
        room_ids = [room['room_id'] for room in  room_response.data ]
        if not room_ids:
             return jsonify({'error': 'room id not found'}), 404
        data = [generate_room_energy_data(room_id) for room_id in room_ids[:limit]]
    
    else: 
        return jsonify({'error': 'room id not found'}), 404
    
    return jsonify(data)

@energy_retrieval.route('/device_energy',methods = ['GET'])
def get_device_energy():
    device_id = request.args.get('device_id')
    household_id = request.args.get('household_id')
    device_name = request.args.get('device_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int, default = 50)
    
    if device_id and not verify_id_exists('devices', 'device_id', device_id):
        return jsonify({'error': 'device id not found'}), 404
    
    if household_id and not verify_id_exists('devices', 'household_id', household_id):
        return jsonify({'error': 'household id not found'}), 404
    
    if device_id:
        data = [generate_device_energy_data(device_id)for _ in range(limit)]

    elif household_id:
        device_response = supabase.table('devices').select('device_id').eq('household_id', household_id).execute()
        device_ids = [device['device_id'] for device in  device_response.data ]
        if not device_ids:  
                return jsonify({'error': 'device id not found'}), 404
        data = [generate_device_energy_data(device_id) for device_id in device_ids[:limit]]

    else: 
        return jsonify({'error': 'deviceid not found'}), 404
    
    return jsonify(data)

@energy_retrieval.route('/energy_insights', methods = ['GET'])
def get_energy_insights():
    household_id = request.args.get('household_id')

    if not household_id:
        return jsonify({"error: household id not found"}), 404
    household_energy_data = [generate_household_energy_data(household_id) for _ in range(10)]
    room_response = supabase.table('rooms').select('room_id').eq('household_id', household_id).execute()
    room_ids = [room['room_id'] for room in  room_response.data ]
    room_energy_data = [generate_room_energy_data(room_id) for room_id in room_ids[:10]]
    
    device_response = supabase.table('devices').select('device_id').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in  device_response.data ]
    device_energy_data = [generate_device_energy_data(device_id) for device_id in device_ids[:10]]
    '''
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
    '''
    household_energy_data = [generate_household_energy_data(household_id) for _ in range(10)]
    room_response = supabase.table('rooms').select('room_id').eq('household_id', household_id).execute()
    room_ids = [room['room_id'] for room in room_response.data]
    room_energy_data = [generate_room_energy_data(room_id) for room_id in room_ids[:10]]

    device_response = supabase.table('devices').select('device_id').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in device_response.data]
    device_energy_data = [generate_device_energy_data(device_id) for device_id in device_ids[:10]]

    # Calculate household energy statistics
    total_household_energy = sum(entry.get('energy_consumed', 0) for entry in household_energy_data)
    total_household_generated = sum(entry.get('energy_generated', 0) for entry in household_energy_data)
    avg_renewable_percentage = (
        sum(entry.get('renewable_percentage', 0) for entry in household_energy_data) / len(household_energy_data)
        if household_energy_data else 0
    )

    # Calculate room and device energy statistics
    total_room_energy = sum(entry.get('energy_consumed', 0) for entry in room_energy_data)
    total_device_energy = sum(entry.get('energy_consumed', 0) for entry in device_energy_data)

    # Generate text-based insights
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
    
#-----------------------------------------------------ENERGY REPORT-----------------------------------------------------------------#

def generate_energy_graphs(household_id):
    plt.close('all')
    fig,axs = plt.subplots(2,2, figsize = (25,20))
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"

    fig.suptitle(f'Energy Analysis - {household_name}', fontsize = 35)

    #1st graph
    energy_types = ['Grid', 'Renewable', 'Storage']
    energy_values = np.random.dirichlet(np.ones(3), size=1)[0]*100
    axs[0,0].pie(energy_values, labels = energy_types, autopct='%1.1f%%', startangle = 90, colors = ['blue', 'red', 'green'])
    axs[0,0].set_title('Energy Sources', fontsize = 12)

    #2nd graph
    days=['mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    daily_consumption = np.random.uniform(10, 50, 7)
    axs[0,1].plot(days, daily_consumption, marker ='o', color = 'Blue', linewidth = 2, markersize = 8)
    axs[0,1].set_title('Daily Energy Consumption', fontsize = 12)
    axs[0,1].set_ylabel('Energy (kWh)')
    axs[0,1].grid(True, linestyle = '--', alpha=0.7)
 
    #3rd graph
    device_response = supabase.table('devices').select('device_id', 'device_name').eq('household_id', household_id).execute()
    device_names = [device['device_name'] for device in device_response.data]
    additional_sources = ['Heating', 'Cooling', 'Lightning', 'Cooking', 'Water Heating']
    sources = device_names + additional_sources
    emissions = np.random.uniform(5,30, len(sources))
    bars = axs[1,0].bar(sources, emissions, color=['#4ECDC4', '#45B7D1', '#FF6B6B', '#FF9F1C', '#F94144', '#F3722C'] * 2)
    axs[1,0].set_title('Carbon Emission by Household Devices and other sources', fontsize = 12) 
    axs[1,0].set_ylabel('CO2 (kg)')
    for bar in bars:
        height = bar.get_height()
        axs[1,0].text(bar.get_x() + bar.get_width()/2., height, f'{height:.1f}', ha ='center', va='bottom')

    #4th graph
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    trend = np.cumsum(np.random.uniform(1, 5, 6))
    axs[1, 1].plot(months, trend, marker='s', color='#4ECDC4', linewidth=2, markersize=8)
    axs[1, 1].set_title('Renewable Energy Trend', fontsize=12)
    axs[1, 1].set_ylabel('Renewable %')
    axs[1, 1].grid(True, linestyle='--', alpha=0.7)

    plt.tight_layout()
   
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer
'''
def plot_device_energy_pie_chart(device_energy_data):
    
    plt.figure(figsize=(6, 6))
    plt.pie(device_energy_data.values(), labels=device_energy_data.keys(), autopct='%1.1f%%', startangle=90, colors=plt.cm.Paired.colors)
    plt.title('Device Energy Consumption')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer
'''

def generate_pdf_report_with_graphs(household_id):
    
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    
    devices_response = supabase.table('devices').select('device_id', 'device_name').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in devices_response.data]
    device_name = devices_response.data[0]['device_name'] if devices_response.data else f"Device {device_ids}"
    

    rooms_response = supabase.table('rooms').select('room_id','room_name').eq('household_id', household_id).execute()
    room_ids = [room['room_id'] for room in rooms_response.data]
    room_name = rooms_response.data[0]['room_name'] if rooms_response.data else f"Room {room_ids}"
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    elements = []
    
    elements.append(Paragraph(f"Energy Report - {household_name}", styles['Title']))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 12))
    

    household_energy = generate_household_energy_data(household_id)
    
    summary_data = [
        ['Metric', 'Value'],
        ['Energy Consumed', f"{household_energy['energy_consumed']:.2f} kWh"],
        ['Energy Generated', f"{household_energy['energy_generated']:.2f} kWh"],
        ['Renewable %', f"{household_energy['renewable_percentage']:.2f}%"],
        ['Carbon Emission', f"{household_energy['carbon_emission']:.2f} kg CO2"]
    ]
    summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12))
    
    

    if room_ids:
        room_mapping = {room['room_id']: room['room_name'] for room in rooms_response.data} if rooms_response.data else {}

        room_data = [[ 'Room ID', 'Room Name','Energy Consumed (kWh)']]
        room_data.extend([
        [ str(room_id),str(room_mapping.get(room_id, f"Room {room_id}")), f"{generate_room_energy_data(room_id)['energy_consumed']:.2f}"] 
        for room_id in room_ids
    ])
    
    room_table = Table(room_data, colWidths=[2*inch, 2*inch, 2*inch])
    room_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ]))
    
    elements.append(Paragraph("Room Energy Consumption", styles['Heading3']))
    elements.append(room_table)
    elements.append(Spacer(1, 12))

    
    if device_ids:
        device_mapping = {device['device_id']: device['device_name'] for device in devices_response.data} if devices_response.data else {}
        device_data = [['Device ID', 'Device Name' , 'Energy Consumed (kWh)']]
        device_data.extend([
            [str(device_id), str(device_mapping.get(device_id, f"Device {device_id}")), f"{generate_device_energy_data(device_id)['energy_consumed']:.2f}"] 
            for device_id in device_ids
        ])
        
        device_table = Table(device_data, colWidths=[2*inch, 2*inch, 2*inch])
        device_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        elements.append(Paragraph("Device Energy Consumption", styles['Heading3']))
        elements.append(device_table)
        elements.append(Spacer(1, 12))
    
    '''
    device_energy = {
    device_id: generate_device_energy_data(device_id)['energy_consumed']
    for device_id in device_ids}
    device_chart_buffer = plot_device_energy_pie_chart(device_energy)
    elements.append(Image(device_chart_buffer, width=6.5*inch, height=6.5*inch))
    '''

    
    graphs_buffer = generate_energy_graphs(household_id)
    elements.append(Image(graphs_buffer, width=6.5*inch, height=6.5*inch))
    peak_times = {
    "Morning (6 AM - 10 AM)": 0.3,  
    "Afternoon (12 PM - 3 PM)": 0.2,  
    "Evening (6 PM - 10 PM)": 0.5  
}


    peak_time = random.choices(list(peak_times.keys()), weights=peak_times.values(), k=1)[0]


    insights = [
    f"Total energy consumption for {household_name}: {household_energy['energy_consumed']:.2f} kWh",
    f"Renewable energy contribution: {household_energy['renewable_percentage']:.2f}%",
    f"Peak energy consumption occurs during {peak_time}. Consider shifting some usage to off-peak hours to reduce costs." if 'peak_time' in locals() else "Consider shifting some usage to off-peak hours to reduce costs.",
    f"Your household's carbon emissions from energy use are estimated at {carbon_emissions:.2f} kg CO₂. Reducing grid reliance can lower this impact." if 'carbon_emissions' in locals() else "Reducing grid reliance can help lower your carbon footprint.",
    f"Battery storage efficiency is at {storage_efficiency:.2f}%. Ensure batteries are optimally charged to maximize savings." if 'storage_efficiency' in locals() else "Ensure battery storage is efficiently managed to maximize energy savings.",
    f"Your energy consumption is {comparison_percentage:.2f}% {comparison_trend} than similar households. Consider optimizing appliance usage." if 'comparison_percentage' in locals() else "Compare your energy consumption with similar households to find optimization opportunities.",
    f"You are utilizing {renewable_utilization:.2f}% of available renewable energy. Explore ways to increase reliance on renewables." if 'renewable_utilization' in locals() else "Increase renewable energy usage to lower grid dependency and reduce costs.",
    "Potential areas for energy efficiency improvement",
    "Recommended next steps for sustainable energy management"
]
    elements.append(Paragraph("Key Insights:", styles['Heading3']))
    for insight in insights:
        elements.append(Paragraph(f"• {insight}", styles['Normal']))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

@energy_retrieval.route('/energy_report', methods=['GET'])
def generate_comprehensive_energy_report():
    
    household_id = request.args.get('household_id')
   
    if not verify_id_exists('households', 'household_id', household_id):
        return jsonify({"error": "Household ID not found"}), 404
    
 
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    
    pdf_buffer = generate_pdf_report_with_graphs(household_id)
    
    return send_file(
        pdf_buffer, 
        mimetype='application/pdf', 
        as_attachment=True, 
        download_name=f'{household_name}_energy_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
    )


app.register_blueprint(energy_retrieval, url_prefix='/api')
if __name__ == '__main__':
    app.run(debug=True, port=5001)



