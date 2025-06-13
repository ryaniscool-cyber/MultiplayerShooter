import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useSocket } from "../hooks/useSocket";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

interface PlayerProps {
  playerId: string;
  playerData: any;
  isLocal: boolean;
}

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  shoot = 'shoot',
}

export default function Player({ playerId, playerData, isLocal }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const { socket } = useSocket();
  const { addBullet } = useGameState();
  const { playHit } = useAudio();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Movement state
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const isOnGround = useRef(true);
  const mouseMovement = useRef({ x: 0, y: 0 });
  
  // Shooting state
  const lastShotTime = useRef(0);
  const shootCooldown = 200; // ms between shots

  // Mouse look setup for local player
  useEffect(() => {
    if (!isLocal) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        mouseMovement.current.x += event.movementX * 0.002;
        mouseMovement.current.y += event.movementY * 0.002;
        mouseMovement.current.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouseMovement.current.y));
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isLocal, gl]);

  // Main game loop for local player
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (isLocal) {
      const keys = getKeys();
      const mesh = meshRef.current;
      
      // Mouse look
      camera.rotation.y = -mouseMovement.current.x;
      camera.rotation.x = -mouseMovement.current.y;
      
      // Movement input
      direction.current.set(0, 0, 0);
      
      if (keys.forward) direction.current.z -= 1;
      if (keys.backward) direction.current.z += 1;
      if (keys.left) direction.current.x -= 1;
      if (keys.right) direction.current.x += 1;
      
      // Normalize diagonal movement
      if (direction.current.length() > 0) {
        direction.current.normalize();
        
        // Apply camera rotation to movement direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const rightVector = new THREE.Vector3().crossVectors(cameraDirection, camera.up).normalize();
        
        const moveVector = new THREE.Vector3()
          .addScaledVector(rightVector, direction.current.x)
          .addScaledVector(cameraDirection, -direction.current.z);
        moveVector.y = 0; // Keep movement horizontal
        
        velocity.current.x = moveVector.x * 8;
        velocity.current.z = moveVector.z * 8;
      } else {
        velocity.current.x *= 0.8; // Friction
        velocity.current.z *= 0.8;
      }
      
      // Jumping
      if (keys.jump && isOnGround.current) {
        velocity.current.y = 12;
        isOnGround.current = false;
      }
      
      // Gravity
      velocity.current.y -= 30 * delta;
      
      // Update position
      mesh.position.add(velocity.current.clone().multiplyScalar(delta));
      
      // Ground collision
      if (mesh.position.y <= 1) {
        mesh.position.y = 1;
        velocity.current.y = 0;
        isOnGround.current = true;
      }
      
      // Arena boundaries
      mesh.position.x = Math.max(-20, Math.min(20, mesh.position.x));
      mesh.position.z = Math.max(-20, Math.min(20, mesh.position.z));
      
      // Camera follow
      camera.position.copy(mesh.position);
      camera.position.y += 1.8;
      
      // Shooting
      if (keys.shoot && Date.now() - lastShotTime.current > shootCooldown) {
        shoot();
        lastShotTime.current = Date.now();
      }
      
      // Send position update to server
      if (socket) {
        socket.emit('playerUpdate', {
          position: mesh.position.toArray(),
          rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
        });
      }
    } else {
      // Update non-local player from server data
      if (playerData.position) {
        meshRef.current.position.fromArray(playerData.position);
      }
    }
  });

  const shoot = () => {
    if (!meshRef.current || !socket) return;
    
    const position = meshRef.current.position.clone();
    position.y += 0.5; // Shoot from slightly above center
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    const bulletData = {
      id: Date.now() + Math.random(),
      position: position.toArray(),
      direction: direction.toArray(),
      playerId: playerId,
      speed: 50
    };
    
    // Add bullet locally for immediate feedback
    addBullet(bulletData);
    
    // Send to server
    socket.emit('shoot', bulletData);
    
    // Play sound
    playHit();
    
    console.log('Shot fired:', bulletData);
  };

  // Get player color based on health
  const getPlayerColor = () => {
    if (!playerData.health) return '#ff0000';
    const healthPercent = playerData.health / 100;
    if (healthPercent > 0.6) return '#00ff00';
    if (healthPercent > 0.3) return '#ffff00';
    return '#ff0000';
  };

  return (
    <mesh ref={meshRef} position={playerData.position || [0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color={getPlayerColor()} />
    </mesh>
  );
}
