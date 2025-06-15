import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useGameState } from "../lib/stores/useGameState";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { 
    setPlayers, 
    setLocalPlayerId, 
    addBullet, 
    removeBullet,
    updatePlayer 
  } = useGameState();

  useEffect(() => {
    // Connect to socket server
    const newSocket = io(window.location.origin || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: false
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setLocalPlayerId(newSocket.id);
      
      // Initialize local player in game state
      updatePlayer(newSocket.id, {
        id: newSocket.id,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        health: 100,
        kills: 0,
        deaths: 0,
        isAlive: true
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Game events
    newSocket.on('gameState', (gameState) => {
      console.log('Received game state:', gameState);
      setPlayers(gameState.players || {});
    });

    newSocket.on('playerJoined', (playerData) => {
      console.log('Player joined:', playerData);
      updatePlayer(playerData.id, playerData);
    });

    newSocket.on('playerLeft', (playerId) => {
      console.log('Player left:', playerId);
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });

    newSocket.on('bulletFired', (bulletData) => {
      console.log('Bullet fired by other player:', bulletData);
      addBullet(bulletData);
    });

    newSocket.on('bulletHit', (hitData) => {
      console.log('Bullet hit:', hitData);
      // Update player health
      updatePlayer(hitData.playerId, { health: hitData.newHealth });
      // Remove the bullet
      removeBullet(hitData.bulletId);
    });

    newSocket.on('playerUpdate', (playerData) => {
      updatePlayer(playerData.id, playerData);
    });

    newSocket.on('bulletFired', (bulletData) => {
      console.log('Bullet fired:', bulletData);
      addBullet(bulletData);
    });

    newSocket.on('bulletHit', (data) => {
      console.log('Bullet hit:', data);
      removeBullet(data.bulletId);
      if (data.playerId) {
        updatePlayer(data.playerId, { health: data.newHealth });
      }
    });

    newSocket.on('playerDied', (data) => {
      console.log('Player died:', data);
      updatePlayer(data.playerId, { 
        health: 0,
        deaths: (data.deaths || 0)
      });
      if (data.killerId) {
        updatePlayer(data.killerId, {
          kills: (data.kills || 0)
        });
      }
    });

    newSocket.on('playerRespawned', (playerData) => {
      console.log('Player respawned:', playerData);
      updatePlayer(playerData.id, playerData);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
}
