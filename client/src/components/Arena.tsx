import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Arena() {
  console.log("Arena component rendering");
  
  let grassTexture, woodTexture;
  
  try {
    grassTexture = useTexture("/textures/grass.png");
    woodTexture = useTexture("/textures/wood.jpg");
    
    // Configure texture repeating
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 1);
    console.log("Textures loaded successfully");
  } catch (error) {
    console.log("Textures failed to load, using fallback colors", error);
  }

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={grassTexture} color="#4a7c59" />
      </mesh>
      
      {/* Arena walls */}
      {/* North wall */}
      <mesh position={[0, 2.5, -20]} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial map={woodTexture} color="#8B4513" />
      </mesh>
      
      {/* South wall */}
      <mesh position={[0, 2.5, 20]} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial map={woodTexture} color="#8B4513" />
      </mesh>
      
      {/* West wall */}
      <mesh position={[-20, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial map={woodTexture} color="#8B4513" />
      </mesh>
      
      {/* East wall */}
      <mesh position={[20, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial map={woodTexture} color="#8B4513" />
      </mesh>
      
      {/* Some cover objects */}
      <mesh position={[5, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[-8, 1, 8]} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      
      <mesh position={[10, 1, -10]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="#556B2F" />
      </mesh>
      
      <mesh position={[-5, 1, -5]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}
