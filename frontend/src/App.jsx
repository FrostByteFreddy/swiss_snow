import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Wind, History, ChevronLeft, ArrowRight, Edit3, Droplets, Thermometer, Mountain } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';

function SnowApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('snow_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
    const activeHour = data.hourly_data[activeIndex];
    return (
      <div className="flex h-screen w-full flex-col bg-slate-950 overflow-hidden">
        {/* Horizontal Scroll Section */}
        <section className="flex-1 flex flex-col justify-start overflow-hidden pt-12 pb-4">
          <div className="flex overflow-x-auto gap-6 px-8 pb-12 snap-x scrollbar-hide h-full items-center">
            {data.hourly_data.map((hour, i) => (
              <div key={i} className="flex-none w-[320px] snap-center h-[85%] max-h-[600px]">
                <div className={`flex flex-col rounded-[4rem] p-10 glass-card border-white/10 h-full transition-all duration-300 justify-between shadow-[0_0_80px_rgba(0,0,0,0.5)]`}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-sky-400 mb-2">{hour.day}</span>
                      <span className="text-4xl font-black tracking-tighter">{hour.time}</span>
                    </div>
                    <div className="text-6xl drop-shadow-2xl">{hour.icon}</div>
                  </div>

                  <div className="my-8">
                    <span className="text-8xl font-black tracking-tighter">{Math.round(hour.temp)}°</span>
                    <div className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">{hour.type}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <Droplets size={12} className="text-sky-400" /> Precip
                      </span>
                      <span className="text-2xl font-black tracking-tighter text-white">{hour.precip > 0 ? `${hour.precip}mm` : 'Dry'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <Thermometer size={12} className="text-rose-400" /> Wet Bulb
                      </span>
                      <span className={`text-2xl font-black tracking-tighter ${hour.wet_bulb < 0.5 ? 'text-cyan-400' : 'text-rose-400'}`}>{hour.wet_bulb}°C</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <Mountain size={12} className="text-slate-400" /> 0° Level
                      </span>
                      <span className="text-2xl font-black tracking-tighter text-white">{hour.fl}m</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <Wind size={12} className="text-emerald-400" /> Humidity
                      </span>
                      <span className="text-2xl font-black tracking-tighter text-sky-400">{hour.humidity}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location Edit Footer */}
        <footer className="w-full max-w-lg mx-auto p-8 pb-10 bg-slate-900/40 backdrop-blur-3xl border-t border-white/5 shrink-0 flex items-center justify-between rounded-t-[4rem] shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col">
            <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">Atmospheric Node</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter truncate max-w-[240px] uppercase">{data.location.display_name.split(',')[0]}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-sky-500/50"></div>
              <span className="text-[0.7rem] font-black text-sky-400 uppercase tracking-widest">{data.elevation}m</span>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-xl active:scale-95 group"
          >
            <Edit3 size={22} className="text-slate-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-slate-950 p-8 pt-20">
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
