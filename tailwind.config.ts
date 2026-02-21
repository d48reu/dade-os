import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dade-bg": "#050510",
        "dade-bg-alt": "#0a0a1a",
        "dade-blue": "#4466ff",
        "dade-purple": "#aa44ff",
        "dade-cyan": "#00d4ff",
        "dade-green": "#00ff88",
        "dade-amber": "#ffaa00",
        "dade-text": "#a0c0ff",
        "dade-dim": "#3a4a6a",
        "dade-border": "#1a2a5a",
      },
      fontFamily: {
        mono: ["Share Tech Mono", "Courier New", "monospace"],
        display: ["Orbitron", "Share Tech Mono", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 8px #4466ff, 0 0 20px rgba(68,102,255,0.4)",
        "glow-purple": "0 0 8px #aa44ff, 0 0 20px rgba(170,68,255,0.4)",
        "glow-cyan": "0 0 8px #00d4ff, 0 0 20px rgba(0,212,255,0.4)",
        "glow-green": "0 0 8px #00ff88, 0 0 20px rgba(0,255,136,0.4)",
        "panel":
          "0 0 0 1px #1a2a5a, 0 0 15px rgba(68,102,255,0.15), inset 0 0 20px rgba(68,102,255,0.03)",
        "panel-active":
          "0 0 0 1px #4466ff, 0 0 25px rgba(68,102,255,0.3), inset 0 0 20px rgba(68,102,255,0.06)",
      },
      animation: {
        "scan": "scan 8s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "blink": "blink 1s step-end infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.97" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
