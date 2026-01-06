"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function Globe({
    className,
    markers = [],
}: {
    className?: string;
    markers?: Array<{ location: [number, number]; size: number }>;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.77, 0.62, 0.35], // Gold color #c5a059 in RGB approx
            glowColor: [0.1, 0.1, 0.1],
            markers: markers,
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.003;
            },
        });

        return () => {
            globe.destroy();
        };
    }, [markers]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
            className={className}
        />
    );
}
