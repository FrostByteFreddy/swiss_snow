import React, { useState } from 'react';
import { Droplets, Thermometer, Mountain, Wind, ChevronLeft } from 'lucide-react';
import VerticalProfile from './VerticalProfile';

const WeatherCard = ({ hour }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex-none w-[340px] snap-center h-auto">
            <div className={`flex flex-col rounded-[3rem] p-8 glass-card border-white/10 transition-all duration-300 shadow-[0_0_80px_rgba(0,0,0,0.5)]`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                        <span className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-sky-400 mb-2">{hour.day}</span>
                        <span className="text-4xl font-black tracking-tighter">{hour.time}</span>
                    </div>
                    <div className="text-6xl drop-shadow-2xl">{hour.icon}</div>
                </div>

                {/* Main Temp */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <span className="text-8xl font-black tracking-tighter">{Math.round(hour.temp)}°</span>
                    <div className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">{hour.type}</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-6 mb-8">
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Droplets size={12} className="text-sky-400" /> Precip
                        </span>
                        <span className="text-xl font-black tracking-tighter text-white">{hour.precip > 0 ? `${hour.precip}mm` : 'Dry'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Thermometer size={12} className="text-rose-400" /> Wet Bulb
                        </span>
                        <span className={`text-xl font-black tracking-tighter ${hour.wet_bulb < 0.5 ? 'text-cyan-400' : 'text-rose-400'}`}>{hour.wet_bulb}°C</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Mountain size={12} className="text-slate-400" /> 0° Level
                        </span>
                        <span className="text-xl font-black tracking-tighter text-white">{hour.fl}m</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Wind size={12} className="text-emerald-400" /> Humidity
                        </span>
                        <span className="text-xl font-black tracking-tighter text-sky-400">{hour.humidity}%</span>
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center py-2 text-slate-500 hover:text-white transition-colors"
                >
                    {expanded ? <ChevronLeft className="rotate-90" size={20} /> : <ChevronLeft className="-rotate-90" size={20} />}
                </button>

                {/* Dropdown Content */}
                {expanded && (
                    <div className="pt-4 border-t border-white/5 mt-2">
                        <VerticalProfile profile={hour.profile} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherCard;
