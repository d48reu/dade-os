'use client';

import { useRef, useEffect } from 'react';

// Simple canvas-drawn minimap showing Miami-Dade outline and viewport indicator
// No Mapbox dependency yet — we'll add it when MAPBOX_TOKEN is available
export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Simplified Miami-Dade county outline
      ctx.strokeStyle = '#993D00';
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Approximate county shape (normalized to canvas)
      const outline = [
        [0.3, 0.05], [0.85, 0.05], [0.9, 0.1], [0.92, 0.3],
        [0.88, 0.5], [0.85, 0.65], [0.8, 0.75], [0.7, 0.85],
        [0.55, 0.92], [0.4, 0.95], [0.3, 0.92], [0.2, 0.85],
        [0.15, 0.7], [0.12, 0.5], [0.15, 0.3], [0.2, 0.15],
      ];

      ctx.moveTo(outline[0][0] * w, outline[0][1] * h);
      for (let i = 1; i < outline.length; i++) {
        ctx.lineTo(outline[i][0] * w, outline[i][1] * h);
      }
      ctx.closePath();
      ctx.stroke();

      // Downtown/Brickell viewport indicator
      const vpX = 0.55 * w;
      const vpY = 0.45 * h;
      const vpW = 12;
      const vpH = 10;

      ctx.strokeStyle = '#FF6600';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vpX - vpW / 2, vpY - vpH / 2, vpW, vpH);

      // Glow around viewport
      ctx.shadowColor = 'rgba(255, 102, 0, 0.5)';
      ctx.shadowBlur = 6;
      ctx.strokeRect(vpX - vpW / 2, vpY - vpH / 2, vpW, vpH);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#993D00';
      ctx.font = '8px "Share Tech Mono", monospace';
      ctx.fillText('DOWNTOWN', vpX + vpW / 2 + 3, vpY + 3);

      // Crosshairs on viewport center
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(vpX, vpY - 8);
      ctx.lineTo(vpX, vpY + 8);
      ctx.moveTo(vpX - 8, vpY);
      ctx.lineTo(vpX + 8, vpY);
      ctx.stroke();

      // Coordinate labels
      ctx.fillStyle = '#993D00';
      ctx.font = '7px "Share Tech Mono", monospace';
      ctx.fillText('25.77°N', 4, h - 14);
      ctx.fillText('80.19°W', 4, h - 4);
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
