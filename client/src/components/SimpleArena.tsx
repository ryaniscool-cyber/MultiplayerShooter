import * as THREE from "three";

export default function SimpleArena() {
  console.log("SimpleArena rendering");
  
  return (
    <group>
      {/* Simple ground - bright green for visibility */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
      
      {/* Bright colored walls for visibility */}
      <mesh position={[0, 2.5, -20]} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      <mesh position={[0, 2.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      <mesh position={[-20, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      <mesh position={[20, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Cover objects with bright colors */}
      <mesh position={[5, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 6]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
      
      <mesh position={[-8, 1, 8]} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>
      
      <mesh position={[10, 1, -10]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="#ff00ff" />
      </mesh>
      
      <mesh position={[-5, 1, -5]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 4]} />
        <meshStandardMaterial color="#00ffff" />
      </mesh>
      
      {/* Test cube in the center */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}