import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./components/Game";
import GameUI from "./components/GameUI";
import { useGameState } from "./lib/stores/useGameState";
import { useAudio } from "./lib/stores/useAudio";
import "./index.css";

const queryClient = new QueryClient();

// Define control keys for the game
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  shoot = 'shoot',
}

const keyMap = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.shoot, keys: ['Mouse0', 'Mouse1'] },
];

function App() {
  const { gamePhase } = useGameState();

  // Initialize audio
  useEffect(() => {
    const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio.getState();

    // Load sounds
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = 0.5;
    setHitSound(hitSound);

    const successSound = new Audio('/sounds/success.mp3');
    successSound.volume = 0.7;
    setSuccessSound(successSound);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <KeyboardControls map={keyMap}>
          <Canvas
            camera={{
              position: [0, 2, 5],
              fov: 75,
              near: 0.1,
              far: 1000
            }}
            shadows
            style={{ background: '#87CEEB' }}
          >
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </Canvas>
          <GameUI />
        </KeyboardControls>
      </div>
    </QueryClientProvider>
  );
}

export default App;