'use client';

import { useRef, useEffect, useState } from 'react';
import { fetchWeather, getConditionLabel, getWindCardinal, type WeatherData } from '../lib/weather';

export default function WeatherStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const weatherRef = useRef<WeatherData | null>(null);
  const animFrameRef = useRef(0);

  // Fetch weather on mount and every 5 minutes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchWeather();
        if (mounted) {
          setWeather(data);
          weatherRef.current = data;
        }
      } catch (e) {
        console.error('Weather fetch error:', e);
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, w, h);
      const data = weatherRef.current;

      const AMBER = '#FF6600';
      const BRIGHT = '#FF8800';
      const DIM = '#993D00';
      const FONT = '"Share Tech Mono", monospace';

      // === SECTION 1: WIND COMPASS (left side) ===
      const compassCx = h * 0.5;
      const compassCy = h * 0.48;
      const compassR = h * 0.32;

      // Compass ring
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(compassCx, compassCy, compassR, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(compassCx, compassCy, compassR * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal tick marks + labels
      const cardinals = ['N', 'E', 'S', 'W'];
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 - Math.PI / 2;
        const outerX = compassCx + Math.cos(angle) * compassR;
        const outerY = compassCy + Math.sin(angle) * compassR;
        const innerX = compassCx + Math.cos(angle) * (compassR * 0.82);
        const innerY = compassCy + Math.sin(angle) * (compassR * 0.82);

        ctx.strokeStyle = AMBER;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();

        // Label
        const labelX = compassCx + Math.cos(angle) * (compassR * 1.2);
        const labelY = compassCy + Math.sin(angle) * (compassR * 1.2);
        ctx.fillStyle = DIM;
        ctx.font = `${Math.max(10, h * 0.11)}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cardinals[i], labelX, labelY);
      }

      // Minor ticks
      for (let i = 0; i < 16; i++) {
        if (i % 4 === 0) continue;
        const angle = (i * Math.PI) / 8 - Math.PI / 2;
        const outerX = compassCx + Math.cos(angle) * compassR;
        const outerY = compassCy + Math.sin(angle) * compassR;
        const innerX = compassCx + Math.cos(angle) * (compassR * 0.9);
        const innerY = compassCy + Math.sin(angle) * (compassR * 0.9);

        ctx.strokeStyle = DIM;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();
      }

      // Wind direction arrow
      if (data) {
        const windAngle = (data.windDirection * Math.PI) / 180 - Math.PI / 2;
        const arrowLen = compassR * 0.7;
        const tipX = compassCx + Math.cos(windAngle) * arrowLen;
        const tipY = compassCy + Math.sin(windAngle) * arrowLen;

        // Arrow shaft
        ctx.strokeStyle = BRIGHT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(compassCx, compassCy);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Arrowhead
        const headLen = compassR * 0.2;
        const headAngle = 0.4;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(
          tipX - Math.cos(windAngle - headAngle) * headLen,
          tipY - Math.sin(windAngle - headAngle) * headLen
        );
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(
          tipX - Math.cos(windAngle + headAngle) * headLen,
          tipY - Math.sin(windAngle + headAngle) * headLen
        );
        ctx.stroke();

        // Tail (opposite direction, dimmer)
        const tailX = compassCx - Math.cos(windAngle) * (arrowLen * 0.35);
        const tailY = compassCy - Math.sin(windAngle) * (arrowLen * 0.35);
        ctx.strokeStyle = DIM;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(compassCx, compassCy);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      // === SECTION 2: READOUTS (center) ===
      const readoutX = compassCx * 2 + 12;
      const fontSize = Math.max(14, h * 0.16);
      const smallFont = Math.max(11, h * 0.12);
      const tinyFont = Math.max(10, h * 0.1);
      ctx.textAlign = 'left';

      if (data) {
        // Temperature — big readout
        ctx.fillStyle = BRIGHT;
        ctx.font = `${fontSize * 1.4}px ${FONT}`;
        ctx.textBaseline = 'top';
        ctx.fillText(`${Math.round(data.temperature)}°F`, readoutX, 3);

        // Condition
        ctx.fillStyle = AMBER;
        ctx.font = `${smallFont}px ${FONT}`;
        ctx.fillText(getConditionLabel(data.weatherCode), readoutX, 4 + fontSize * 1.4);

        // Wind
        const windLabel = `WIND ${getWindCardinal(data.windDirection)} ${Math.round(data.windSpeed)} MPH`;
        ctx.fillStyle = AMBER;
        ctx.font = `${smallFont}px ${FONT}`;
        ctx.fillText(windLabel, readoutX, h - smallFont * 2.2 - 2);

        // Humidity
        ctx.fillStyle = DIM;
        ctx.font = `${tinyFont}px ${FONT}`;
        ctx.fillText(`HUM ${data.humidity}%`, readoutX, h - tinyFont - 2);
      } else {
        ctx.fillStyle = DIM;
        ctx.font = `${smallFont}px ${FONT}`;
        ctx.textBaseline = 'top';
        ctx.fillText('ACQUIRING...', readoutX, h * 0.3);
      }

      // === SECTION 3: PRESSURE GAUGE (right side) ===
      const gaugeX = w * 0.62;
      const gaugeW = w * 0.35;
      const gaugeY = h * 0.2;
      const gaugeH = h * 0.55;

      if (data) {
        // Pressure bar — normalize 980-1040 hPa range
        const pMin = 980;
        const pMax = 1040;
        const pNorm = Math.max(0, Math.min(1, (data.pressure - pMin) / (pMax - pMin)));

        // Bar outline
        ctx.strokeStyle = DIM;
        ctx.lineWidth = 1;
        ctx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);

        // Tick marks
        for (let i = 0; i <= 6; i++) {
          const ty = gaugeY + gaugeH - (i / 6) * gaugeH;
          const tw = i % 3 === 0 ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(gaugeX - tw, ty);
          ctx.lineTo(gaugeX, ty);
          ctx.stroke();
        }

        // Filled bar
        const fillH = pNorm * gaugeH;
        ctx.fillStyle = 'rgba(255, 102, 0, 0.15)';
        ctx.fillRect(gaugeX + 1, gaugeY + gaugeH - fillH, gaugeW - 2, fillH);

        // Bright top edge of fill
        ctx.strokeStyle = AMBER;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gaugeX + 1, gaugeY + gaugeH - fillH);
        ctx.lineTo(gaugeX + gaugeW - 1, gaugeY + gaugeH - fillH);
        ctx.stroke();

        // Scanning line (animated)
        const scanY = gaugeY + ((tick * 0.8) % gaugeH);
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gaugeX + 1, scanY);
        ctx.lineTo(gaugeX + gaugeW - 1, scanY);
        ctx.stroke();

        // Label
        ctx.fillStyle = DIM;
        ctx.font = `${tinyFont}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('hPa', gaugeX + gaugeW / 2, gaugeY + gaugeH + 2);

        // Value
        ctx.fillStyle = AMBER;
        ctx.font = `${smallFont}px ${FONT}`;
        ctx.fillText(data.pressure.toFixed(0), gaugeX + gaugeW / 2, gaugeY - smallFont - 2);
      }

      // === SECTION 4: SCAN LINES ===
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.08)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      tick++;
    };

    draw();

    // Animate the scanning line
    const interval = setInterval(draw, 100);
    window.addEventListener('resize', draw);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', draw);
    };
  }, [weather]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
