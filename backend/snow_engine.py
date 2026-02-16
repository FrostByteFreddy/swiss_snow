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
    def calculate_bourgouin_areas(profile: list) -> dict:
        """
        Calculates Positive (Melting) and Negative (Refreezing) areas in the 
        atmospheric column using the Bourgouin (2000) method logic.
        
        Args:
            profile (list): List of dicts with {"z": height_m, "temp": temp_c}
            
        Returns:
            dict: {"positive": float, "negative": float, "layers": list}
        """
        if not profile or len(profile) < 2:
            return {"positive": 0, "negative": 0, "layers": []}
            
        # Ensure profile is sorted by height
        sorted_profile = sorted(profile, key=lambda x: x['z'])
        
        pos_area = 0.0
        neg_area = 0.0
        
        for i in range(len(sorted_profile) - 1):
            p1 = sorted_profile[i]
            p2 = sorted_profile[i+1]
            
            dz = p2['z'] - p1['z']
            if dz <= 0: continue
            
            t1 = p1['temp']
            t2 = p2['temp']
            
            # Simple trapezoidal integration for area
            # A = (T1 + T2) / 2 * dz
            # But we need to handle crossing the 0C line
            if t1 >= 0 and t2 >= 0:
                pos_area += (t1 + t2) / 2.0 * dz
            elif t1 <= 0 and t2 <= 0:
                neg_area += abs((t1 + t2) / 2.0 * dz)
            else:
                # Crosses 0 line. Find the crossover point z_cross
                # T(z) = T1 + (T2-T1)/(z2-z1) * (z-z1) = 0
                # z_cross = z1 - T1 * (z2-z1) / (T2-T1)
                fraction = abs(t1) / (abs(t1) + abs(t2))
                dz_1 = dz * fraction
                dz_2 = dz - dz_1
                
                if t1 > 0:
                    pos_area += (t1 / 2.0) * dz_1
                    neg_area += abs(t2 / 2.0) * dz_2
                else:
                    neg_area += abs(t1 / 2.0) * dz_1
                    pos_area += (t2 / 2.0) * dz_2
                    
        return {"positive": round(pos_area, 1), "negative": round(neg_area, 1)}

    @staticmethod
    def determine_precip_type(
        temp_surface: float, 
        rh_surface: float, 
        freezing_level: float, 
        elevation: float,
        temp_850hpa: float,
        pressure: float = 1013.25,
        profile: list = None
    ) -> dict:
        """
        Determines the type of precipitation risk based on meteorological parameters.
        Uses Bourgouin method if vertical profile is available.
        """
        wet_bulb = SnowPredictor.calculate_wet_bulb(temp_surface, rh_surface, pressure)
        
        # Default results
        result = {
            "type": "Rain",
            "risk_level": "None",
            "icon": "💧",
            "wet_bulb": wet_bulb,
            "areas": {"pos": 0, "neg": 0}
        }

        # Bourgouin Analysis if profile available
        if profile:
            areas = SnowPredictor.calculate_bourgouin_areas(profile)
            result["areas"] = {"pos": areas['positive'], "neg": areas['negative']}
            
            pos = areas['positive']
            neg = areas['negative']
            
            # Thresholds in m*degC (approximate)
            # pos < 50: Snow (not enough energy to melt)
            # pos > 300: Rain (likely complete melting)
            
            if pos < 100:
                result["type"] = "Snow"
                result["icon"] = "❄️"
                if temp_surface > 0:
                    result["type"] = "Wet Snow"
                    result["icon"] = "🌨️"
            else:
                # Melting has occurred. Will it refreeze?
                # neg > 400 or neg > 0.5 * pos: Ice Pellets (refrozen)
                if neg > 400 or (neg > 150 and neg > 0.3 * pos):
                    result["type"] = "Ice Pellets"
                    result["icon"] = "🧊"
                elif temp_surface < 0:
                    result["type"] = "Freezing Rain"
                    result["icon"] = "⚠️"
                    result["risk_level"] = "High"
                elif pos < 300:
                    result["type"] = "Mix"
                    result["icon"] = "🌨️"
                else:
                    result["type"] = "Rain"
                    result["icon"] = "💧"
            
            return result

        # Fallback to simple logic if no profile
        is_inversion = elevation < 1000 and temp_surface < 0 and temp_850hpa > 0
        if is_inversion:
             result["type"] = "Freezing Rain"
             result["icon"] = "⚠️"
             result["risk_level"] = "High"
             return result

        if wet_bulb < 0.5:
            result["type"] = "Snow"
            result["icon"] = "❄️"
            if temp_surface > 0:
                 result["type"] = "Wet Snow"
                 result["icon"] = "🌨️"
        elif elevation > (freezing_level - 300):
             result["type"] = "Snow/Mix"
             result["icon"] = "🌨️"
             
        return result
