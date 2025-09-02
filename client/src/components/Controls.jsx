import React from 'react';

export default function Controls({ socket, game, playerId }) {
  const playTile = (tile) => {
    socket.emit('play', { roomId: game.roomId, playerId, move: { tile, place: 'right' } }, console.log);
  };

  const passTurn = () => {
    socket.emit('play', { roomId: game.roomId, playerId, move: { pass: true } }, console.log);
  };

  return (
    <div>
      <h3>Controls:</h3>
      <button onClick={passTurn}>Pass</button>
      <div>
        {game.hands.p1.map((t, idx) => (
          <button key={idx} onClick={() => playTile(t)}>
            {t[0]}|{t[1]}
          </button>
        ))}
      </div>
    </div>
  );
}
