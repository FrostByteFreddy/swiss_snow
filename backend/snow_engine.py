import math

class SnowPredictor:
    @staticmethod
    def calculate_wet_bulb(temp_air: float, relative_humidity: float, pressure: float = 1013.25) -> float:
        """
        Calculates Wet-Bulb Temperature (Tw) using a high-precision iterative 
        psychrometric method. More accurate than Stull, especially near 0°C.
        
        Args:
            temp_air (float): Air temperature in Celsius.
            relative_humidity (float): Relative humidity in %.
            pressure (float): Surface pressure in hPa.
            
        Returns:
            float: Wet-bulb temperature in Celsius.
        """
        if relative_humidity >= 99.9:
            return temp_air
            
        # Saturation vapor pressure at dry bulb (Bolton 1980)
        es = 6.112 * math.exp(17.67 * temp_air / (temp_air + 243.5))
        e = es * (relative_humidity / 100.0)
        
        # Iteratively solve the psychrometric equation:
        # e = es(Tw) - A * P * (T - Tw)
        # using the Newton-Raphson method.
        # A is the psychrometric constant (standard: 0.000661 K^-1)
        A = 0.000661
        tw = temp_air
        
        for _ in range(10):
            es_tw = 6.112 * math.exp(17.67 * tw / (tw + 243.5))
            des_dtw = es_tw * 17.67 * 243.5 / (tw + 243.5)**2
            
            f = es_tw - A * pressure * (temp_air - tw) - e
            df = des_dtw + A * pressure
            
            tw_new = tw - f / df
            if abs(tw_new - tw) < 0.001:
                return tw_new
            tw = tw_new
            
        return tw

    @staticmethod
    def determine_precip_type(
        temp_surface: float, 
        rh_surface: float, 
        freezing_level: float, 
        elevation: float,
        temp_850hpa: float,
        pressure: float = 1013.25
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
        wet_bulb = SnowPredictor.calculate_wet_bulb(temp_surface, rh_surface, pressure)
        
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
