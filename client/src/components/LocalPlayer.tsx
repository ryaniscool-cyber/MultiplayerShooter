import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, KeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  shoot = 'shoot',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.shoot, keys: ['Mouse0'] },
];

export default function LocalPlayer() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  const { addBullet } = useGameState();
  const { playHit } = useAudio();
  
  // Movement state
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const isOnGround = useRef(true);
  const mouseMovement = useRef({ x: 0, y: 0 });
  
  // Shooting state
  const lastShotTime = useRef(0);
  const shootCooldown = 200; // ms between shots
  
  // Mouse look setup
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        mouseMovement.current.x += event.movementX * 0.001; // Reduced sensitivity
        mouseMovement.current.y += event.movementY * 0.001; // Reduced sensitivity
        // Clamp vertical rotation
        mouseMovement.current.y = Math.max(-Math.PI/3, Math.min(Math.PI/3, mouseMovement.current.y));
      }
    };
    
    const handleMouseClick = (event: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement && meshRef.current) {
        shoot();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
    };
  }, [gl]);

  // Shooting function
  const shoot = () => {
    const now = Date.now();
    if (now - lastShotTime.current < shootCooldown || !meshRef.current) return;
    
    lastShotTime.current = now;
    
    const position = meshRef.current.position.clone();
    position.y += 0.5; // Shoot from slightly above center
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    const bulletData = {
      id: Date.now() + Math.random(),
      position: position.toArray(),
      direction: direction.toArray(),
      playerId: 'local-player',
      speed: 50,
      createdAt: now
    };
    
    // Add bullet locally
    addBullet(bulletData);
    
    // Play sound
    playHit();
    
    console.log('Shot fired:', bulletData);
  };

  // Main game loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const keys = getKeys();
    const mesh = meshRef.current;
    
    console.log('Keys pressed:', {
      forward: keys.forward,
      backward: keys.backward,
      left: keys.left,
      right: keys.right,
      jump: keys.jump
    });
    
    // Mouse look - apply rotation to camera
    camera.rotation.order = 'YXZ'; // Important for first-person controls
    camera.rotation.y = -mouseMovement.current.x;
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, -mouseMovement.current.y));
    
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
    
    // Shooting
    if (keys.shoot) {
      shoot();
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
    
    // Arena boundaries - much larger now
    mesh.position.x = Math.max(-49, Math.min(49, mesh.position.x));
    mesh.position.z = Math.max(-49, Math.min(49, mesh.position.z));
    
    // Camera follow
    camera.position.copy(mesh.position);
    camera.position.y += 1.8;
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#00ff00" />
    </mesh>
  );
}