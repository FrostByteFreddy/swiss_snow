from snow_engine import SnowPredictor

def test_bourgouin():
    # 1. Standard Snow Profile (Temperature decreasing with height, all below 0)
    profile_snow = [
        {"z": 1000, "temp": -2.0},
        {"z": 1500, "temp": -5.0},
        {"z": 2000, "temp": -8.0}
    ]
    res_snow = SnowPredictor.determine_precip_type(
        temp_surface=-2.0, rh_surface=90, freezing_level=0, 
        elevation=1000, temp_850hpa=-5.0, profile=profile_snow
    )
    print(f"Snow Profile: {res_snow['type']} (Areas: {res_snow['areas']})")

    # 2. Freezing Rain Profile (Cold surface, Warm layer aloft)
    profile_fzra = [
        {"z": 500, "temp": -2.0},  # Surface
        {"z": 1000, "temp": 3.0},  # Warm layer
        {"z": 1500, "temp": -1.0}  # Cold aloft
    ]
    res_fzra = SnowPredictor.determine_precip_type(
        temp_surface=-2.0, rh_surface=95, freezing_level=1200, 
        elevation=500, temp_850hpa=3.0, profile=profile_fzra
    )
    print(f"FZRA Profile: {res_fzra['type']} (Areas: {res_fzra['areas']})")

    # 3. Ice Pellets Profile (Cold surface, Warm layer aloft, Deep cold layer aloft)
    profile_pl = [
        {"z": 500, "temp": -3.0},   # Surface
        {"z": 1000, "temp": 2.0},   # Melting layer (Small)
        {"z": 3000, "temp": -15.0}  # Refreezing layer (Deep)
    ]
    res_pl = SnowPredictor.determine_precip_type(
        temp_surface=-3.0, rh_surface=90, freezing_level=1200, 
        elevation=500, temp_850hpa=2.0, profile=profile_pl
    )
    print(f"PL Profile: {res_pl['type']} (Areas: {res_pl['areas']})")

    # 4. Standard Rain Profile
    profile_rain = [
        {"z": 0, "temp": 10.0},
        {"z": 1000, "temp": 5.0},
        {"z": 2000, "temp": -2.0}
    ]
    res_rain = SnowPredictor.determine_precip_type(
        temp_surface=10.0, rh_surface=80, freezing_level=1500, 
        elevation=0, temp_850hpa=7.0, profile=profile_rain
    )
    print(f"Rain Profile: {res_rain['type']} (Areas: {res_rain['areas']})")

if __name__ == "__main__":
    test_bourgouin()
