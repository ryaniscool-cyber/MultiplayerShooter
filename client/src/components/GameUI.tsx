import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import PlayerList from "./PlayerList";

export default function GameUI() {
  const { players, localPlayerId, isConnected } = useGameState();
  const { isMuted, toggleMute } = useAudio();
  
  const localPlayer = localPlayerId ? players[localPlayerId] : null;
  const playerCount = Object.keys(players).length;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 1000,
      color: 'white',
      fontFamily: 'monospace'
    }}>
      {/* Connection status */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
        pointerEvents: 'auto'
      }}>
        <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
        <div>Players: {playerCount}</div>
        <button
          onClick={toggleMute}
          style={{
            marginTop: '5px',
            padding: '5px 10px',
            background: isMuted ? '#ff4444' : '#44ff44',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      {/* Player health and stats */}
      {localPlayer && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '15px',
          borderRadius: '5px',
          minWidth: '200px'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
            Health: {localPlayer.health || 100}/100
          </div>
          <div style={{
            width: '180px',
            height: '10px',
            background: '#333',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(localPlayer.health || 100)}%`,
              height: '100%',
              background: (localPlayer.health || 100) > 60 ? '#44ff44' : 
                         (localPlayer.health || 100) > 30 ? '#ffff44' : '#ff4444',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            Ammo: ∞
          </div>
          <div style={{ fontSize: '14px' }}>
            Kills: {localPlayer.kills || 0}
          </div>
          <div style={{ fontSize: '14px' }}>
            Deaths: {localPlayer.deaths || 0}
          </div>
        </div>
      )}

      {/* Controls help */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div>WASD: Move</div>
        <div>Mouse: Look around</div>
        <div>Click: Shoot</div>
        <div>Space: Jump</div>
        <div>Click to capture mouse</div>
      </div>

      {/* Player list */}
      <PlayerList />

      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '2px',
          height: '10px',
          background: 'white',
          boxShadow: '0 0 2px black'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '2px',
          background: 'white',
          boxShadow: '0 0 2px black'
        }} />
      </div>
    </div>
  );
}
