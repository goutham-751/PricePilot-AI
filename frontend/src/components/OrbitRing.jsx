export default function OrbitRing({ size = 300, duration = 20, dotCount = 3, color = 'rgba(16, 185, 129, 0.3)', dotColor = 'rgba(16, 185, 129, 0.8)', className = '' }) {
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            {/* Orbit ring */}
            <div
                className="absolute inset-0 rounded-full animate-orbit-slow"
                style={{
                    border: `1px solid ${color}`,
                }}
            />

            {/* Orbiting dots */}
            <div
                className="absolute inset-0"
                style={{ animation: `orbit ${duration}s linear infinite` }}
            >
                {Array.from({ length: dotCount }).map((_, i) => {
                    const angle = (360 / dotCount) * i;
                    const rad = (angle * Math.PI) / 180;
                    const x = (size / 2) + (size / 2 - 4) * Math.cos(rad) - 4;
                    const y = (size / 2) + (size / 2 - 4) * Math.sin(rad) - 4;
                    return (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: dotColor,
                                left: x,
                                top: y,
                                boxShadow: `0 0 8px ${dotColor}`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Inner ring */}
            <div
                className="absolute rounded-full"
                style={{
                    inset: size * 0.2,
                    border: `1px solid ${color.replace(/[\d.]+\)$/, '0.15)')}`,
                    animation: `orbit ${duration * 1.5}s linear infinite reverse`,
                }}
            />
        </div>
    );
}
