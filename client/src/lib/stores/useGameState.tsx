import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface Player {
  id: string;
  position: number[];
  rotation: number[];
  health: number;
  kills: number;
  deaths: number;
  isAlive: boolean;
}

interface Bullet {
  id: number;
  position: number[];
  direction: number[];
  playerId: string;
  speed: number;
  createdAt: number;
}

interface GameState {
  // Game state
  players: Record<string, Player>;
  bullets: Bullet[];
  localPlayerId: string | null;
  isConnected: boolean;
  gamePhase: 'waiting' | 'playing' | 'ended';
  
  // Actions
  setPlayers: (players: Record<string, Player>) => void;
  updatePlayer: (playerId: string, data: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  setLocalPlayerId: (playerId: string) => void;
  setIsConnected: (connected: boolean) => void;
  
  // Bullet actions
  addBullet: (bullet: Omit<Bullet, 'createdAt'>) => void;
  removeBullet: (bulletId: number) => void;
  clearBullets: () => void;
  
  // Game actions
  setGamePhase: (phase: 'waiting' | 'playing' | 'ended') => void;
  reset: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    players: {},
    bullets: [],
    localPlayerId: null,
    isConnected: false,
    gamePhase: 'waiting',
    
    // Player actions
    setPlayers: (players) => set({ players }),
    
    updatePlayer: (playerId, data) => set((state) => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          ...data,
          id: playerId
        }
      }
    })),
    
    removePlayer: (playerId) => set((state) => {
      const newPlayers = { ...state.players };
      delete newPlayers[playerId];
      return { players: newPlayers };
    }),
    
    setLocalPlayerId: (playerId) => set({ localPlayerId: playerId }),
    
    setIsConnected: (connected) => set({ isConnected: connected }),
    
    // Bullet actions
    addBullet: (bullet) => set((state) => ({
      bullets: [...state.bullets, { ...bullet, createdAt: Date.now() }]
    })),
    
    removeBullet: (bulletId) => set((state) => ({
      bullets: state.bullets.filter(bullet => bullet.id !== bulletId)
    })),
    
    clearBullets: () => set({ bullets: [] }),
    
    // Game actions
    setGamePhase: (phase) => set({ gamePhase: phase }),
    
    reset: () => set({
      players: {},
      bullets: [],
      localPlayerId: null,
      isConnected: false,
      gamePhase: 'waiting'
    })
  }))
);
