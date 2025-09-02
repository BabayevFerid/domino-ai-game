import React, { useState } from 'react';

export default function Lobby({ socket, setGame, playerId }) {
  const [roomId, setRoomId] = useState('');
  const [variant, setVariant] = useState('classic');
  const [difficulty, setDifficulty] = useState('medium');

  const createRoom = () => {
    socket.emit('createRoom', { roomId, variant, difficulty }, (res) => {
      if (res.ok) setGame(res.game);
      else alert(res.error);
    });
  };

  const joinRoom = () => {
    socket.emit('joinRoom', { roomId, playerId }, (res) => {
      if (res.ok) setGame(res.game);
      else alert(res.error);
    });
  };

  return (
    <div>
      <h2>Lobby</h2>
      <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
      <select value={variant} onChange={e => setVariant(e.target.value)}>
        <option value="classic">Classic</option>
        <option value="block">Block</option>
        <option value="draw">Draw</option>
      </select>
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button onClick={createRoom}>Create Room</button>
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}
