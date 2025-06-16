
import { useEffect, useRef } from "react";
import { useGameState } from "../lib/stores/useGameState";

export function useStorm() {
  const { storm, startStorm, updateStorm, players, localPlayerId, updatePlayer } = useGameState();
  const stormInterval = useRef<NodeJS.Timeout | null>(null);
  const damageInterval = useRef<NodeJS.Timeout | null>(null);

  // Start storm after game begins
  useEffect(() => {
    const gameTimer = setTimeout(() => {
      console.log('Starting storm!');
      startStorm(0, 0, 45); // Start at center with radius 45
    }, 30000); // Start storm after 30 seconds

    return () => clearTimeout(gameTimer);
  }, [startStorm]);

  // Storm shrinking logic
  useEffect(() => {
    if (storm.isActive && storm.radius > 10) {
      stormInterval.current = setInterval(() => {
        const newRadius = Math.max(10, storm.radius - storm.shrinkRate);
        updateStorm(newRadius);
        console.log(`Storm shrinking to radius: ${newRadius}`);
      }, 2000); // Shrink every 2 seconds
    } else if (stormInterval.current) {
      clearInterval(stormInterval.current);
    }

    return () => {
      if (stormInterval.current) {
        clearInterval(stormInterval.current);
      }
    };
  }, [storm.isActive, storm.radius, storm.shrinkRate, updateStorm]);

  // Storm damage logic
  useEffect(() => {
    if (storm.isActive && localPlayerId) {
      damageInterval.current = setInterval(() => {
        const player = players[localPlayerId];
        if (player) {
          const playerX = player.position[0];
          const playerZ = player.position[2];
          const distanceFromCenter = Math.sqrt(
            Math.pow(playerX - storm.centerX, 2) + 
            Math.pow(playerZ - storm.centerZ, 2)
          );

          // If player is outside storm circle, take damage
          if (distanceFromCenter > storm.radius) {
            const newHealth = Math.max(0, player.health - storm.damage);
            updatePlayer(localPlayerId, { health: newHealth });
            console.log(`Storm damage! Health: ${newHealth}`);
            
            if (newHealth <= 0) {
              updatePlayer(localPlayerId, { isAlive: false });
              console.log('Player died to storm!');
            }
          }
        }
      }, 1000); // Check damage every second
    } else if (damageInterval.current) {
      clearInterval(damageInterval.current);
    }

    return () => {
      if (damageInterval.current) {
        clearInterval(damageInterval.current);
      }
    };
  }, [storm.isActive, storm.radius, storm.centerX, storm.centerZ, storm.damage, players, localPlayerId, updatePlayer]);

  return storm;
}
