import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function RotatingGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.1;
    }
  });

  // Simplified data points without useMemo to avoid reconciler bridge issues
  const dataPoints = [...Array(20)].map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / 20);
    const theta = Math.sqrt(20 * Math.PI) * phi;
    const x = 2.5 * Math.sin(phi) * Math.cos(theta);
    const y = 2.5 * Math.sin(phi) * Math.sin(theta);
    const z = 2.5 * Math.cos(phi);
    
    return (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#4ADE80" />
      </mesh>
    );
  });

  return (
    <>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={globeRef}>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshBasicMaterial 
            color="#1E293B" 
            wireframe 
            transparent 
            opacity={0.3} 
          />
        </mesh>
        
        {/* Core glow */}
        <Sphere args={[2.45, 64, 64]}>
          <meshPhongMaterial 
            color="#0066FF" 
            emissive="#0066FF" 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.1} 
          />
        </Sphere>

        {/* Data Points (Randomly placed for effect) */}
        {dataPoints}
      </Float>
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

export default function GlobeComponent() {
  return (
    <div className="w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RotatingGlobe />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
