import requests

def get_weather_forecast(lat: float, lon: float) -> dict:
    """
    Fetches weather forecast from Open-Meteo API.
    
    Args:
        lat (float): Latitude.
        lon (float): Longitude.
        
    Returns:
        dict: The JSON response from Open-Meteo API containing current and hourly forecast.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "freezing_level_height",
            "temperature_850hPa",
            "temperature_700hPa",
            "is_day",
            "surface_pressure",
            "temperature_1000hPa", "temperature_975hPa", "temperature_950hPa", "temperature_925hPa", "temperature_900hPa", "temperature_875hPa", "temperature_850hPa", "temperature_825hPa", "temperature_800hPa", "temperature_775hPa", "temperature_750hPa", "temperature_700hPa", "temperature_650hPa", "temperature_600hPa", "temperature_550hPa", "temperature_500hPa",
            "relative_humidity_1000hPa", "relative_humidity_975hPa", "relative_humidity_950hPa", "relative_humidity_925hPa", "relative_humidity_900hPa", "relative_humidity_875hPa", "relative_humidity_850hPa", "relative_humidity_825hPa", "relative_humidity_800hPa", "relative_humidity_775hPa", "relative_humidity_750hPa", "relative_humidity_700hPa", "relative_humidity_650hPa", "relative_humidity_600hPa", "relative_humidity_550hPa", "relative_humidity_500hPa",
            "geopotential_height_1000hPa", "geopotential_height_975hPa", "geopotential_height_950hPa", "geopotential_height_925hPa", "geopotential_height_900hPa", "geopotential_height_875hPa", "geopotential_height_850hPa", "geopotential_height_825hPa", "geopotential_height_800hPa", "geopotential_height_775hPa", "geopotential_height_750hPa", "geopotential_height_700hPa", "geopotential_height_650hPa", "geopotential_height_600hPa", "geopotential_height_550hPa", "geopotential_height_500hPa"
        ]),
        "current": ",".join([
            "temperature_2m",
            "weather_code",
            "is_day"
        ]),
        "timezone": "Europe/Zurich",
        "forecast_days": 2, # Fetch 2 days to ensure we have next 24h from now
        "models": "icon_seamless" # Uses high-res Swiss ICON models (1km/2.2km)
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None
