import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Wind, History, ArrowRight, Edit3 } from 'lucide-react';
import WeatherCard from './components/WeatherCard';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001').replace(/\/$/, '');

function SnowApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('snow_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);
  const [activeHourIndex, setActiveHourIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const locationParam = searchParams.get('location');
  const elevationParam = searchParams.get('elevation');

  useEffect(() => {
    if (locationParam) {
      handleSearch(locationParam, elevationParam);
    } else {
      setData(null);
    }
  }, [locationParam, elevationParam]);


  const handleSearch = async (location, elevation = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/api/predict`, {
        location,
        elevation: elevation || null
      });
      setData(res.data);

      // Update Local History
      setHistory(prev => {
        const newEntry = { location, elevation: elevation || null };
        const exists = prev.find(h => h.location.toLowerCase() === location.toLowerCase());
        const filtered = exists ? prev.filter(h => h.location.toLowerCase() !== location.toLowerCase()) : prev;
        const updated = [newEntry, ...filtered].slice(0, 5);
        localStorage.setItem('snow_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      setActiveHourIndex(index);
    }
  };

  const [formLocation, setFormLocation] = useState(locationParam || '');
  const [formElevation, setFormElevation] = useState(elevationParam || '');

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500 border-t-transparent shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.5em] text-sky-400 animate-pulse">Atmospheric Scan</p>
        </div>
      </div>
    );
  }

  if (data) {
    // Generate Timeline labels (Every 3 hours or so to avoid clutter)
    const totalHours = data.hourly_data.length;
    const progress = (activeHourIndex / (totalHours - 1)) * 100;

    return (
      <div className="flex h-[100svh] w-full flex-col bg-slate-950 overflow-hidden relative">

        {/* Fixed Top Bar / Timeline */}
        <div className="absolute top-0 left-0 w-full z-50 pt-8 pb-4 px-6 bg-gradient-to-b from-slate-950 to-transparent">
          {/* Header Info */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSearchParams({})}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Edit3 size={14} />
              <span className="text-[0.6rem] font-black uppercase tracking-widest">{data.location.display_name.split(',')[0]}</span>
            </button>
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-sky-500">{data.elevation}m</span>
          </div>

          {/* Timeline Progress Bar */}
          <div className="relative w-full h-1 bg-white/10 rounded-full mb-2">
            <div
              className="absolute top-0 left-0 h-full bg-sky-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[0.5rem] font-black uppercase tracking-widest text-slate-500">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
          </div>
        </div>

        {/* Full Screen Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto snap-x snap-mandatory flex scrollbar-hide w-full h-full"
        >
          {data.hourly_data.map((hour, i) => (
            <WeatherCard key={i} hour={hour} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100svh] w-full flex-col items-center bg-slate-950 p-8 pt-20 overflow-y-auto">
      <header className="mb-16 text-center">
        <h1 className="text-7xl font-black tracking-tighter leading-none mb-4 shadow-sky-500">Swiss<br /><span className="text-sky-400">Snow</span></h1>
        <p className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-slate-600">Atmospheric Data Hub</p>
      </header>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchParams({ location: formLocation, elevation: formElevation });
          }}
          className="space-y-4 glass-card p-10 rounded-[3rem]"
        >
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400" size={20} />
            <input
              type="text"
              placeholder="Search Peak..."
              className="input-field"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Wind className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400" size={20} />
            <input
              type="number"
              placeholder="Elevation (m)"
              className="input-field"
              value={formElevation}
              onChange={(e) => setFormElevation(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3 mt-4">
            Predict Forecast <ArrowRight size={20} />
          </button>
        </form>

        {error && <p className="text-center text-xs font-black uppercase tracking-widest text-rose-400 animate-pulse">{error}</p>}

        {history.length > 0 && (
          <div className="space-y-6 pt-10 px-4">
            <h3 className="flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.4em] text-slate-700">
              <History size={14} /> Historical Scans
            </h3>
            <div className="flex flex-col gap-4">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setSearchParams({ location: h.location, elevation: h.elevation })}
                  className="glass-card flex flex-col p-6 text-left group hover:border-sky-500/40 rounded-3xl"
                >
                  <span className="text-lg font-black tracking-tighter group-hover:text-sky-400 transition-colors">{h.location}</span>
                  <span className="text-[0.6rem] font-bold text-slate-600 uppercase tracking-widest">{h.elevation}m ASL</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto py-20 text-[0.5rem] font-black uppercase tracking-[0.5em] text-slate-800">
        Powered by Open-Meteo & Nominatim
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SnowApp />} />
      </Routes>
    </BrowserRouter>
  );
}
