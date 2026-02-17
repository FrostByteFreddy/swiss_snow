import React from 'react';
import { Droplets, Thermometer, Mountain, Wind } from 'lucide-react';
import VerticalProfile from './VerticalProfile';

const WeatherCard = ({ hour }) => {
    return (
        <div className="flex-none w-full min-w-full snap-center h-full flex flex-col items-center justify-start pt-36 pb-8 px-6 relative">
            {/* Main Content Container */}
            <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6">

                {/* Time & Icon */}
                <div className="flex flex-col items-center">
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-sky-400 mb-2">{hour.day}</span>
                    <div className="text-8xl drop-shadow-2xl mb-2">{hour.icon}</div>
                    <span className="text-6xl font-black tracking-tighter">{hour.time}</span>
                </div>

                {/* Main Temp & Type */}
                <div className="flex flex-col items-center">
                    <span className="text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        {Math.round(hour.temp)}°
                    </span>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">{hour.type}</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 w-full">
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <Droplets size={16} className="text-sky-400 mb-1" />
                        <span className="text-[0.6rem] font-bold text-slate-500 uppercase">Precip</span>
                        <span className="text-lg font-bold text-white leading-none">{hour.precip > 0 ? `${hour.precip}` : '0'}</span>
                        <span className="text-[0.5rem] text-slate-600">mm</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <Thermometer size={16} className="text-rose-400 mb-1" />
                        <span className="text-[0.6rem] font-bold text-slate-500 uppercase">W.Bulb</span>
                        <span className={`text-lg font-bold leading-none ${hour.wet_bulb < 0.5 ? 'text-cyan-400' : 'text-rose-400'}`}>{hour.wet_bulb}</span>
                        <span className="text-[0.5rem] text-slate-600">°C</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <Mountain size={16} className="text-slate-400 mb-1" />
                        <span className="text-[0.6rem] font-bold text-slate-500 uppercase">0° Lvl</span>
                        <span className="text-lg font-bold text-white leading-none">{hour.fl}</span>
                        <span className="text-[0.5rem] text-slate-600">m</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <Wind size={16} className="text-emerald-400 mb-1" />
                        <span className="text-[0.6rem] font-bold text-slate-500 uppercase">Humid</span>
                        <span className="text-lg font-bold text-white leading-none">{hour.humidity}</span>
                        <span className="text-[0.5rem] text-slate-600">%</span>
                    </div>
                </div>

                {/* Vertical Profile (Always Visible) */}
                {hour.viz && (
                    <div className="w-full mt-4 flex flex-col">
                        <span className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 text-center">Vertical Atmosphere</span>
                        <VerticalProfile viz={hour.viz} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherCard;
