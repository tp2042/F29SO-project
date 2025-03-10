
from flask import Flask, Blueprint, jsonify, request, send_file
from supabase import create_client, Client
from flask_cors import CORS
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
from reportlab.lib.enums import TA_CENTER 
from matplotlib import rcParams



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
    room_response = supabase.table('rooms').select('room_name').eq('room_id', room_id).execute()
    room_name = room_response.data[0]['room_name'] if room_response.data else f"Room {room_id}"
    random.seed(int(room_id) + int(datetime.now().strftime('%Y%m')))
    return{
        'room_id': room_id,
        'room_name': room_name, 
        'energy_consumed': round(random.uniform(1,100),2),
        'recorded_at': datetime.now().isoformat()
    }
      
def generate_device_energy_data(device_id):
    device_response = supabase.table('devices').select('device_name').eq('device_id', device_id).execute()
    device_name = device_response.data[0]['device_name'] if device_response.data else f"Device {device_id}"
    random.seed(int(device_id) + int(datetime.now().strftime('%Y%m')))
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
    
#-----------------------------------------------------ENERGY REPORT-----------------------------------------------------------------#

def generate_energy_graphs(household_id):
    plt.close('all')
    
    fig, axs = plt.subplots(3, 2, figsize=(30, 30))
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"

    current_month = datetime.now().strftime('%B %Y')
    fig.suptitle(f'Monthly Energy Analysis - {household_name} - {current_month}', fontsize=40)

    # 1st graph - Energy Sources Pie Chart 
    energy_types = ['Grid', 'Renewable', 'Storage']
    energy_values = np.random.dirichlet(np.ones(3), size=1)[0]*100
    wedges, texts, autotexts = axs[0, 0].pie(
        energy_values, 
        labels=energy_types, 
        autopct='%1.1f%%', 
        startangle=90, 
        colors=['#3498db', '#2ecc71', '#f39c12'],
        #explode=(0, 0.1, 0), 
       #shadow=True
    )
    axs[0, 0].set_title('Energy Sources Distribution', fontsize=20)
    
    renewable_pct = energy_values[1]
    if renewable_pct > 50:
        analysis = f"Great job! Renewable energy ({renewable_pct:.1f}%) is your primary source."
    elif renewable_pct > 30:
        analysis = f"Good progress. Renewable sources at {renewable_pct:.1f}%. Consider increasing further."
    else:
        analysis = f"Opportunity for improvement. Renewable sources only at {renewable_pct:.1f}%."
    axs[0, 0].text(0, -1.3, analysis, ha='center', va='center', fontsize=14, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 2nd graph - Daily Consumption 
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    daily_consumption = np.random.uniform(10, 50, 7)
    axs[0, 1].plot(days, daily_consumption, marker='o', color='#3498db', linewidth=3, markersize=12)
    axs[0, 1].set_title('Daily Energy Consumption Pattern', fontsize=20)
    axs[0, 1].set_ylabel('Energy (kWh)', fontsize=16)
    axs[0, 1].tick_params(axis='both', which='major', labelsize=14)
    axs[0, 1].grid(True, linestyle='--', alpha=0.7)
    
    
    weekday_avg = np.mean(daily_consumption[:5])
    weekend_avg = np.mean(daily_consumption[5:])
    diff_pct = ((weekend_avg - weekday_avg) / weekday_avg) * 100
    
    if diff_pct > 20:
        trend_analysis = f"Weekend consumption is {diff_pct:.1f}% higher than weekdays. Consider scheduling energy-intensive activities during weekdays."
    elif diff_pct < -20:
        trend_analysis = f"Weekday consumption is {-diff_pct:.1f}% higher than weekends. Your home appears more efficient during weekends."
    else:
        trend_analysis = f"Consumption is relatively balanced throughout the week (±{abs(diff_pct):.1f}%)."
    
    axs[0, 1].text(0.5, -0.2, trend_analysis, ha='center', va='center', transform=axs[0, 1].transAxes, fontsize=14, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 3rd graph - Carbon Emissions by devices 
    device_response = supabase.table('devices').select('device_id', 'device_name').eq('household_id', household_id).execute()
    device_names = [device['device_name'] for device in device_response.data]
    additional_sources = ['Heating', 'Cooling', 'Lighting', 'Cooking', 'Water Heating']  # Fixed "Lightning" to "Lighting"
    sources = device_names + additional_sources
    emissions = np.random.uniform(5, 30, len(sources))
    
    
    sorted_indices = np.argsort(emissions)[::-1]  
    sorted_sources = [sources[i] for i in sorted_indices]
    sorted_emissions = [emissions[i] for i in sorted_indices]
    
   
    colors = plt.cm.viridis(np.linspace(0, 0.8, len(sorted_sources)))
    bars = axs[1, 0].bar(sorted_sources, sorted_emissions, color=colors)
    axs[1, 0].set_title('Carbon Emission by Sources', fontsize=20)
    axs[1, 0].set_ylabel('CO2 (kg)', fontsize=16)
    axs[1, 0].tick_params(axis='x', rotation=45, labelsize=12)
    axs[1, 0].tick_params(axis='y', labelsize=14)
    
    for bar in bars:
        height = bar.get_height()
        axs[1, 0].text(bar.get_x() + bar.get_width()/2., height, f'{height:.1f}', ha='center', va='bottom', fontsize=12)
    
   
    top_emitter = sorted_sources[0]
    top_emission = sorted_emissions[0]
    total_emission = sum(sorted_emissions)
    axs[1, 0].text(0.5, -0.3, f"Highest emission source: {top_emitter} ({top_emission:.1f}kg, {top_emission/total_emission*100:.1f}% of total)", 
                ha='center', va='center', transform=axs[1, 0].transAxes, fontsize=14, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 4th graph - Renewable Trend 
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    trend = np.cumsum(np.random.uniform(1, 5, 6))
    
   
    forecast_months = ['Jul', 'Aug', 'Sep']
 
    last_increase = trend[-1] - trend[-2]
    forecasted_trend = [trend[-1] + (i+1)*last_increase for i in range(len(forecast_months))]
    
    all_months = months + forecast_months
    all_trend = np.append(trend, forecasted_trend)
    
   
    axs[1, 1].plot(months, trend, marker='o', color='#2ecc71', linewidth=3, markersize=10, label='Actual')
  
    axs[1, 1].plot(forecast_months, forecasted_trend, marker='o', color='#e74c3c', linewidth=3, markersize=10, linestyle='--', label='Projected')
    
    axs[1, 1].set_title('Renewable Energy Adoption Trend', fontsize=20)
    axs[1, 1].set_ylabel('Renewable Energy (%)', fontsize=16)
    axs[1, 1].tick_params(axis='both', which='major', labelsize=14)
    axs[1, 1].grid(True, linestyle='--', alpha=0.7)
    axs[1, 1].legend(fontsize=14)
    
   
    growth_rate = (trend[-1] - trend[0]) / trend[0] * 100
    if growth_rate > 30:
        future_analysis = f"Excellent renewable growth rate of {growth_rate:.1f}%. Projected to reach {forecasted_trend[-1]:.1f}% by {forecast_months[-1]}."
    elif growth_rate > 10:
        future_analysis = f"Good renewable growth rate of {growth_rate:.1f}%. Projected to reach {forecasted_trend[-1]:.1f}% by {forecast_months[-1]}."
    else:
        future_analysis = f"Slow renewable growth rate of {growth_rate:.1f}%. Consider additional renewable sources."
    
    axs[1, 1].text(0.5, -0.2, future_analysis, ha='center', va='center', transform=axs[1, 1].transAxes, fontsize=14, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 5th graph - Room Energy Distribution Pie Chart
    rooms_response = supabase.table('rooms').select('room_id', 'room_name').eq('household_id', household_id).execute()
    room_names = [room['room_name'] for room in rooms_response.data] if rooms_response.data else ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Others"]
    room_energy = np.random.dirichlet(np.ones(len(room_names)), size=1)[0]*100
    
    sorted_indices = np.argsort(room_energy)[::-1]
    sorted_room_names = [room_names[i] for i in sorted_indices]
    sorted_room_energy = [room_energy[i] for i in sorted_indices]
    
    colors = plt.cm.tab10(np.linspace(0, 1, len(sorted_room_names)))
    wedges, texts, autotexts = axs[2, 0].pie(
        sorted_room_energy, 
        labels=sorted_room_names, 
        autopct='%1.1f%%', 
        startangle=90, 
        colors=colors,
        #explode=[0.05] * len(sorted_room_names),  
       # shadow=True
    )
    axs[2, 0].set_title('Room Energy Distribution', fontsize=20)
    
   
    top_room = sorted_room_names[0]
    top_consumption = sorted_room_energy[0]
    if top_consumption > 40:
        room_analysis = f"{top_room} consumes {top_consumption:.1f}% of total energy. Consider optimizing appliances in this room."
    else:
        room_analysis = f"Energy is relatively well-distributed. {top_room} is the highest at {top_consumption:.1f}%."
    
    axs[2, 0].text(0, -1.3, room_analysis, ha='center', va='center', fontsize=14, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    # 6th graph - Hourly Consumption Pattern
    hours = np.arange(0, 24)
    hourly_pattern = 15 + 10 * np.sin((hours - 6) * np.pi / 12)  
    hourly_pattern += np.random.normal(0, 2, 24) 
    
    axs[2, 1].plot(hours, hourly_pattern, '-', color='#9b59b6', linewidth=3)
    axs[2, 1].fill_between(hours, 0, hourly_pattern, alpha=0.3, color='#9b59b6')
    axs[2, 1].set_title('24-Hour Energy Consumption Pattern', fontsize=20)
    axs[2, 1].set_xlabel('Hour of Day', fontsize=16)
    axs[2, 1].set_ylabel('Energy Consumption (kWh)', fontsize=16)
    axs[2, 1].set_xticks(np.arange(0, 24, 3))
    axs[2, 1].tick_params(axis='both', which='major', labelsize=14)
    axs[2, 1].grid(True, linestyle='--', alpha=0.7)
    
   
    peak_hour = np.argmax(hourly_pattern)
    off_peak_hour = np.argmin(hourly_pattern)
    
    peak_hour_formatted = f"{peak_hour}:00" if peak_hour < 12 else f"{peak_hour-12 if peak_hour > 12 else 12}:00 PM"
    off_peak_hour_formatted = f"{off_peak_hour}:00" if off_peak_hour < 12 else f"{off_peak_hour-12 if off_peak_hour > 12 else 12}:00 PM"
    
    hourly_analysis = f"Peak usage at {peak_hour_formatted} ({hourly_pattern[peak_hour]:.1f} kWh). Lowest at {off_peak_hour_formatted} ({hourly_pattern[off_peak_hour]:.1f} kWh)."
    recommendation = "Consider shifting energy-intensive activities to off-peak hours to reduce costs and grid load."
    
    axs[2, 1].text(0.5, -0.2, hourly_analysis + "\n" + recommendation, ha='center', va='center', transform=axs[2, 1].transAxes, fontsize=14, bbox=dict(facecolor='#f0f0f0', alpha=0.5))

    plt.tight_layout(rect=[0, 0, 1, 0.97]) 
   
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

rcParams.update({
    'font.family': 'DejaVu Sans',  
    'font.size': 12, 
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'xtick.labelsize': 11,
    'ytick.labelsize': 11,
})


def generate_room_energy_distribution_chart(household_id):
    plt.figure(figsize=(5, 5)) 
    
    rooms_response = supabase.table('rooms').select('room_id', 'room_name').eq('household_id', household_id).execute()
    room_names = [room['room_name'] for room in rooms_response.data] if rooms_response.data else ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Others"]
    
   
    room_energy_data = {room: np.random.uniform(5, 30) for room in room_names}

   
    sorted_room_energy_data = dict(sorted(room_energy_data.items(), key=lambda item: item[1], reverse=True))

    colors = plt.cm.viridis(np.linspace(0, 0.8, len(sorted_room_energy_data)))
    
    plt.pie(
        sorted_room_energy_data.values(), 
        labels=sorted_room_energy_data.keys(), 
        autopct='%1.1f%%', 
        startangle=140, 
        colors=colors,
        wedgeprops={'edgecolor': 'black', 'linewidth': 1}
    )
    
    plt.title('Room Energy Distribution', fontsize=14, fontweight='bold')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_device_energy_pie_chart(device_energy_data):
    plt.figure(figsize=(5, 5))  

    
    sorted_device_energy = dict(sorted(device_energy_data.items(), key=lambda item: item[1], reverse=True))

    colors = plt.cm.plasma(np.linspace(0, 0.8, len(sorted_device_energy)))
    
   
    wedges, texts, autotexts = plt.pie(
        sorted_device_energy.values(), 
        labels=sorted_device_energy.keys(), 
        autopct='%1.1f%%', 
        startangle=140, 
        colors=colors,
        wedgeprops={'edgecolor': 'black', 'linewidth': 1}
    )

    
    for autotext in autotexts:
        autotext.set_fontsize(5)
        autotext.set_fontweight('bold')

    plt.title('Device Energy Consumption', fontsize=14, fontweight='bold')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_pdf_report_with_graphs(household_id):
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    household_energy = generate_household_energy_data(household_id)

    devices_response = supabase.table('devices').select('device_id', 'device_name').eq('household_id', household_id).execute()
    device_ids = [device['device_id'] for device in devices_response.data]
    device_names = {device['device_id']: device['device_name'] for device in devices_response.data} if devices_response.data else {}

    rooms_response = supabase.table('rooms').select('room_id','room_name').eq('household_id', household_id).execute()
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
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2980b9')),  # Header background
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor('#f0f0f0')),  # Grey left column
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ])

    for i in range(1, len(summary_data)):
        if i % 2 == 0:
            table_style.add('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f9f9f9'))  # Light grey

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
            ('ALIGN', (1,0), (2,-1), 'CENTER'),  # Center align numeric columns
            ('ALIGN', (0,0), (0,-1), 'LEFT'),  # Left align room names
            ('ALIGN', (3,0), (3,-1), 'LEFT'),  # Left align recommendations
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
    
    graphs_buffer = generate_energy_graphs(household_id)
    elements.append(Image(graphs_buffer, width=7.5*inch, height=7.5*inch))
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

@energy_retrieval.route('/energy_report', methods=['GET'])
def generate_comprehensive_energy_report():
    household_id = request.args.get('household_id')
   
    if not verify_id_exists('households', 'household_id', household_id):
        return jsonify({"error": "Household ID not found"}), 404
    
    household_response = supabase.table('households').select('household_name').eq('household_id', household_id).execute()
    household_name = household_response.data[0]['household_name'] if household_response.data else f"Household {household_id}"
    
    #generate monthly report 
    current_month = datetime.now().strftime('%B_%Y')
    pdf_buffer = generate_pdf_report_with_graphs(household_id)
    
    return send_file(
        pdf_buffer, 
        mimetype='application/pdf', 
        as_attachment=True, 
        download_name=f'{household_name}_monthly_energy_report_{current_month}.pdf'
    )



app.register_blueprint(energy_retrieval, url_prefix='/api')
if __name__ == '__main__':
    app.run(debug=True, port=5001)


