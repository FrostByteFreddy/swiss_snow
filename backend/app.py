from flask import Flask, request, jsonify
from flask_cors import CORS
from geo import get_location_data
from weather import get_weather_forecast
from snow_engine import SnowPredictor
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

@app.route("/api/predict", methods=["POST"])
def predict_api():
    data = request.json
    if not data or "location" not in data:
        return jsonify({"error": "Location query is required"}), 400
    
    location_query = data.get("location")
    manual_elevation = data.get("elevation")
    
    if manual_elevation and manual_elevation != '':
        try:
            manual_elevation = float(manual_elevation)
        except ValueError:
            manual_elevation = None
    else:
        manual_elevation = None

    # 1. Geocoding
    location_data = get_location_data(location_query)
    if not location_data:
        return jsonify({"error": f"Could not find location '{location_query}'"}), 404


    # 2. Weather
    weather_data = get_weather_forecast(location_data['lat'], location_data['lon'])
    if not weather_data:
        return jsonify({"error": "Could not fetch weather data"}), 500

    # 3. Process Data & Apply Manual Elevation if needed
    base_elevation = weather_data.get('elevation', 0)
    display_elevation = manual_elevation if manual_elevation is not None else base_elevation

    if manual_elevation is not None:
        diff_m = manual_elevation - base_elevation
        temp_adjustment = (diff_m / 100.0) * -0.65
        
        if "current" in weather_data:
            weather_data["current"]["temperature_2m"] = round(weather_data["current"]["temperature_2m"] + temp_adjustment, 1)
        
        if "hourly" in weather_data:
            hourly_temps = weather_data["hourly"].get("temperature_2m", [])
            weather_data["hourly"]["temperature_2m"] = [round(t + temp_adjustment, 1) for t in hourly_temps]

    # Hourly data processing
    hourly = weather_data.get("hourly", {})
    all_times = hourly.get("time", [])
    
    # Find start index for current hour in Zurich timezone
    now_zurich = datetime.now(ZoneInfo("Europe/Zurich"))
    current_hour_iso = now_zurich.strftime("%Y-%m-%dT%H:00")
    start_index = 0
    for idx, t in enumerate(all_times):
        if t >= current_hour_iso:
            start_index = idx
            break
            
    # Slice next 24 hours
    end_index = start_index + 24
    
    times = all_times[start_index:end_index]
    temps = hourly.get("temperature_2m", [])[start_index:end_index]
    rhs = hourly.get("relative_humidity_2m", [])[start_index:end_index]
    precips = hourly.get("precipitation", [])[start_index:end_index]
    freezing_levels = hourly.get("freezing_level_height", [])[start_index:end_index]
    temps_850 = hourly.get("temperature_850hPa", [])[start_index:end_index]
    cloud_covers = hourly.get("cloud_cover", [])[start_index:end_index]
    is_day_list = hourly.get("is_day", [])[start_index:end_index]

    hourly_data = []
    today_day = now_zurich.day
    
    for i, time_str in enumerate(times):
        dt = datetime.fromisoformat(time_str)
        temp = temps[i]
        rh = rhs[i]
        precip = precips[i]
        fl = freezing_levels[i]
        t850 = temps_850[i]
        cloud_cover = cloud_covers[i] if i < len(cloud_covers) else 0
        is_day = is_day_list[i] if i < len(is_day_list) else 1

        precip_info = SnowPredictor.determine_precip_type(temp, rh, fl, display_elevation, t850)
        
        # Icon Logic
        condition_icon = precip_info['icon']
        if precip == 0:
            if cloud_cover > 50:
                condition_icon = "☁️" 
            else:
                condition_icon = "☀️" if is_day else "🌙"
        
        day_label = "Today" if dt.day == today_day else "Tomorrow"
        
        hourly_data.append({
            "time": dt.strftime("%H:%M"),
            "day": day_label,
            "temp": temp,
            "humidity": rh,
            "wet_bulb": round(precip_info['wet_bulb'], 1),
            "precip": precip if precip > 0 else 0,
            "fl": int(fl),
            "icon": condition_icon,
            "type": precip_info['type'],
             "wb_class": "wb-freezing" if precip_info['wet_bulb'] < 0.5 else ("wb-cold" if precip_info['wet_bulb'] < 1.0 else "wb-warm")
        })

    return jsonify({
        "location": {
            "display_name": location_data["display_name"],
            "lat": location_data["lat"],
            "lon": location_data["lon"]
        },
        "elevation": int(display_elevation),
        "hourly_data": hourly_data
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)
