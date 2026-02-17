import React from 'react';

// Simple Catmull-Rom spline to Bezier converter for smooth paths
const getCatmullRomPath = (points, k = 0.5) => {
    if (points.length < 2) return "";

    // Duplicate start and end points
    const p = [points[0], ...points, points[points.length - 1]];
    let path = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 1; i < p.length - 2; i++) {
        const p0 = p[i - 1]; // Previous
        const p1 = p[i];     // Current
        const p2 = p[i + 1]; // Next
        const p3 = p[i + 2]; // Next Next

        // Control points
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6 * k;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6 * k;

        const cp2x = p2[0] - (p3[0] - p1[0]) / 6 * k;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6 * k;

        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return path;
};

const VerticalProfile = ({ viz }) => {
    if (!viz || !viz.profile || viz.profile.length < 2) return null;

    const profile = viz.profile;
    const userElevation = viz.elevation || 0;
    const sfg = viz.sfg; // Absolute Altitude of Snowfall Limit

    // 1. Calculate Bounds
    // Temperature Range with padding
    const minT = Math.min(...profile.map(p => p.temp), 0) - 2;
    const maxT = Math.max(...profile.map(p => p.temp), 0) + 2;

    // Freezing Level Search
    let zeroIsothermRel = null;
    let foundZero = false;

    for (let i = 0; i < profile.length - 1; i++) {
        const p1 = profile[i];
        const p2 = profile[i + 1];
        if ((p1.temp >= 0 && p2.temp < 0) || (p1.temp < 0 && p2.temp >= 0)) {
            const fraction = (0 - p1.temp) / (p2.temp - p1.temp);
            zeroIsothermRel = p1.z_rel + fraction * (p2.z_rel - p1.z_rel);
            foundZero = true;
            break;
        }
    }

    // Dynamic Altitude Range Logic
    let minRel = -200;
    let maxRel = 1000;

    // Expand to include SFG if present
    if (sfg !== null) {
        const sfgRel = sfg - userElevation;
        minRel = Math.min(minRel, sfgRel - 200);
        maxRel = Math.max(maxRel, sfgRel + 200);
    }

    // Expand to include Zero Isotherm if present
    if (foundZero && zeroIsothermRel !== null) {
        minRel = Math.min(minRel, zeroIsothermRel - 200);
        maxRel = Math.max(maxRel, zeroIsothermRel + 200);
    }

    // Ensure logical minimum spread (at least 1200m total vertical)
    if ((maxRel - minRel) < 1200) {
        const diff = 1200 - (maxRel - minRel);
        maxRel += diff / 2;
        minRel -= diff / 2;
    }

    const topRel = maxRel;
    const bottomRel = minRel;

    const w = 280;
    const h = 300;
    const padding = 30;

    // Scales
    const tToX = (t) => padding + ((t - minT) / (maxT - minT)) * (w - 2 * padding);
    const zToY = (z_rel) => h - padding - ((z_rel - bottomRel) / (topRel - bottomRel)) * (h - 2 * padding);

    // Generate Points [x, y]
    const pointsData = profile.map(p => [tToX(p.temp), zToY(p.z_rel)]);

    // Generate Smooth Path
    const pathD = getCatmullRomPath(pointsData, 1);

    // Calculate Y positions for key lines
    const userY = zToY(0);
    const zeroY = (foundZero && zeroIsothermRel !== null) ? zToY(zeroIsothermRel) : null;

    let sfgY = null;
    if (sfg !== null) {
        const sfgRel = sfg - userElevation;
        // Check bounds (though logic ensures it's likely inside)
        if (sfgRel >= bottomRel && sfgRel <= topRel) {
            sfgY = zToY(sfgRel);
        }
    }

    // Generate Y-Axis Ticks (ASL)
    const ticks = [];
    const minASL = userElevation + bottomRel;
    const maxASL = userElevation + topRel;
    const totalRange = maxASL - minASL;

    // Dynamic interval: 500m if range > 2000m, else 250m
    const tickInterval = totalRange > 2000 ? 500 : 250;

    const firstTick = Math.ceil(minASL / tickInterval) * tickInterval;
    for (let alt = firstTick; alt < maxASL; alt += tickInterval) {
        ticks.push(alt);
    }

    return (
        <div>
            <div className="w-full mt-2 animate-fade-in relative pl-12 pr-4">
                {/* Y-Axis Labels (Absolute Ticks) */}
                <div className="absolute left-0 top-0 bottom-0 py-[30px] h-[300px] pointer-events-none w-10 border-r border-white/5 pr-2">
                    {ticks.map(tickAlt => {
                        const tickRel = tickAlt - userElevation;
                        const yPos = zToY(tickRel);
                        if (yPos < 10 || yPos > h - 10) return null;

                        return (
                            <div
                                key={tickAlt}
                                className="absolute right-0 flex items-center justify-end w-full text-right transform -translate-y-1/2"
                                style={{ top: yPos }}
                            >
                                <span className="text-[0.4rem] font-bold text-slate-600 mr-1">{tickAlt}m</span>
                                <div className="w-1 h-[1px] bg-slate-700"></div>
                            </div>
                        );
                    })}
                </div>

                <div className="relative w-full flex justify-center">
                    <svg width={w} height={h} className="overflow-hidden"> {/* Changed to overflow-hidden if needed, but clip-path is safer */}
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="50%" stopColor="#e879f9" />
                                <stop offset="100%" stopColor="#fb7185" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            {/* Clip Path Definition */}
                            <clipPath id="chartArea">
                                <rect x={padding} y={padding} width={w - 2 * padding} height={h - 2 * padding} />
                            </clipPath>
                        </defs>

                        {/* Grid Lines (clipped) */}
                        <g clipPath="url(#chartArea)">
                            <line x1={tToX(0)} y1={padding} x2={tToX(0)} y2={h - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />

                            {sfgY && (
                                <line x1={padding} y1={sfgY} x2={w - padding} y2={sfgY} stroke="white" strokeWidth="1.5" strokeDasharray="2,4" opacity="0.7" />
                            )}

                            {foundZero && zeroY && (
                                <line x1={padding} y1={zeroY} x2={w - padding} y2={zeroY} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.8" />
                            )}

                            {/* User Elevation Line */}
                            {(0 >= bottomRel && 0 <= topRel) && (
                                <line x1={padding} y1={userY} x2={w - padding} y2={userY} stroke="#f43f5e" strokeWidth="2" />
                            )}

                            {/* Trend Line & Points (Clipped) */}
                            <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

                            {profile.map((p, i) => (
                                <circle key={i} cx={tToX(p.temp)} cy={zToY(p.z_rel)} r="2" fill={p.temp < 0 ? '#22d3ee' : '#fb7185'} />
                            ))}
                        </g>
                    </svg>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-2 border-t border-white/5 pt-2 ml-2 mb-12 relative">
                {/* X-Axis Labels */}
                <div className="absolute top-[-10px] left-[30px] right-[30px] flex justify-between text-[0.4rem] font-bold text-slate-500">
                    <span>{Math.round(minT)}°C</span>
                    <span>{Math.round((minT + maxT) / 2)}°C</span>
                    <span>{Math.round(maxT)}°C</span>
                </div>

                <div className="flex flex-col items-center space-y-1 mt-4 mb-3">
                    <div className="flex items-center space-x-4 text-[0.6rem] font-bold">
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-1 bg-[#f43f5e]"></div>
                            <span className="text-slate-400">YOU:</span>
                            <span className="text-white">{userElevation}m</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-1 border-b-2 border-dashed border-[#22d3ee]"></div>
                            <span className="text-slate-400">0°C:</span>
                            <span className="text-white">{foundZero ? Math.round(userElevation + zeroIsothermRel) : '-'}m</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-1 border-b-2 border-dotted border-white/70"></div>
                            <span className="text-slate-400">SFG:</span>
                            <span className="text-white">{sfg ? sfg : '-'}m</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerticalProfile;
