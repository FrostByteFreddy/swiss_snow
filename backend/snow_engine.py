import math

class SnowPredictor:
    @staticmethod
    def calculate_wet_bulb(temp_air: float, relative_humidity: float) -> float:
        """
        Approximates Wet-Bulb Temperature (Tw) using the Stull (2011) formula.
        
        Args:
            temp_air (float): Air temperature in Celsius.
            relative_humidity (float): Relative humidity in %.
            
        Returns:
            float: Wet-bulb temperature in Celsius.
        """
        T = temp_air
        RH = relative_humidity
        
        tw = (T * math.atan(0.151977 * (RH + 8.313659)**0.5) +
              math.atan(T + RH) - math.atan(RH - 1.676331) +
              0.00391838 * (RH**1.5) * math.atan(0.023101 * RH) - 4.686035)
        
        return tw

    @staticmethod
    def determine_precip_type(
        temp_surface: float, 
        rh_surface: float, 
        freezing_level: float, 
        elevation: float,
        temp_850hpa: float
    ) -> dict:
        """
        Determines the type of precipitation risk based on meteorological parameters.
        
        Returns:
            dict: {
                "type": "Snow" | "Rain" | "Freezing Rain" | "Mix",
                "risk_level": "None" | "Low" | "High",
                "icon": emoji,
                "wet_bulb": float
            }
        """
        wet_bulb = SnowPredictor.calculate_wet_bulb(temp_surface, rh_surface)
        
        # Inversion Check for Freezing Rain
        # If surface is below freezing but air aloft (850hPa ~ 1500m) is warm
        # Note: 850hPa is roughly 1450-1500m. If station is below 1000m and T_s < 0 and T_850 > 0...
        is_inversion = False
        if elevation < 1000 and temp_surface < 0 and temp_850hpa > 0:
            is_inversion = True
            
        result = {
            "type": "Rain",
            "risk_level": "High" if is_inversion else "None", # Risk of dangerous conditions
            "icon": "💧",
            "wet_bulb": wet_bulb,
            "is_inversion": is_inversion
        }

        if is_inversion:
             result["type"] = "Freezing Rain"
             result["icon"] = "⚠️"
             return result

        # Snow Logic
        # 1. Wet Bulb Criteria
        if wet_bulb < 0.5:
            result["type"] = "Snow"
            result["icon"] = "❄️"
            if temp_surface > 0:
                 result["type"] = "Wet Snow"
                 result["icon"] = "🌨️"
        
        # 2. Isotherm Criteria (Fallback/Reinforcement)
        # If we are comfortably above the freezing level (minus buffer)
        elif elevation > (freezing_level - 300):
             result["type"] = "Snow/Mix"
             result["icon"] = "🌨️"
             
        return result
