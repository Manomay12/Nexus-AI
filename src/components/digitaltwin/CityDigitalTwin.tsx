import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useNexus } from '../../context/NexusContext';
import { CityZone } from '../../types/nexus';
import { 
  Eye, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  Compass, 
  Maximize2,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CityDigitalTwinProps {
  onSelectZone?: (zone: CityZone) => void;
  heightClass?: string;
  showControls?: boolean;
}

export const CityDigitalTwin: React.FC<CityDigitalTwinProps> = ({ 
  onSelectZone,
  heightClass = 'h-full min-h-[500px]',
  showControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    zones, 
    selectedZone, 
    setSelectedZone, 
    mapLayers, 
    simulationImpact, 
    hasExecutedPlan,
    activePlan
  } = useNexus();

  const [hoveredZone, setHoveredZone] = useState<CityZone | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'stadium' | 'transit'>('overview');
  const [fps, setFps] = useState<number>(60);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const crowdParticlesRef = useRef<THREE.Points | null>(null);
  const trafficParticlesRef = useRef<THREE.Points | null>(null);
  const clickableObjectsRef = useRef<{ mesh: THREE.Object3D; zone: CityZone }[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Interactive camera drag states
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 42 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070e);
    scene.fog = new THREE.FogExp2(0x05070e, 0.015);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear container and append canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x10172e, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const purpleLight = new THREE.DirectionalLight(0x8b5cf6, 2.0);
    purpleLight.position.set(-25, 30, -20);
    scene.add(purpleLight);

    // 5. Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(120, 120, 60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070b16,
      roughness: 0.85,
      metalness: 0.2,
      wireframe: false
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    scene.add(groundMesh);

    // Cyber Grid
    const gridHelper = new THREE.GridHelper(100, 40, 0x00f0ff, 0x111c38);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Concentric Radar Rings
    for (let r = 10; r <= 45; r += 12) {
      const ringGeo = new THREE.RingGeometry(r - 0.05, r + 0.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0x0066ff, 
        transparent: true, 
        opacity: 0.18, 
        side: THREE.DoubleSide 
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.02;
      scene.add(ringMesh);
    }

    // 6. Procedural Futuristic City Buildings
    clickableObjectsRef.current = [];
    const buildingBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Building materials
    const darkBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x0c1327,
      roughness: 0.4,
      metalness: 0.8
    });

    const cyanEdgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });
    const blueEdgeMat = new THREE.LineBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.4 });
    const purpleEdgeMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 });

    // Procedural blocks across grid
    const citySize = 38;
    for (let x = -citySize; x <= citySize; x += 4) {
      for (let z = -citySize; z <= citySize; z += 4) {
        // Leave center open for Grand Arena Stadium
        const distFromCenter = Math.hypot(x, z);
        if (distFromCenter < 8) continue;
        
        // Skip some slots for roads
        if (Math.abs(x) % 8 === 0 || Math.abs(z) % 8 === 0) continue;
        if (Math.random() > 0.65) continue;

        const bHeight = 2 + Math.pow(Math.random(), 1.5) * 12;
        const bWidth = 2.2 + Math.random() * 0.8;
        const bDepth = 2.2 + Math.random() * 0.8;

        const bMesh = new THREE.Mesh(buildingBoxGeo, darkBuildingMat);
        bMesh.scale.set(bWidth, bHeight, bDepth);
        bMesh.position.set(x + (Math.random() - 0.5) * 0.5, bHeight / 2, z + (Math.random() - 0.5) * 0.5);
        scene.add(bMesh);

        // Building Wireframe Edges
        const edges = new THREE.EdgesGeometry(buildingBoxGeo);
        const edgeLine = new THREE.LineSegments(
          edges, 
          bHeight > 8 ? cyanEdgeMat : (x > 0 ? purpleEdgeMat : blueEdgeMat)
        );
        edgeLine.scale.copy(bMesh.scale);
        edgeLine.position.copy(bMesh.position);
        scene.add(edgeLine);

        // Roof Beacon light on taller towers
        if (bHeight > 9) {
          const roofBeaconGeo = new THREE.SphereGeometry(0.18, 8, 8);
          const roofBeaconMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
          const roofBeacon = new THREE.Mesh(roofBeaconGeo, roofBeaconMat);
          roofBeacon.position.set(bMesh.position.x, bHeight + 0.2, bMesh.position.z);
          scene.add(roofBeacon);
        }
      }
    }

    // 7. Grand Arena / Mega-Event Stadium (Centerpiece)
    const venueZone = zones.find(z => z.type === 'venue') || zones[0];
    const stadiumGroup = new THREE.Group();

    // Stadium Outer Shell Dome
    const stadiumGeo = new THREE.CylinderGeometry(5.2, 6.0, 2.4, 32);
    const stadiumMat = new THREE.MeshStandardMaterial({
      color: 0x0a1428,
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0x002244,
      emissiveIntensity: 0.4
    });
    const stadiumMesh = new THREE.Mesh(stadiumGeo, stadiumMat);
    stadiumMesh.position.y = 1.2;
    stadiumGroup.add(stadiumMesh);

    // Glowing Inner Arena Field
    const fieldGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.4, 32);
    const fieldMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
    fieldMesh.position.y = 2.3;
    stadiumGroup.add(fieldMesh);

    // Volumetric Crowd Light Dome
    const lightDomeGeo = new THREE.SphereGeometry(4.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lightDomeMat = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      transparent: true,
      opacity: 0.22,
      wireframe: true
    });
    const lightDomeMesh = new THREE.Mesh(lightDomeGeo, lightDomeMat);
    lightDomeMesh.position.y = 2.2;
    stadiumGroup.add(lightDomeMesh);

    // Pulsing Central Light Beam
    const beamGeo = new THREE.CylinderGeometry(0.2, 1.8, 25, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 12.5;
    stadiumGroup.add(beamMesh);

    scene.add(stadiumGroup);
    clickableObjectsRef.current.push({ mesh: stadiumMesh, zone: venueZone });

    // 8. Zone Specific Beacons & Interactive Landmarks
    zones.forEach((zone) => {
      const zGroup = new THREE.Group();
      const zColor = zone.riskLevel === 'CRITICAL' ? 0xef4444 : 
                     zone.riskLevel === 'HIGH' ? 0xf59e0b : 
                     zone.riskLevel === 'MODERATE' ? 0x00f0ff : 0x10b981;

      // Base Pillar / Landmark
      let markMesh: THREE.Mesh;
      if (zone.type === 'transport_hub') {
        const hubGeo = new THREE.TorusGeometry(1.6, 0.25, 12, 32);
        const hubMat = new THREE.MeshStandardMaterial({ 
          color: zColor, 
          emissive: zColor, 
          emissiveIntensity: 0.6,
          metalness: 0.8 
        });
        markMesh = new THREE.Mesh(hubGeo, hubMat);
        markMesh.rotation.x = Math.PI / 2;
        markMesh.position.set(zone.coordinates.x, 1.2, zone.coordinates.z);
      } else if (zone.type === 'hospitality') {
        const hotelGeo = new THREE.BoxGeometry(2.4, 6.5, 2.4);
        const hotelMat = new THREE.MeshStandardMaterial({
          color: 0x111e3b,
          emissive: zColor,
          emissiveIntensity: 0.35,
          metalness: 0.7
        });
        markMesh = new THREE.Mesh(hotelGeo, hotelMat);
        markMesh.position.set(zone.coordinates.x, 3.25, zone.coordinates.z);
      } else {
        const towerGeo = new THREE.CylinderGeometry(1.2, 1.6, 4.5, 6);
        const towerMat = new THREE.MeshStandardMaterial({
          color: 0x0e172f,
          emissive: zColor,
          emissiveIntensity: 0.4
        });
        markMesh = new THREE.Mesh(towerGeo, towerMat);
        markMesh.position.set(zone.coordinates.x, 2.25, zone.coordinates.z);
      }

      zGroup.add(markMesh);

      // Floating Holographic Ring & Beacon
      const ringGeo = new THREE.RingGeometry(1.8, 2.1, 32);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: zColor, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.7 
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(zone.coordinates.x, 0.1, zone.coordinates.z);
      zGroup.add(ringMesh);

      // Top floating pin
      const pinGeo = new THREE.OctahedronGeometry(0.5, 0);
      const pinMat = new THREE.MeshBasicMaterial({ color: zColor });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(zone.coordinates.x, 7.5, zone.coordinates.z);
      zGroup.add(pinMesh);

      scene.add(zGroup);
      clickableObjectsRef.current.push({ mesh: markMesh, zone });
    });

    // 9. Animated Transport Highways
    const roadCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-30, 0.15, -15),
      new THREE.Vector3(-15, 0.15, -8),
      new THREE.Vector3(0, 0.15, 0),
      new THREE.Vector3(15, 0.15, -10),
      new THREE.Vector3(30, 0.15, -20)
    ]);
    const roadPoints1 = roadCurve1.getPoints(50);
    const roadGeo1 = new THREE.BufferGeometry().setFromPoints(roadPoints1);
    const roadMat1 = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const roadLine1 = new THREE.Line(roadGeo1, roadMat1);
    scene.add(roadLine1);

    const roadCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.15, 0),
      new THREE.Vector3(8, 0.15, 10),
      new THREE.Vector3(20, 0.15, 25)
    ]);
    const roadPoints2 = roadCurve2.getPoints(30);
    const roadGeo2 = new THREE.BufferGeometry().setFromPoints(roadPoints2);
    const roadMat2 = new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 2 });
    const roadLine2 = new THREE.Line(roadGeo2, roadMat2);
    scene.add(roadLine2);

    // 10. Crowd Movement Particle System
    const crowdCount = 750;
    const crowdGeo = new THREE.BufferGeometry();
    const crowdPositions = new Float32Array(crowdCount * 3);
    const crowdVelocities = new Float32Array(crowdCount * 3);
    const crowdColors = new Float32Array(crowdCount * 3);

    for (let i = 0; i < crowdCount; i++) {
      // Start around stadium and disperse
      const angle = Math.random() * Math.PI * 2;
      const dist = 3 + Math.random() * 22;
      crowdPositions[i * 3] = Math.cos(angle) * dist;
      crowdPositions[i * 3 + 1] = 0.2 + Math.random() * 0.4;
      crowdPositions[i * 3 + 2] = Math.sin(angle) * dist;

      crowdVelocities[i * 3] = (Math.cos(angle) * 0.04);
      crowdVelocities[i * 3 + 1] = 0;
      crowdVelocities[i * 3 + 2] = (Math.sin(angle) * 0.04);

      // Color from Cyan to Red depending on pressure
      crowdColors[i * 3] = 0.0;     // R
      crowdColors[i * 3 + 1] = 0.94; // G
      crowdColors[i * 3 + 2] = 1.0;  // B
    }

    crowdGeo.setAttribute('position', new THREE.BufferAttribute(crowdPositions, 3));
    crowdGeo.setAttribute('color', new THREE.BufferAttribute(crowdColors, 3));

    const crowdMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const crowdParticles = new THREE.Points(crowdGeo, crowdMat);
    scene.add(crowdParticles);
    crowdParticlesRef.current = crowdParticles;

    // 11. Vehicle Traffic Particles along highway ribbons
    const vehicleCount = 120;
    const vehicleGeo = new THREE.BufferGeometry();
    const vehiclePos = new Float32Array(vehicleCount * 3);
    for (let i = 0; i < vehicleCount; i++) {
      const t = Math.random();
      const pt = i % 2 === 0 ? roadCurve1.getPoint(t) : roadCurve2.getPoint(t);
      vehiclePos[i * 3] = pt.x;
      vehiclePos[i * 3 + 1] = pt.y + 0.15;
      vehiclePos[i * 3 + 2] = pt.z;
    }
    vehicleGeo.setAttribute('position', new THREE.BufferAttribute(vehiclePos, 3));
    const vehicleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.55,
      transparent: true,
      opacity: 0.95
    });
    const vehicleParticles = new THREE.Points(vehicleGeo, vehicleMat);
    scene.add(vehicleParticles);
    trafficParticlesRef.current = vehicleParticles;

    // 12. Mouse & Drag Interaction Listeners
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2) isPanningRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      if (isDraggingRef.current) {
        cameraAngleRef.current.theta -= deltaX * 0.006;
        cameraAngleRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.006));
        updateCameraPosition();
      } else if (isPanningRef.current) {
        const panSpeed = 0.05;
        cameraTargetRef.current.x -= deltaX * panSpeed;
        cameraTargetRef.current.z -= deltaY * panSpeed;
        updateCameraPosition();
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      // Raycasting for hover detection
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
        -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const hitObjects = clickableObjectsRef.current.map(c => c.mesh);
      const intersects = raycaster.intersectObjects(hitObjects, true);

      if (intersects.length > 0) {
        const found = clickableObjectsRef.current.find(c => c.mesh === intersects[0].object || c.mesh.children.includes(intersects[0].object));
        if (found) {
          setHoveredZone(found.zone);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredZone(null);
        container.style.cursor = 'grab';
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Check for clean click without drag
      const deltaTotal = Math.abs(e.clientX - previousMousePositionRef.current.x) + Math.abs(e.clientY - previousMousePositionRef.current.y);
      if (deltaTotal < 5 && e.button === 0) {
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
          -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const hitObjects = clickableObjectsRef.current.map(c => c.mesh);
        const intersects = raycaster.intersectObjects(hitObjects, true);

        if (intersects.length > 0) {
          const found = clickableObjectsRef.current.find(c => c.mesh === intersects[0].object || c.mesh.children.includes(intersects[0].object));
          if (found) {
            setSelectedZone(found.zone);
            if (onSelectZone) onSelectZone(found.zone);
            soundFx.playClick();
          }
        }
      }

      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(12, Math.min(85, cameraAngleRef.current.radius + e.deltaY * 0.04));
      updateCameraPosition();
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('contextmenu', handleContextMenu);

    // 13. Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 14. Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const animate = (time: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // FPS tracking
      frameCount++;
      if (time - fpsTimer >= 1000) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      // Rotate light beam & dome
      if (beamMesh) {
        beamMesh.rotation.y += 0.01;
      }
      if (lightDomeMesh) {
        lightDomeMesh.rotation.y -= 0.003;
      }

      // Animate crowd particle dispersal
      if (crowdParticlesRef.current) {
        const positions = crowdParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const colors = crowdParticlesRef.current.geometry.attributes.color.array as Float32Array;
        
        // Speed modifier based on simulation
        const speed = simulationImpact.compositePressureScore > 80 ? 0.08 : 0.04;

        for (let i = 0; i < crowdCount; i++) {
          const idx = i * 3;
          positions[idx] += crowdVelocities[idx] * speed * (1 + Math.sin(time * 0.002 + i));
          positions[idx + 2] += crowdVelocities[idx + 2] * speed * (1 + Math.cos(time * 0.002 + i));

          // Reset when particle reaches boundary
          const dist = Math.hypot(positions[idx], positions[idx + 2]);
          if (dist > 35) {
            const angle = Math.random() * Math.PI * 2;
            positions[idx] = Math.cos(angle) * 3;
            positions[idx + 2] = Math.sin(angle) * 3;
          }

          // Dynamic particle color based on pressure
          if (simulationImpact.compositePressureScore >= 80) {
            colors[idx] = 0.95;     // Red
            colors[idx + 1] = 0.2;  // Low Green
            colors[idx + 2] = 0.2;  // Low Blue
          } else if (simulationImpact.compositePressureScore >= 60) {
            colors[idx] = 0.95;     // Orange/Yellow
            colors[idx + 1] = 0.7;
            colors[idx + 2] = 0.1;
          } else {
            colors[idx] = 0.0;      // Cyan
            colors[idx + 1] = 0.94;
            colors[idx + 2] = 1.0;
          }
        }
        crowdParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        crowdParticlesRef.current.geometry.attributes.color.needsUpdate = true;
      }

      // Animate highway vehicles
      if (trafficParticlesRef.current) {
        const pos = trafficParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < vehicleCount; i++) {
          const t = (time * 0.00015 + (i / vehicleCount)) % 1;
          const curve = i % 2 === 0 ? roadCurve1 : roadCurve2;
          const pt = curve.getPoint(t);
          pos[i * 3] = pt.x;
          pos[i * 3 + 1] = pt.y + 0.15;
          pos[i * 3 + 2] = pt.z;
        }
        trafficParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Visibility toggles based on mapLayers
      if (crowdParticlesRef.current) {
        crowdParticlesRef.current.visible = mapLayers.crowdDensity;
      }
      if (trafficParticlesRef.current) {
        trafficParticlesRef.current.visible = mapLayers.traffic;
      }

      renderer.render(scene, camera);
      lastTime = time;
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('contextmenu', handleContextMenu);
      
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [zones, mapLayers.crowdDensity, mapLayers.traffic, simulationImpact.compositePressureScore]);

  // Camera updater
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  const handleResetCamera = (preset: 'overview' | 'stadium' | 'transit') => {
    soundFx.playClick();
    setCameraPreset(preset);
    if (preset === 'overview') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 44 };
      cameraTargetRef.current.set(0, 0, 0);
    } else if (preset === 'stadium') {
      cameraAngleRef.current = { theta: Math.PI / 6, phi: Math.PI / 4, radius: 18 };
      cameraTargetRef.current.set(0, 2, 0);
    } else if (preset === 'transit') {
      cameraAngleRef.current = { theta: -Math.PI / 3, phi: Math.PI / 3.2, radius: 30 };
      cameraTargetRef.current.set(-8, 1, -10);
    }
    updateCameraPosition();
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-white/10 bg-[#05070E]`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD: Digital Twin telemetry overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div className="text-xs font-mono tracking-wider text-cyan-300 uppercase">
            3D DIGITAL TWIN // LIVE TELEMETRY
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-l border-white/10 pl-2">
            FPS: <span className="text-emerald-400 font-bold">{fps}</span>
          </div>
        </div>

        {hasExecutedPlan && (
          <div className="glass-panel px-3 py-1.5 rounded-lg border-emerald-500/40 bg-emerald-950/40 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">
              Orchestration Active: {activePlan.title} (-{activePlan.expectedCongestionReduction}%)
            </span>
          </div>
        )}
      </div>

      {/* Top Right: Camera Presets & Layer HUD */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="glass-panel p-1 rounded-xl flex items-center gap-1 shadow-spatial">
            <button
              onClick={() => handleResetCamera('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                cameraPreset === 'overview' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleResetCamera('stadium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                cameraPreset === 'stadium' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Arena Core
            </button>
            <button
              onClick={() => handleResetCamera('transit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                cameraPreset === 'transit' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Transit Axis
            </button>
            <button
              onClick={() => handleResetCamera('overview')}
              title="Reset View"
              className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Hover Tooltip */}
      {hoveredZone && !selectedZone && (
        <div className="absolute bottom-6 left-6 z-10 glass-panel p-3 rounded-xl border border-cyan-500/30 pointer-events-none max-w-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white">{hoveredZone.name}</span>
          </div>
          <p className="text-[11px] text-slate-300">{hoveredZone.aiSummary}</p>
          <div className="mt-2 text-[10px] text-cyan-300 font-mono flex items-center justify-between">
            <span>Pressure: {hoveredZone.currentPressure}%</span>
            <span className="text-amber-300 font-bold">{hoveredZone.riskLevel}</span>
          </div>
        </div>
      )}

      {/* Floating Spatial Inspection Panel when a Zone is Selected */}
      {selectedZone && (
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-4 rounded-2xl border border-cyan-500/30 max-w-sm w-full shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedZone.riskLevel === 'CRITICAL' ? 'bg-red-500 shadow-glow-danger' :
                  selectedZone.riskLevel === 'HIGH' ? 'bg-amber-500 shadow-glow-warning' : 'bg-cyan-400 shadow-glow-cyan'
                }`} />
                <h4 className="text-sm font-bold text-white font-display">{selectedZone.name}</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{selectedZone.district}</span>
            </div>
            <button 
              onClick={() => {
                soundFx.playClick();
                setSelectedZone(null);
              }}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Hotel Capacity</span>
              <div className="text-sm font-bold text-white flex items-center justify-between mt-0.5">
                <span>{selectedZone.hotelCapacityPercent}%</span>
                <span className="text-[10px] text-cyan-400">{selectedZone.availableRooms} rooms</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full ${selectedZone.hotelCapacityPercent > 90 ? 'bg-red-400' : 'bg-cyan-400'}`} 
                  style={{ width: `${selectedZone.hotelCapacityPercent}%` }} 
                />
              </div>
            </div>

            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Transport Load</span>
              <div className="text-sm font-bold text-white flex items-center justify-between mt-0.5">
                <span>{selectedZone.transportLoadPercent}%</span>
                <span className="text-[10px] text-violet-400">{selectedZone.stationCongestion}% congestion</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full ${selectedZone.transportLoadPercent > 90 ? 'bg-red-400' : 'bg-violet-400'}`} 
                  style={{ width: `${selectedZone.transportLoadPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* AI Risk Prediction HUD */}
          <div className="bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 p-2.5 rounded-xl border border-cyan-500/20 mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-cyan-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> AI Risk Prediction:
              </span>
              <span className="font-bold text-amber-400 text-[11px] font-mono">
                {selectedZone.predictedPressure}% IN 45 MINS
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{selectedZone.aiSummary}</p>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <span className="text-[10px] text-slate-400">Rec: {selectedZone.recommendedAction.slice(0, 32)}...</span>
            <button
              onClick={() => {
                soundFx.playSuccess();
                // Execute quick action for zone
              }}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-glow-cyan flex items-center gap-1"
            >
              <span>Orchestrate</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Controls Hint */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400 glass-panel px-3 py-1 rounded-full">
        <span>🖱 Left Drag: Rotate</span>
        <span>•</span>
        <span>Wheel: Zoom</span>
        <span>•</span>
        <span>Right Drag: Pan</span>
        <span>•</span>
        <span>Click Landmark: Telemetry</span>
      </div>
    </div>
  );
};
