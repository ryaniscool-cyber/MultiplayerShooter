import { useEffect } from "react";
import io from "socket.io-client";
import { useGameState } from "../lib/stores/useGameState";

const socket = io("http://localhost:3000"); // Change this if you deploy

export function useSocket() {
  const { addBullet, setPlayerId } = useGameState();

  useEffect(() => {
    socket.on("connect", () => {
      setPlayerId(socket.id);
    });

    socket.on("new-bullet", (bullet) => {
      addBullet(bullet);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socket;
}
