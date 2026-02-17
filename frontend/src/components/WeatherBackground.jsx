import React, { useMemo } from 'react';

// Separate component for heavy particles - MEMOIZED to prevent re-renders on scroll/time change
const PrecipitationLayer = React.memo(({ type, precip }) => {
    // Normalize type
    const t = (type || '').toLowerCase();

    // Determine active modes for particles
    const isPartlyCloudy = t.includes('partly');
    const isWetSnow = t.includes('wet') || t.includes('mix') || (t.includes('snow') && t.includes('rain'));
    const isSnow = (t.includes('snow') || t.includes('ice')) && !isWetSnow;
    const isRain = (t.includes('rain') || t.includes('drizzle') || t.includes('freezing')) && !isWetSnow;
    const isIce = t.includes('pellets') || t.includes('hail');
    const isCloudy = t.includes('cloud') || t.includes('overcast') || isPartlyCloudy || isSnow || isRain || isWetSnow || isIce;

    // Determine Precipitation Intensity Scale (0.0 - 1.0)
    let intensity = 0.5;
    if (precip !== undefined) {
        if (precip < 0.5) intensity = 0.3;
        else if (precip < 2.0) intensity = 0.6;
        else intensity = 1.0;
    }

    // Generate Particles (Memoized once)
    const { snowParticles, rainParticles, cloudParticles, iceParticles, wetSnowParticles } = useMemo(() => {
        const snow = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            size: `${3 + Math.random() * 4}px`,
            opacity: 0.6 + Math.random() * 0.4
        }));

        const rain = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`,
            animationDelay: `${Math.random() * 2}s`,
            height: `${15 + Math.random() * 20}px`
        }));

        const ice = Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${0.8 + Math.random() * 1}s`,
            animationDelay: `${Math.random() * 2}s`,
            size: `${3 + Math.random() * 3}px`
        }));

        const wetSnow = Array.from({ length: 120 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
            animationDelay: `${Math.random() * 3}s`,
            size: `${6 + Math.random() * 5}px`,
            opacity: 0.7 + Math.random() * 0.3
        }));

        const clouds = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            top: `${5 + Math.random() * 40}%`,
            left: `${Math.random() * 100}%`,
            size: `${200 + Math.random() * 300}px`,
            animationDuration: `${25 + Math.random() * 15}s`,
            animationDelay: `${Math.random() * -20}s`
        }));

        return { snowParticles: snow, rainParticles: rain, cloudParticles: clouds, iceParticles: ice, wetSnowParticles: wetSnow };
    }, []);

    // Active counts
    const activeSnowCount = Math.floor(snowParticles.length * intensity);
    const activeRainCount = Math.floor(rainParticles.length * intensity);
    const activeIceCount = Math.floor(iceParticles.length * intensity);
    const activeWetSnowCount = Math.floor(wetSnowParticles.length * intensity);

    const getOpacity = (active) => active ? 'opacity-100' : 'opacity-0';

    return (
        <>
            {/* PURE SNOW */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${getOpacity(isSnow)}`}>
                {snowParticles.slice(0, activeSnowCount).map(p => (
                    <div key={`snow-${p.id}`} className="snowflake" style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        opacity: p.opacity
                    }}></div>
                ))}
            </div>

            {/* PURE RAIN */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${getOpacity(isRain)}`}>
                {rainParticles.slice(0, activeRainCount).map(p => (
                    <div key={`rain-${p.id}`} className="raindrop" style={{
                        left: p.left,
                        height: p.height,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay
                    }}></div>
                ))}
            </div>

            {/* DEDICATED WET SNOW */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${getOpacity(isWetSnow)}`}>
                {wetSnowParticles.slice(0, activeWetSnowCount).map(p => (
                    <div key={`wetsnow-${p.id}`} className="snowflake" style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        opacity: p.opacity,
                        background: '#e0f2fe'
                    }}></div>
                ))}
            </div>

            {/* ICE PELLETS */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${getOpacity(isIce)}`}>
                {iceParticles.slice(0, activeIceCount).map(p => (
                    <div key={`ice-${p.id}`} className="snowflake bg-cyan-100" style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationName: 'rainfall',
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        opacity: 0.8
                    }}></div>
                ))}
            </div>

            {/* CLOUDS */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${getOpacity(isCloudy)}`}>
                {cloudParticles.map(p => (
                    <div key={`cloud-${p.id}`} className="cloud-particle" style={{
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        animationName: 'cloud-float',
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        opacity: isPartlyCloudy ? 0.4 : 0.8
                    }}></div>
                ))}
            </div>
        </>
    );
});

const WeatherBackground = ({ type, activeHour = 12, precip }) => {
    // Normalize type
    const t = (type || '').toLowerCase();

    // Smooth Day/Night Transition Logic (re-renders on scroll)
    const hour = activeHour % 24;

    // Calculate Day Intensity (0.0 to 1.0)
    let dayIntensity = 0;
    if (hour >= 5 && hour < 9) {
        dayIntensity = (hour - 5) / 4;
    } else if (hour >= 9 && hour < 17) {
        dayIntensity = 1;
    } else if (hour >= 17 && hour < 21) {
        dayIntensity = 1 - (hour - 17) / 4;
    } else {
        dayIntensity = 0;
    }

    const nightIntensity = 1 - dayIntensity;

    // Determine visibility conditions
    const isPartlyCloudy = t.includes('partly');
    const isClearOrPartly = t.includes('clear') || t.includes('sunny') || isPartlyCloudy;

    const dayGradientOpacity = isClearOrPartly ? dayIntensity : 0;
    const nightGradientOpacity = isClearOrPartly ? nightIntensity : 1.0;
    const starOpacity = isClearOrPartly ? nightIntensity : 0;
    const sunOpacity = isClearOrPartly ? dayIntensity : 0;

    // Stars (Static, but opacity changes)
    const starParticles = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 3}px`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`
    })), []);

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-all duration-1000">
            {/* GRADIENTS & CELESTIAL BODIES (Update frequently on scroll) */}

            {/* Day Gradient */}
            <div className="absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-sky-500/30 to-transparent" style={{ opacity: dayGradientOpacity }}></div>

            {/* Night Gradient */}
            <div className="absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-slate-900/60 to-transparent" style={{ opacity: nightGradientOpacity }}></div>

            {/* Stars */}
            <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: starOpacity }}>
                {starParticles.map(p => (
                    <div key={`star-${p.id}`} className="star" style={{
                        top: p.top,
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.animationDelay,
                        animationDuration: p.animationDuration
                    }}></div>
                ))}
            </div>

            {/* Sun */}
            <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: sunOpacity }}>
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-400/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[10%] right-[10%] w-32 h-32 bg-amber-200/30 rounded-full blur-[60px]"></div>
            </div>

            {/* PRECIPITATION LAYER (Memoized, does not update on scroll) */}
            <PrecipitationLayer type={type} precip={precip} />
        </div>
    );
};

export default WeatherBackground;
