import { Server as SocketIOServer, Socket } from "socket.io";

interface Player {
  id: string;
  position: number[];
  rotation: number[];
  health: number;
  kills: number;
  deaths: number;
  isAlive: boolean;
  lastUpdate: number;
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
  players: Record<string, Player>;
  bullets: Bullet[];
  gameStartTime: number;
}

export function setupGameServer(io: SocketIOServer) {
  const gameState: GameState = {
    players: {},
    bullets: [],
    gameStartTime: Date.now()
  };

  // Game loop
  const TICK_RATE = 60; // 60 FPS
  const TICK_INTERVAL = 1000 / TICK_RATE;
  
  setInterval(() => {
    updateGame();
    broadcastGameState();
  }, TICK_INTERVAL);

  function updateGame() {
    const now = Date.now();
    
    // Update bullets
    gameState.bullets = gameState.bullets.filter(bullet => {
      // Remove old bullets
      if (now - bullet.createdAt > 5000) return false;
      
      // Move bullets (this is simplified - actual movement happens on client)
      // Here we just handle collisions and cleanup
      
      // Check for player hits
      Object.values(gameState.players).forEach(player => {
        if (player.id === bullet.playerId || !player.isAlive) return;
        
        // Simple distance check for hit detection
        const bulletPos = bullet.position;
        const playerPos = player.position;
        
        if (bulletPos && playerPos) {
          const distance = Math.sqrt(
            Math.pow(bulletPos[0] - playerPos[0], 2) +
            Math.pow(bulletPos[1] - playerPos[1], 2) +
            Math.pow(bulletPos[2] - playerPos[2], 2)
          );
          
          if (distance < 1) { // Hit!
            handlePlayerHit(player.id, bullet);
            return false; // Remove bullet
          }
        }
      });
      
      return true;
    });
    
    // Check for dead players to respawn
    Object.values(gameState.players).forEach(player => {
      if (!player.isAlive && now - player.lastUpdate > 3000) { // Respawn after 3 seconds
        respawnPlayer(player.id);
      }
    });
  }

  function handlePlayerHit(playerId: string, bullet: Bullet) {
    const player = gameState.players[playerId];
    const shooter = gameState.players[bullet.playerId];
    
    if (!player || !shooter) return;
    
    const damage = 25; // Damage per hit
    player.health = Math.max(0, player.health - damage);
    player.lastUpdate = Date.now();
    
    io.emit('bulletHit', {
      bulletId: bullet.id,
      playerId: player.id,
      newHealth: player.health,
      damage: damage
    });
    
    if (player.health <= 0) {
      // Player died
      player.isAlive = false;
      player.deaths += 1;
      shooter.kills += 1;
      
      io.emit('playerDied', {
        playerId: player.id,
        killerId: shooter.id,
        kills: shooter.kills,
        deaths: player.deaths
      });
      
      console.log(`Player ${player.id} killed by ${shooter.id}`);
    }
  }

  function respawnPlayer(playerId: string) {
    const player = gameState.players[playerId];
    if (!player) return;
    
    // Reset player state
    player.health = 100;
    player.isAlive = true;
    player.position = getRandomSpawnPosition();
    player.lastUpdate = Date.now();
    
    io.emit('playerRespawned', {
      id: player.id,
      position: player.position,
      health: player.health,
      isAlive: player.isAlive
    });
    
    console.log(`Player ${playerId} respawned`);
  }

  function getRandomSpawnPosition(): number[] {
    // Return random spawn position within arena
    return [
      (Math.random() - 0.5) * 30, // x: -15 to 15
      1, // y: ground level
      (Math.random() - 0.5) * 30  // z: -15 to 15
    ];
  }

  function broadcastGameState() {
    io.emit('gameState', {
      players: gameState.players,
      bullets: gameState.bullets.length,
      timestamp: Date.now()
    });
  }

  // Socket event handlers
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Create new player
    const newPlayer: Player = {
      id: socket.id,
      position: getRandomSpawnPosition(),
      rotation: [0, 0, 0],
      health: 100,
      kills: 0,
      deaths: 0,
      isAlive: true,
      lastUpdate: Date.now()
    };
    
    gameState.players[socket.id] = newPlayer;
    
    // Send current game state to new player
    socket.emit('gameState', gameState);
    
    // Notify other players
    socket.broadcast.emit('playerJoined', newPlayer);

    // Handle player updates
    socket.on('playerUpdate', (data) => {
      const player = gameState.players[socket.id];
      if (player && player.isAlive) {
        player.position = data.position || player.position;
        player.rotation = data.rotation || player.rotation;
        player.lastUpdate = Date.now();
        
        // Broadcast to other players
        socket.broadcast.emit('playerUpdate', {
          id: socket.id,
          position: player.position,
          rotation: player.rotation
        });
      }
    });

    // Handle shooting
    socket.on('shoot', (bulletData) => {
      const player = gameState.players[socket.id];
      if (player && player.isAlive) {
        const bullet: Bullet = {
          ...bulletData,
          playerId: socket.id,
          createdAt: Date.now()
        };
        
        gameState.bullets.push(bullet);
        
        // Broadcast bullet to all players
        io.emit('bulletFired', bullet);
        
        console.log(`Player ${socket.id} fired bullet ${bullet.id}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      
      delete gameState.players[socket.id];
      
      // Notify other players
      socket.broadcast.emit('playerLeft', socket.id);
    });
  });

  console.log('Game server initialized');
}
