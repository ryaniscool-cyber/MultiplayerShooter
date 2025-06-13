import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "../lib/stores/useGameState";

export function useGameLoop() {
  const { bullets, removeBullet } = useGameState();
  const lastUpdate = useRef(Date.now());

  useFrame((state, delta) => {
    const now = Date.now();
    
    // Clean up old bullets periodically
    if (now - lastUpdate.current > 1000) { // Every second
      bullets.forEach(bullet => {
        // Remove bullets that have been alive too long
        if (now - bullet.createdAt > 5000) { // 5 seconds
          removeBullet(bullet.id);
        }
      });
      
      lastUpdate.current = now;
    }
  });

  return null;
}
