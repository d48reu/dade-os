"use client";

import { useCallback, useRef, useState } from "react";
import Map, { NavigationControl, ScaleControl, Marker, MapRef } from "react-map-gl";

// Miami-Dade center coordinates
const MIAMI_CENTER = { longitude: -80.1918, latitude: 25.7617 };
const INITIAL_ZOOM = 10;

// Mapbox dark style with terrain feel
// Users can replace with a custom Mapbox style for full blue contour look
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

interface MapCoords {
  lat: number;
  lng: number;
  zoom: number;
}

export default function MapView() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapRef = useRef<MapRef>(null);
  const [coords, setCoords] = useState<MapCoords>({
    lat: MIAMI_CENTER.latitude,
    lng: MIAMI_CENTER.longitude,
    zoom: INITIAL_ZOOM,
  });

  const onMove = useCallback(
    (evt: { viewState: { latitude: number; longitude: number; zoom: number } }) => {
      setCoords({
        lat: evt.viewState.latitude,
        lng: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      });
    },
    []
  );

  // Graceful fallback when no token is configured
  if (!token || token === "pk.your_token_here") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dade-bg-alt relative overflow-hidden">
        {/* Grid background as placeholder */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow at center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,255,65,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Miami outline placeholder */}
        <div className="relative text-center z-10">
          <div
            className="text-7xl mb-6 glow-blue font-mono"
            style={{ fontFamily: "Orbitron, monospace", fontWeight: 900 }}
          >
            25°46'N
          </div>
          <div
            className="text-4xl mb-2 glow-purple font-mono"
            style={{ fontFamily: "Orbitron, monospace" }}
          >
            80°11'W
          </div>
          <div className="divider-h" />
          <p className="text-dade-dim text-xs mt-4 mb-2 tracking-widest uppercase">
            Miami-Dade County
          </p>
          <p className="text-dade-dim text-xs tracking-wider">
            Map requires Mapbox token in{" "}
            <span className="text-dade-blue">.env.local</span>
          </p>
          <p className="text-dade-dim text-xs mt-1">
            Set{" "}
            <span className="text-dade-cyan">NEXT_PUBLIC_MAPBOX_TOKEN</span>
          </p>
        </div>

        {/* Animated concentric rings suggesting a radar */}
        {[120, 200, 280, 360].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-dade-blue opacity-10"
            style={{
              width: size,
              height: size,
              animation: `pulse-glow ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        mapStyle={MAP_STYLE}
        initialViewState={{
          ...MIAMI_CENTER,
          zoom: 9,
          pitch: 25,
          bearing: -5,
        }}
        onMove={onMove}
        style={{ width: "100%", height: "100%" }}
        fog={{
          color: "rgb(2, 13, 2)",
          "high-color": "rgb(3, 20, 3)",
          "horizon-blend": 0.4,
        }}
      >
        <NavigationControl position="bottom-right" showCompass />
        <ScaleControl position="bottom-left" unit="imperial" />

        {/* Miami center marker */}
        <Marker longitude={MIAMI_CENTER.longitude} latitude={MIAMI_CENTER.latitude}>
          <div className="relative">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "#00ff41",
                boxShadow: "0 0 8px #00ff41, 0 0 20px rgba(0,255,65,0.7)",
              }}
            />
            <div
              className="absolute inset-0 w-3 h-3 rounded-full border opacity-50"
              style={{
                borderColor: "#00ff41",
                animation: "pulse-glow 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </Marker>
      </Map>

      {/* Coordinate readout overlay */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 px-3 py-1"
        style={{
          background: "rgba(2,13,2,0.88)",
          border: "1px solid rgba(0,255,65,0.3)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span className="text-xs tracking-widest" style={{ color: "#1a3a1a" }}>
          LAT{" "}
          <span style={{ color: "#00ff41", textShadow: "0 0 6px #00ff41" }}>
            {coords.lat.toFixed(4)}
          </span>
          &nbsp;&nbsp;LON{" "}
          <span style={{ color: "#00ff41", textShadow: "0 0 6px #00ff41" }}>
            {coords.lng.toFixed(4)}
          </span>
          &nbsp;&nbsp;Z{" "}
          <span style={{ color: "#00cc33", textShadow: "0 0 6px #00cc33" }}>
            {coords.zoom.toFixed(1)}
          </span>
        </span>
      </div>

      {/* Green phosphor tint overlay on the map canvas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,65,0.04) 0%, rgba(2,13,2,0.35) 100%)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
