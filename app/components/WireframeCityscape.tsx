'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  fetchBuildingFootprints,
  fetchLargeBuildings,
  fetchMetrorailLines,
  fetchMetrorailStations,
  fetchMetromoverLines,
  fetchMetromoverStations,
  toSceneHeight,
  type BuildingFeature,
  type TransitLineFeature,
  type TransitStationFeature,
} from '../lib/gis';

// Shared coordinate system
const CENTER = { lng: -80.195, lat: 25.770 };
const SCALE = 4000;
const RAIL_ELEVATION = 1.2; // Metrorail floats above ground
const MOVER_ELEVATION = 0.8; // Metromover slightly lower

function geoToLocal(
  coords: number[][],
  center: { lng: number; lat: number },
  scale: number
): THREE.Vector2[] {
  return coords.map(([lng, lat]) => {
    const x = (lng - center.lng) * scale;
    const y = (lat - center.lat) * scale;
    return new THREE.Vector2(x, y);
  });
}

function geoToVec3(lng: number, lat: number, y: number): THREE.Vector3 {
  const x = (lng - CENTER.lng) * SCALE;
  const z = -(lat - CENTER.lat) * SCALE;
  return new THREE.Vector3(x, y, z);
}

function createBuildingMesh(
  feature: BuildingFeature,
  center: { lng: number; lat: number },
  scale: number,
  material: THREE.LineBasicMaterial
): THREE.LineSegments | null {
  const coords = feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates[0][0]
    : feature.geometry.coordinates[0];

  if (!coords || coords.length < 3) return null;

  const points2D = geoToLocal(coords as number[][], center, scale);
  const height = toSceneHeight(feature);

  if (height <= 0) return null;

  const shape = new THREE.Shape(points2D);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });

  const edges = new THREE.EdgesGeometry(geometry);
  const wireframe = new THREE.LineSegments(edges, material);
  wireframe.rotation.x = -Math.PI / 2;
  return wireframe;
}

function createGroundGrid(size: number, divisions: number): THREE.Group {
  const group = new THREE.Group();

  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x993D00,
    transparent: true,
    opacity: 0.25,
  });

  const step = size / divisions;
  const half = size / 2;

  const gridGeometry = new THREE.BufferGeometry();
  const points: number[] = [];

  for (let i = 0; i <= divisions; i++) {
    const pos = -half + i * step;
    points.push(pos, 0, -half, pos, 0, half);
    points.push(-half, 0, pos, half, 0, pos);
  }

  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
  group.add(grid);

  return group;
}

// ===== TRANSIT RENDERING =====

function buildTransitLineGeometry(
  features: TransitLineFeature[],
  elevation: number,
  material: THREE.LineBasicMaterial
): THREE.Group {
  const group = new THREE.Group();

  for (const feature of features) {
    const geom = feature.geometry;
    // Normalize to array of coordinate arrays
    const lineStrings: number[][][] =
      geom.type === 'MultiLineString'
        ? (geom.coordinates as number[][][])
        : [geom.coordinates as number[][]];

    for (const coords of lineStrings) {
      if (coords.length < 2) continue;

      const points: THREE.Vector3[] = coords.map(([lng, lat]) =>
        geoToVec3(lng, lat, elevation)
      );

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, material);
      group.add(line);
    }
  }

  return group;
}

function buildStationMarkers(
  features: TransitStationFeature[],
  elevation: number,
  color: number,
  size: number
): THREE.Group {
  const group = new THREE.Group();

  const markerMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
  });

  // Vertical drop line material (dim)
  const dropMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.25,
  });

  for (const feature of features) {
    const [lng, lat] = feature.geometry.coordinates;
    const pos = geoToVec3(lng, lat, elevation);

    // Diamond marker
    const diamondPoints = [
      new THREE.Vector3(pos.x, pos.y + size, pos.z),
      new THREE.Vector3(pos.x + size, pos.y, pos.z),
      new THREE.Vector3(pos.x, pos.y - size, pos.z),
      new THREE.Vector3(pos.x - size, pos.y, pos.z),
      new THREE.Vector3(pos.x, pos.y + size, pos.z),
    ];

    const diamondGeom = new THREE.BufferGeometry().setFromPoints(diamondPoints);
    const diamond = new THREE.Line(diamondGeom, markerMaterial);
    group.add(diamond);

    // Vertical drop line to ground
    const dropGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(pos.x, 0, pos.z),
      new THREE.Vector3(pos.x, elevation, pos.z),
    ]);
    const dropLine = new THREE.Line(dropGeom, dropMaterial);
    group.add(dropLine);
  }

  return group;
}

// ===== MAIN COMPONENT =====

interface WireframeCityscapeProps {
  activeOverlay: string | null;
}

export default function WireframeCityscape({ activeOverlay }: WireframeCityscapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    animationId: number;
  } | null>(null);
  const transitGroupRef = useRef<THREE.Group | null>(null);
  const [status, setStatus] = useState('INITIALIZING...');
  const [buildingCount, setBuildingCount] = useState(0);
  const [heightSource, setHeightSource] = useState('—');
  const [transitStatus, setTransitStatus] = useState<string | null>(null);

  const initScene = useCallback((container: HTMLDivElement) => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(40, 35, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    const grid = createGroundGrid(80, 40);
    scene.add(grid);

    const axisColor = 0x993D00;
    const axisMat = new THREE.LineBasicMaterial({ color: axisColor, transparent: true, opacity: 0.4 });
    const axisLen = 50;

    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLen, 0, 0),
      new THREE.Vector3(axisLen, 0, 0),
    ]);
    scene.add(new THREE.Line(xAxisGeo, axisMat));

    const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLen),
      new THREE.Vector3(0, 0, axisLen),
    ]);
    scene.add(new THREE.Line(zAxisGeo, axisMat));

    const animate = () => {
      const id = requestAnimationFrame(animate);
      sceneRef.current!.animationId = id;
      controls.update();
      renderer.render(scene, camera);
    };

    const animationId = requestAnimationFrame(animate);
    sceneRef.current = { scene, camera, renderer, controls, animationId };

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const loadBuildings = useCallback(async () => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    setStatus('QUERYING ARCGIS API...');

    const material = new THREE.LineBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.7,
    });

    const materialBright = new THREE.LineBasicMaterial({
      color: 0xFF8800,
      transparent: true,
      opacity: 0.85,
    });

    try {
      const [footprintData, largeData] = await Promise.allSettled([
        fetchBuildingFootprints(),
        fetchLargeBuildings(),
      ]);

      const footprints = footprintData.status === 'fulfilled' ? footprintData.value.features : [];
      const largeBuildings = largeData.status === 'fulfilled' ? largeData.value.features : [];

      const totalFeatures = footprints.length + largeBuildings.length;

      if (totalFeatures === 0) {
        setStatus('NO FEATURES RETURNED — LOADING SAMPLE');
        loadSampleBuildings(scene);
        return;
      }

      let realHeightCount = 0;
      let estimatedHeightCount = 0;

      setStatus(`PROCESSING ${totalFeatures} BUILDINGS...`);

      const placed = new Set<string>();

      const addFeatures = (
        features: BuildingFeature[],
        mat: THREE.LineBasicMaterial,
      ) => {
        let count = 0;
        for (const feature of features) {
          const coords = feature.geometry.type === 'MultiPolygon'
            ? feature.geometry.coordinates[0]?.[0]?.[0]
            : feature.geometry.coordinates[0]?.[0];

          if (coords && Array.isArray(coords) && coords.length >= 2) {
            const lng = Number(coords[0]);
            const lat = Number(coords[1]);
            const key = `${lng.toFixed(4)},${lat.toFixed(4)}`;
            if (placed.has(key)) continue;
            placed.add(key);
          }

          const mesh = createBuildingMesh(feature, CENTER, SCALE, mat);
          if (mesh) {
            scene.add(mesh);
            count++;
            if (feature.properties.HEIGHT && feature.properties.HEIGHT > 0) {
              realHeightCount++;
            } else {
              estimatedHeightCount++;
            }
          }
        }
        return count;
      };

      const largeCount = addFeatures(largeBuildings, materialBright);
      const footprintCount = addFeatures(footprints, material);

      const total = largeCount + footprintCount;
      setBuildingCount(total);

      if (realHeightCount > 0) {
        setHeightSource(`GIS (${realHeightCount} REAL / ${estimatedHeightCount} EST)`);
      } else {
        setHeightSource('ESTIMATED');
      }

      setStatus(`RENDER COMPLETE — ${total} STRUCTURES`);

    } catch (err) {
      console.error('GIS fetch error:', err);
      setStatus('API ERROR — LOADING SAMPLE DATA');
      loadSampleBuildings(scene);
    }
  }, []);

  const loadSampleBuildings = (scene: THREE.Scene) => {
    const material = new THREE.LineBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.7,
    });

    let count = 0;
    for (let i = 0; i < 150; i++) {
      const w = 1 + Math.random() * 4;
      const d = 1 + Math.random() * 4;
      const h = 1 + Math.random() * 20;
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;

      const geometry = new THREE.BoxGeometry(w, h, d);
      const edges = new THREE.EdgesGeometry(geometry);
      const wireframe = new THREE.LineSegments(edges, material);
      wireframe.position.set(x, h / 2, z);
      scene.add(wireframe);
      count++;
    }

    setBuildingCount(count);
    setHeightSource('SAMPLE (RANDOM)');
    setStatus(`SAMPLE RENDER — ${count} STRUCTURES`);
  };

  // ===== TRANSIT OVERLAY =====

  const loadTransit = useCallback(async () => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    // Remove previous transit group
    if (transitGroupRef.current) {
      scene.remove(transitGroupRef.current);
      transitGroupRef.current = null;
    }

    setTransitStatus('LOADING TRANSIT DATA...');

    const transitGroup = new THREE.Group();
    transitGroup.name = 'transit-overlay';

    // Materials
    const railLineMat = new THREE.LineBasicMaterial({
      color: 0xFF8800,
      transparent: true,
      opacity: 0.9,
      linewidth: 1,
    });

    const moverLineMat = new THREE.LineBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.7,
      linewidth: 1,
    });

    try {
      const [railLines, railStations, moverLines, moverStations] = await Promise.allSettled([
        fetchMetrorailLines(),
        fetchMetrorailStations(),
        fetchMetromoverLines(),
        fetchMetromoverStations(),
      ]);

      let stationCount = 0;

      // Metrorail lines
      if (railLines.status === 'fulfilled' && railLines.value.features.length > 0) {
        const lineGroup = buildTransitLineGeometry(
          railLines.value.features,
          RAIL_ELEVATION,
          railLineMat
        );
        transitGroup.add(lineGroup);
      }

      // Metrorail stations
      if (railStations.status === 'fulfilled' && railStations.value.features.length > 0) {
        const markerGroup = buildStationMarkers(
          railStations.value.features,
          RAIL_ELEVATION,
          0xFF8800,
          0.5
        );
        transitGroup.add(markerGroup);
        stationCount += railStations.value.features.length;
      }

      // Metromover lines
      if (moverLines.status === 'fulfilled' && moverLines.value.features.length > 0) {
        const lineGroup = buildTransitLineGeometry(
          moverLines.value.features,
          MOVER_ELEVATION,
          moverLineMat
        );
        transitGroup.add(lineGroup);
      }

      // Metromover stations
      if (moverStations.status === 'fulfilled' && moverStations.value.features.length > 0) {
        const markerGroup = buildStationMarkers(
          moverStations.value.features,
          MOVER_ELEVATION,
          0xFF6600,
          0.35
        );
        transitGroup.add(markerGroup);
        stationCount += moverStations.value.features.length;
      }

      scene.add(transitGroup);
      transitGroupRef.current = transitGroup;

      setTransitStatus(`TRANSIT: ${stationCount} STATIONS`);
    } catch (err) {
      console.error('Transit fetch error:', err);
      setTransitStatus('TRANSIT: API ERROR');
    }
  }, []);

  const removeTransit = useCallback(() => {
    if (!sceneRef.current || !transitGroupRef.current) return;
    sceneRef.current.scene.remove(transitGroupRef.current);
    transitGroupRef.current = null;
    setTransitStatus(null);
  }, []);

  // Handle overlay toggle
  useEffect(() => {
    if (activeOverlay === 'transit') {
      loadTransit();
    } else {
      removeTransit();
    }
  }, [activeOverlay, loadTransit, removeTransit]);

  // Init scene + load buildings
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanup = initScene(container);
    loadBuildings();

    return cleanup;
  }, [initScene, loadBuildings]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD overlay */}
      <div className="absolute top-2 left-3 text-[9px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
        <div>MIAMI-DADE COUNTY — BUILDING FOOTPRINT 2D</div>
        <div>DOWNTOWN/BRICKELL SECTOR</div>
        {transitStatus && (
          <div className="mt-1 glow-amber" style={{ color: '#FF8800' }}>{transitStatus}</div>
        )}
      </div>

      <div className="absolute top-2 right-3 text-[9px] tracking-[0.15em] uppercase text-right" style={{ color: '#993D00' }}>
        <div>STRUCTURES: {buildingCount}</div>
        <div>HEIGHT: {heightSource}</div>
        <div>MODE: WIREFRAME</div>
        {activeOverlay && (
          <div className="mt-1" style={{ color: '#FF8800' }}>OVERLAY: {activeOverlay.toUpperCase()}</div>
        )}
      </div>

      <div className="absolute bottom-2 left-3 text-[9px] tracking-[0.15em] uppercase glow-amber" style={{ color: '#FF6600' }}>
        {status}
      </div>

      <div className="absolute bottom-2 right-3 text-[9px] tracking-[0.15em] uppercase" style={{ color: '#993D00' }}>
        ORBIT: DRAG | ZOOM: SCROLL
      </div>
    </div>
  );
}
