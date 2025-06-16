
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";

interface Chest {
  position: [number, number, number];
  id: string;
  opened: boolean;
  loot: string[];
}

export default function SimpleArena() {
  const { storm } = useGameState();
  const stormRef = useRef<THREE.Mesh>(null);
  
  // Generate random chests across the map
  const chests: Chest[] = [
    { position: [15, 1, 15], id: "chest1", opened: false, loot: ["health", "ammo"] },
    { position: [-15, 1, 15], id: "chest2", opened: false, loot: ["weapon", "shield"] },
    { position: [15, 1, -15], id: "chest3", opened: false, loot: ["health", "weapon"] },
    { position: [-15, 1, -15], id: "chest4", opened: false, loot: ["ammo", "shield"] },
    { position: [0, 1, 25], id: "chest5", opened: false, loot: ["rare_weapon", "health"] },
    { position: [25, 1, 0], id: "chest6", opened: false, loot: ["shield", "ammo"] },
    { position: [-25, 1, 0], id: "chest7", opened: false, loot: ["health", "weapon"] },
    { position: [0, 1, -25], id: "chest8", opened: false, loot: ["ammo", "rare_weapon"] },
  ];

  // Storm animation
  useFrame((state) => {
    if (stormRef.current && storm.isActive) {
      stormRef.current.scale.setScalar(storm.radius);
      stormRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <>
      {/* Larger ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4a5d23" />
      </mesh>

      {/* Arena walls - much larger */}
      <mesh position={[0, 5, 50]} castShadow receiveShadow>
        <boxGeometry args={[100, 10, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 5, -50]} castShadow receiveShadow>
        <boxGeometry args={[100, 10, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[50, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 10, 100]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-50, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 10, 100]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Buildings and structures */}
      {/* Central building */}
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 10, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Corner buildings */}
      <mesh position={[20, 3, 20]} castShadow receiveShadow>
        <boxGeometry args={[6, 6, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[-20, 3, 20]} castShadow receiveShadow>
        <boxGeometry args={[6, 6, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[20, 3, -20]} castShadow receiveShadow>
        <boxGeometry args={[6, 6, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[-20, 3, -20]} castShadow receiveShadow>
        <boxGeometry args={[6, 6, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Trees scattered around */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 15 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.5, 4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 5, 0]} castShadow>
              <sphereGeometry args={[2]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      })}

      {/* Chests */}
      {chests.map((chest) => (
        <mesh 
          key={chest.id} 
          position={chest.position} 
          castShadow 
          receiveShadow
          userData={{ type: 'chest', ...chest }}
        >
          <boxGeometry args={[1.5, 1, 1]} />
          <meshStandardMaterial 
            color={chest.opened ? "#8B4513" : "#FFD700"} 
            emissive={chest.opened ? "#000" : "#FFA500"}
            emissiveIntensity={chest.opened ? 0 : 0.2}
          />
        </mesh>
      ))}

      {/* Storm visualization */}
      {storm.isActive && (
        <mesh ref={stormRef} position={[storm.centerX, 10, storm.centerZ]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color="#8A2BE2" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Storm damage zone (invisible collision) */}
      {storm.isActive && (
        <mesh position={[storm.centerX, 1, storm.centerZ]} visible={false}>
          <sphereGeometry args={[storm.radius + 5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </>
  );
}
