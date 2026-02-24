'use client';

import { useRef, useEffect } from 'react';
import type { BuildingFeature } from '../lib/gis';
import { DOWNTOWN_BBOX } from '../lib/gis';

// Build a heightmap: divide the longitude range into bins,
// keep only the tallest building per bin → clean skyline silhouette
function buildHeightmap(features: BuildingFeature[], numBins: number): number[] {
  const heightmap = new Float64Array(numBins);

  const lngMin = DOWNTOWN_BBOX.xmin;
  const lngRange = DOWNTOWN_BBOX.xmax - lngMin;

  for (const f of features) {
    const coords = f.geometry.type === 'MultiPolygon'
      ? f.geometry.coordinates[0]?.[0]
      : f.geometry.coordinates[0];

    if (!coords || coords.length < 3) continue;

    // Height: real GIS data or skip tiny buildings
    const height = f.properties.HEIGHT && f.properties.HEIGHT > 0
      ? f.properties.HEIGHT
      : Math.max(0, Math.sqrt(f.properties.Shape__Area || 0) * 1.2);

    // Skip very short buildings — they're noise in a skyline
    if (height < 25) continue;

    // Find which bins this building spans
    let minLng = Infinity;
    let maxLng = -Infinity;
    for (const c of coords) {
      const pt = c as unknown as number[];
      if (!Array.isArray(pt) || pt.length < 2) continue;
      minLng = Math.min(minLng, pt[0]);
      maxLng = Math.max(maxLng, pt[0]);
    }

    const binStart = Math.floor(((minLng - lngMin) / lngRange) * numBins);
    const binEnd = Math.ceil(((maxLng - lngMin) / lngRange) * numBins);

    // Fill all bins this building touches with max height
    for (let b = Math.max(0, binStart); b <= Math.min(numBins - 1, binEnd); b++) {
      heightmap[b] = Math.max(heightmap[b], height);
    }
  }

  return Array.from(heightmap);
}

interface PanoramaStripProps {
  buildings?: BuildingFeature[];
}

export default function PanoramaStrip({ buildings }: PanoramaStripProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buildingsRef = useRef<BuildingFeature[] | undefined>(buildings);
  buildingsRef.current = buildings;

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

      const baseY = h * 0.82;

      // Horizon line
      ctx.strokeStyle = '#993D00';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(w, baseY);
      ctx.stroke();

      const feats = buildingsRef.current;
      if (feats && feats.length > 0) {
        // Build heightmap: one bin per 2 pixels for crisp columns
        const numBins = Math.max(Math.floor(w / 2), 100);
        const heightmap = buildHeightmap(feats, numBins);
        const maxH = Math.max(...heightmap, 100);
        const maxDrawH = h * 0.72;
        const binWidth = w / numBins;

        // Draw filled skyline silhouette (dim fill)
        for (let i = 0; i < numBins; i++) {
          if (heightmap[i] <= 0) continue;

          const bx = i * binWidth;
          const bh = (heightmap[i] / maxH) * maxDrawH;
          const intensity = heightmap[i] / maxH;

          // Dim amber fill
          const fillAlpha = 0.08 + 0.15 * intensity;
          ctx.fillStyle = `rgba(255, 102, 0, ${fillAlpha})`;
          ctx.fillRect(bx, baseY - bh, binWidth + 0.5, bh);
        }

        // Draw wireframe outlines — trace the silhouette as a continuous path
        ctx.strokeStyle = '#FF6600';
        ctx.lineWidth = 1;
        ctx.beginPath();

        let inBuilding = false;
        let prevH = 0;

        for (let i = 0; i < numBins; i++) {
          const bx = i * binWidth;
          const bh = (heightmap[i] / maxH) * maxDrawH;

          if (heightmap[i] > 0 && !inBuilding) {
            // Start of building group: vertical line up
            ctx.moveTo(bx, baseY);
            ctx.lineTo(bx, baseY - bh);
            inBuilding = true;
          } else if (heightmap[i] > 0 && inBuilding) {
            // Height change: step up/down
            if (Math.abs(bh - prevH) > 1) {
              ctx.lineTo(bx, baseY - prevH);
              ctx.lineTo(bx, baseY - bh);
            }
            ctx.lineTo(bx + binWidth, baseY - bh);
          } else if (heightmap[i] <= 0 && inBuilding) {
            // End of building group: drop to ground
            ctx.lineTo(bx, baseY - prevH);
            ctx.lineTo(bx, baseY);
            inBuilding = false;
          }

          prevH = bh;
        }

        // Close any open building at the right edge
        if (inBuilding) {
          ctx.lineTo(w, baseY - prevH);
          ctx.lineTo(w, baseY);
        }

        ctx.stroke();

        // Bright peaks on tallest buildings
        ctx.strokeStyle = '#FF8800';
        ctx.lineWidth = 1.5;
        const peakThreshold = maxH * 0.6;
        for (let i = 0; i < numBins; i++) {
          if (heightmap[i] < peakThreshold) continue;
          const bx = i * binWidth;
          const bh = (heightmap[i] / maxH) * maxDrawH;
          ctx.beginPath();
          ctx.moveTo(bx, baseY - bh);
          ctx.lineTo(bx + binWidth, baseY - bh);
          ctx.stroke();
        }
      } else {
        // Fallback: dim random skyline while loading
        ctx.strokeStyle = '#993D00';
        ctx.lineWidth = 1;
        let x = 0;
        while (x < w) {
          const bw = 3 + Math.random() * 8;
          const bh = 4 + Math.random() * (h * 0.45);
          ctx.beginPath();
          ctx.moveTo(x, baseY);
          ctx.lineTo(x, baseY - bh);
          ctx.lineTo(x + bw, baseY - bh);
          ctx.lineTo(x + bw, baseY);
          ctx.stroke();
          x += bw + 1;
        }
      }

      // Scan line overlay
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.12)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [buildings]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
