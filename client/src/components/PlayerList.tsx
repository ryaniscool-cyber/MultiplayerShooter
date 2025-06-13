import { useGameState } from "../lib/stores/useGameState";

export default function PlayerList() {
  const { players, localPlayerId } = useGameState();

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '5px',
      minWidth: '200px',
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '16px' }}>
        Players ({Object.keys(players).length})
      </h3>
      
      {Object.entries(players).map(([playerId, playerData]) => (
        <div
          key={playerId}
          style={{
            marginBottom: '8px',
            padding: '5px',
            background: playerId === localPlayerId ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            fontSize: '12px',
            color: 'white'
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            {playerId === localPlayerId ? 'You' : `Player ${playerId.slice(-4)}`}
          </div>
          <div>Health: {playerData.health || 100}</div>
          <div>K/D: {playerData.kills || 0}/{playerData.deaths || 0}</div>
        </div>
      ))}
      
      {Object.keys(players).length === 0 && (
        <div style={{ color: '#888', fontSize: '12px' }}>
          No players connected
        </div>
      )}
    </div>
  );
}
