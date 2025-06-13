import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";

interface BulletProps {
  bullet: {
    id: number;
    position: number[];
    direction: number[];
    playerId: string;
    speed: number;
  };
}

export default function Bullet({ bullet }: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { removeBullet, players } = useGameState();
  const direction = useRef(new THREE.Vector3().fromArray(bullet.direction));
  const lifetime = useRef(0);
  const maxLifetime = 5; // seconds

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.fromArray(bullet.position);
    }
  }, [bullet.position]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    lifetime.current += delta;
    
    // Remove bullet after max lifetime
    if (lifetime.current > maxLifetime) {
      removeBullet(bullet.id);
      return;
    }
    
    // Move bullet
    const movement = direction.current.clone().multiplyScalar(bullet.speed * delta);
    meshRef.current.position.add(movement);
    
    // Check collision with arena walls
    const pos = meshRef.current.position;
    if (Math.abs(pos.x) >= 19 || Math.abs(pos.z) >= 19 || pos.y <= 0 || pos.y >= 10) {
      removeBullet(bullet.id);
      return;
    }
    
    // Check collision with cover objects (simplified)
    const coverObjects = [
      { pos: [5, 1, 0], size: [2, 2, 6] },
      { pos: [-8, 1, 8], size: [3, 2, 3] },
      { pos: [10, 1, -10], size: [4, 2, 2] },
      { pos: [-5, 1, -5], size: [2, 2, 4] }
    ];
    
    for (const cover of coverObjects) {
      const distance = new THREE.Vector3().fromArray(cover.pos).distanceTo(pos);
      if (distance < 2) { // Simple collision detection
        removeBullet(bullet.id);
        return;
      }
    }
    
    // Check collision with players
    Object.entries(players).forEach(([playerId, playerData]) => {
      if (playerId === bullet.playerId) return; // Don't hit yourself
      
      if (playerData.position) {
        const playerPos = new THREE.Vector3().fromArray(playerData.position);
        const distance = playerPos.distanceTo(pos);
        
        if (distance < 1) { // Hit radius
          // TODO: Send hit event to server
          console.log(`Player ${playerId} hit by bullet from ${bullet.playerId}`);
          removeBullet(bullet.id);
          return;
        }
      }
    });
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
    </mesh>
  );
}
