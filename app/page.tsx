"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import CommandCenter from "@/components/CommandCenter";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/*
        CommandCenter mounts immediately so Mapbox initializes and tiles
        start loading while the loading screen plays. It's hidden underneath
        the full-screen overlay until onComplete fires.
      */}
      <Navigation />
      <CommandCenter />

      {/* Loading screen sits on top (z-[100]) until animation completes */}
      {!loaded && (
        <LoadingScreen onComplete={() => setLoaded(true)} />
      )}
    </>
  );
}
