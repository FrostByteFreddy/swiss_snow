import React from 'react';

const VerticalProfile = ({ profile }) => {
    if (!profile || profile.length < 2) return null;

    // Filter profile to show relevant range (Surface to Freezing Level + Buffer)
    // Find the altitude where temp crosses 0 or is close to it.
    // If it's always below 0, we show a default range (e.g. 1500m above surface).
    // If it's above 0, we find the crossing point and add a buffer.

    const minZ = profile[0].z;

    // Find highest altitude where T > 0 (Freezing Level Approximation)
    // We look for the last point where temp is positive, then go a bit higher.
    let zeroIsothermZ = minZ;
    let foundZero = false;

    for (let i = 0; i < profile.length; i++) {
        if (profile[i].temp >= 0) {
            zeroIsothermZ = profile[i].z;
            foundZero = true;
        } else if (foundZero) {
            // We just crossed from + to -, this is roughly the 0 line
            // We can stop searching or keep going if there are multiple inversions.
            // Let's take the highest point where T >= 0 as the reference.
        }
    }

    // Determine the cutoff altitude
    // Minimum visual range: 1200m (to show enough context if FL is low/surface)
    // Buffer above FL: 400m (to clearly show it's freezing above)
    const buffer = 400;
    const minRange = 1200;

    let cutoffAltitude = minZ + minRange;

    // If we found a freezing level above the surface, ensure we show it + buffer
    if (foundZero) {
        cutoffAltitude = Math.max(cutoffAltitude, zeroIsothermZ + buffer);
    }

    // Cap at the actual data max
    const dataMaxZ = profile[profile.length - 1].z;
    cutoffAltitude = Math.min(cutoffAltitude, dataMaxZ);

    // Filter the points
    const displayProfile = profile.filter(p => p.z <= cutoffAltitude);

    // If filtering removed too many points (borderline case), keep at least 2
    if (displayProfile.length < 2) return null;

    const maxZ = displayProfile[displayProfile.length - 1].z;
    const minT = Math.min(...displayProfile.map(p => p.temp), 0) - 2;
    const maxT = Math.max(...displayProfile.map(p => p.temp), 0) + 2;

    const w = 280;
    const h = 200;
    const padding = 20;

    const tToX = (t) => padding + ((t - minT) / (maxT - minT)) * (w - 2 * padding);
    const zToY = (z) => h - padding - ((z - minZ) / (maxZ - minZ)) * (h - 2 * padding);

    const points = displayProfile.map(p => `${tToX(p.temp)},${zToY(p.z)}`).join(' ');
    const zeroX = tToX(0);

    return (
        <div className="w-full mt-6 animate-fade-in relative pl-8">
            {/* Y-Axis Labels (Absolute to overlay SVG) */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-6 h-[200px] pointer-events-none">
                <div className="flex flex-col items-end">
                    <span className="text-[0.6rem] font-black text-rose-400 leading-none">{Math.round(maxZ)}m</span>
                    <span className="text-[0.4rem] font-bold text-slate-600 uppercase tracking-wider">Top</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[0.4rem] font-bold text-slate-600 uppercase tracking-wider">Sfc</span>
                    <span className="text-[0.6rem] font-black text-cyan-400 leading-none">{Math.round(minZ)}m</span>
                </div>
            </div>

            <div className="relative w-full flex justify-center">
                <svg width={w} height={h} className="overflow-visible">
                    {/* Zero Line */}
                    <line x1={zeroX} y1={padding} x2={zeroX} y2={h - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />

                    {/* Levels */}
                    {displayProfile.map((p, i) => (
                        <g key={i}>
                            <circle cx={tToX(p.temp)} cy={zToY(p.z)} r="2.5" fill={p.temp < 0 ? '#22d3ee' : '#fb7185'} />
                            <text x={tToX(p.temp) + 6} y={zToY(p.z) + 3} fontSize="9" fill="rgba(255,255,255,0.6)" className="font-bold">
                                {Math.round(p.temp)}°
                            </text>
                        </g>
                    ))}

                    {/* Trend Line */}
                    <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#fb7185" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* X-Axis Label */}
            <div className="text-center w-full mt-2 border-t border-white/5 pt-2">
                <span className="text-[0.4rem] font-black tracking-[0.3em] text-slate-600 uppercase">Temperature (°C)</span>
            </div>
        </div>
    );
};

export default VerticalProfile;
