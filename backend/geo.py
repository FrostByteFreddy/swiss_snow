import requests

def get_location_data(query: str) -> dict:
    """
    Fetches location data from Nominatim (OpenStreetMap) API.
    
    Args:
        query (str): The location name or coordinates (e.g., "Andermatt" or "46.63, 8.59").
        
    Returns:
        dict: A dictionary containing 'lat', 'lon', 'name', 'display_name'.
              Returns None if location is not found or error occurs.
    """
    try:
        # Check if query is likely coordinates
        if "," in query and any(char.isdigit() for char in query):
            # Simple coordinate parsing logic could be added here if needed,
            # but Nominatim search also handles "lat, lon" strings often.
            pass

        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": query,
            "format": "json",
            "limit": 1,
            "countrycodes": "ch" # Limit to Switzerland
        }
        headers = {
            "User-Agent": "SwissSnowPredictor/1.0" # Required by Nominatim policy
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if not data:
            return None
            
        location = data[0]
        return {
            "lat": float(location["lat"]),
            "lon": float(location["lon"]),
            "name": location["name"],
            "display_name": location["display_name"]
        }
        
    except requests.RequestException as e:
        print(f"Error fetching location data: {e}")
        return None
