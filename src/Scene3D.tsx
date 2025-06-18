import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, TransformControls, Line, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from './store';
import { Body } from './physics';

// Individual Body Component
function BodyMesh({ body, isSelected, onSelect }: { 
  body: Body; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { editMode, showVelocityVectors } = useSimulationStore();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(body.position);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (editMode !== 'simulate') {
      onSelect();
    }
  };

  return (
    <group>
      {/* Main body sphere */}
      <Sphere
        ref={meshRef}
        args={[body.radius, 32, 32]}
        onClick={handleClick}
        position={[body.position.x, body.position.y, body.position.z]}
      >
        <meshStandardMaterial 
          color={body.color} 
          emissive={isSelected ? body.color : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>
      
      {/* Velocity vector */}
      {showVelocityVectors && (
        <VelocityVector 
          position={body.position} 
          velocity={body.velocity} 
          color={body.color}
        />
      )}
      
      {/* Mass label */}
      <Text
        position={[body.position.x, body.position.y + body.radius + 0.5, body.position.z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {body.mass.toFixed(1)}
      </Text>
    </group>
  );
}

// Velocity Vector Component
function VelocityVector({ position, velocity, color }: {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
}) {
  const points = [
    position,
    new THREE.Vector3().addVectors(position, velocity.clone().multiplyScalar(2))
  ];
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed={false}
    />
  );
}

// Trail Component
function Trail({ trail, color }: { trail: THREE.Vector3[]; color: string }) {
  if (trail.length < 2) return null;
  
  return (
    <Line
      points={trail}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.6}
    />
  );
}

// Body Transform Control
function BodyTransformControl({ body }: { body: Body }) {
  const { updateBody, editMode } = useSimulationStore();
  
  if (editMode === 'simulate') return null;

  return (
    <TransformControls
      object-position={[body.position.x, body.position.y, body.position.z]}
      mode="translate"
      onObjectChange={(e) => {
        if (e && e.target) {
          const newPosition = new THREE.Vector3();
          e.target.getWorldPosition(newPosition);
          updateBody(body.id, { position: newPosition });
        }
      }}
    />
  );
}

// Animation Loop Component
function AnimationLoop() {
  const { isRunning, stepSimulation } = useSimulationStore();
  
  useFrame(() => {
    if (isRunning) {
      stepSimulation();
    }
  });
  
  return null;
}

// Scene Content Component (everything inside Canvas)
function SceneContent() {
  const {
    bodies,
    selectedBodyId,
    selectBody,
    addBody,
    editMode,
    showTrails
  } = useSimulationStore();

  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    if (editMode === 'place') {
      const newBody: Body = {
        id: Math.random().toString(36).substr(2, 9),
        position: e.point.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        mass: 1.0,
        radius: 0.3,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        trail: []
      };
      addBody(newBody);
      selectBody(newBody.id);
    } else {
      selectBody(null);
    }
  };

  return (
    <>
      {/* Animation Loop */}
      <AnimationLoop />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxDistance={50}
        minDistance={2}
      />
      
      {/* Grid and Axes */}
      <gridHelper args={[20, 20, '#444444', '#222222']} />
      <axesHelper args={[5]} />
      
      {/* Bodies */}
      {bodies.map((body) => (
        <group key={body.id}>
          <BodyMesh
            body={body}
            isSelected={body.id === selectedBodyId}
            onSelect={() => selectBody(body.id)}
          />
          
          {/* Transform controls for selected body */}
          {body.id === selectedBodyId && editMode !== 'simulate' && (
            <BodyTransformControl body={body} />
          )}
          
          {/* Trails */}
          {showTrails && body.trail.length > 1 && (
            <Trail trail={body.trail} color={body.color} />
          )}
        </group>
      ))}
      
      {/* Clickable plane for body placement */}
      <mesh
        onClick={handleCanvasClick}
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

// Main Scene Component
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 60 }}
      style={{ background: '#000814' }}
    >
      <SceneContent />
    </Canvas>
  );
}