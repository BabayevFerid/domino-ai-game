import React from 'react';

export default function Board({ game }) {
  return (
    <div>
      <h3>Board:</h3>
      <div style={{ display: 'flex', gap: '4px' }}>
        {game.board.map((tile, idx) => (
          <div key={idx} style={{ padding: '8px', border: '1px solid black' }}>
            {tile[0]}|{tile[1]}
          </div>
        ))}
      </div>
      <h4>Hands:</h4>
      <div>P1: {game.hands.p1.map(t => `${t[0]}|${t[1]}`).join(', ')}</div>
      <div>P2: {game.hands.p2.map(t => `${t[0]}|${t[1]}`).join(', ')}</div>
    </div>
  );
}
