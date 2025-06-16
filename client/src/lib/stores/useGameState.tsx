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
  storm: {
    isActive: boolean;
    centerX: number;
    centerZ: number;
    radius: number;
    damage: number;
    shrinkRate: number;
  };
  chests: {
    id: string;
    position: number[];
    opened: boolean;
    loot: string[];
  }[];

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

  // Storm actions
  startStorm: (centerX: number, centerZ: number, initialRadius: number) => void;
  updateStorm: (radius: number) => void;
  stopStorm: () => void;

  // Chest actions
  openChest: (chestId: string) => void;

  reset: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    players: {},
    bullets: [],
    localPlayerId: null,
    isConnected: false,
    gamePhase: "waiting",
    storm: {
      isActive: false,
      centerX: 0,
      centerZ: 0,
      radius: 50,
      damage: 1,
      shrinkRate: 0.5
    },
    chests: [
      { id: "chest1", position: [15, 1, 15], opened: false, loot: ["health", "ammo"] },
      { id: "chest2", position: [-15, 1, 15], opened: false, loot: ["weapon", "shield"] },
      { id: "chest3", position: [15, 1, -15], opened: false, loot: ["health", "weapon"] },
      { id: "chest4", position: [-15, 1, -15], opened: false, loot: ["ammo", "shield"] },
      { id: "chest5", position: [0, 1, 25], opened: false, loot: ["rare_weapon", "health"] },
      { id: "chest6", position: [25, 1, 0], opened: false, loot: ["shield", "ammo"] },
      { id: "chest7", position: [-25, 1, 0], opened: false, loot: ["health", "weapon"] },
      { id: "chest8", position: [0, 1, -25], opened: false, loot: ["ammo", "rare_weapon"] },
    ],

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

    // Storm actions
    startStorm: (centerX, centerZ, initialRadius) => set({
      storm: {
        isActive: true,
        centerX,
        centerZ,
        radius: initialRadius,
        damage: 1,
        shrinkRate: 0.5
      }
    }),

    updateStorm: (radius) => set(state => ({
      storm: { ...state.storm, radius }
    })),

    stopStorm: () => set(state => ({
      storm: { ...state.storm, isActive: false }
    })),

    // Chest actions
    openChest: (chestId) => set(state => ({
      chests: state.chests.map(chest => 
        chest.id === chestId ? { ...chest, opened: true } : chest
      )
    })),

    reset: () => set({
      players: {},
      bullets: [],
      localPlayerId: null,
      isConnected: false,
      gamePhase: "waiting",
      storm: {
        isActive: false,
        centerX: 0,
        centerZ: 0,
        radius: 50,
        damage: 1,
        shrinkRate: 0.5
      },
      chests: [
        { id: "chest1", position: [15, 1, 15], opened: false, loot: ["health", "ammo"] },
        { id: "chest2", position: [-15, 1, 15], opened: false, loot: ["weapon", "shield"] },
        { id: "chest3", position: [15, 1, -15], opened: false, loot: ["health", "weapon"] },
        { id: "chest4", position: [-15, 1, -15], opened: false, loot: ["ammo", "shield"] },
        { id: "chest5", position: [0, 1, 25], opened: false, loot: ["rare_weapon", "health"] },
        { id: "chest6", position: [25, 1, 0], opened: false, loot: ["shield", "ammo"] },
        { id: "chest7", position: [-25, 1, 0], opened: false, loot: ["health", "weapon"] },
        { id: "chest8", position: [0, 1, -25], opened: false, loot: ["ammo", "rare_weapon"] },
      ]
    })
  }))
);