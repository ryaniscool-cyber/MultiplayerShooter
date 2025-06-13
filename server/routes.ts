import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { setupGameServer } from "./gameServer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Game stats endpoint
  app.get('/api/stats', (req, res) => {
    // This would normally get stats from the game server
    res.json({
      activeGames: 1,
      totalPlayers: 0,
      uptime: process.uptime()
    });
  });

  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Setup game server
  setupGameServer(io);

  return httpServer;
}
