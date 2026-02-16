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

def test_freezing_level():
    print("\n--- Testing Freezing Level refinements ---")
    
    # 1. Inversion Case: Highest isotherm should be picked
    # Crossing between 1000/1200 and again at 2000/2200
    profile_inv = [
        {"z": 500,  "temp": -2.0}, # Surface
        {"z": 1000, "temp": -1.0},
        {"z": 1200, "temp": 2.0},  # Crossing 1
        {"z": 1500, "temp": 3.0},
        {"z": 2000, "temp": 1.0},
        {"z": 2200, "temp": -1.0}  # Crossing 2 (HIGHEST)
    ]
    fl_inv = SnowPredictor.calculate_freezing_level(profile_inv, 500)
    print(f"Inversion FL (expected ~2100): {fl_inv}")

    # 2. Entirely Cold: Downward extrapolation
    profile_cold = [
        {"z": 500,  "temp": -2.0},
        {"z": 1000, "temp": -5.0},
        {"z": 2000, "temp": -12.0}
    ]
    fl_cold = SnowPredictor.calculate_freezing_level(profile_cold, 500)
    # Using lapse rate -0.0065 C/m: 500 - (-2 / -0.0065) = 500 - 307 = 193
    print(f"Entirely Cold FL (expected ~192): {fl_cold}")

    # 3. Surface at 0C
    profile_zero = [
        {"z": 500, "temp": 0.0},
        {"z": 1000, "temp": -3.0}
    ]
    fl_zero = SnowPredictor.calculate_freezing_level(profile_zero, 500)
    print(f"Surface at 0C FL (expected 500): {fl_zero}")

if __name__ == "__main__":
    test_bourgouin()
    test_freezing_level()
