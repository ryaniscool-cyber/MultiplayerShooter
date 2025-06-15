import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import SimpleArena from "./SimpleArena";
import LocalPlayer from "./LocalPlayer";
import Player from "./Player";
import Bullet from "./Bullet";
import { useSocket } from "../hooks/useSocket";
import { useGameState } from "../lib/stores/useGameState";
import { useGameLoop } from "../hooks/useGameLoop";

export default function Game() {
  const { camera, gl } = useThree();
  // Temporarily disable socket connection to fix movement
  // const { socket, isConnected } = useSocket();
  const { players, bullets, localPlayerId, isConnected, setLocalPlayerId, updatePlayer } = useGameState();
  const isConnected = false; // For now, just use local player

  // Initialize game loop
  useGameLoop();

  // Set up pointer lock for mouse look
  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      canvas.requestPointerLock();
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl]);

  // Initialize local player if not connected
  useEffect(() => {
    if (!isConnected && !localPlayerId) {
      const tempPlayerId = 'local-' + Date.now();
      setLocalPlayerId(tempPlayerId);
      updatePlayer(tempPlayerId, {
        id: tempPlayerId,
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        health: 100,
        kills: 0,
        deaths: 0,
        isAlive: true
      });
    }
  }, [isConnected, localPlayerId, setLocalPlayerId, updatePlayer]);

  // Lighting setup
  const Lights = () => (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
    </>
  );

  // Always render the arena and basic scene, even if not connected
  console.log('Game rendering - connected:', isConnected, 'players:', Object.keys(players).length);

  return (
    <>
      <Lights />
      <SimpleArena />
      <LocalPlayer />

      {/* Render multiplayer players when connected */}
      {isConnected && Object.entries(players).map(([playerId, playerData]) => (
        <Player
          key={playerId}
          playerId={playerId}
          playerData={playerData}
          isLocal={playerId === localPlayerId}
        />
      ))}

      {/* Render all bullets */}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </>
  );
}