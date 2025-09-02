import React, { useState } from 'react';
import Lobby from './components/Lobby';
import Board from './components/Board';
import Controls from './components/Controls';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function App() {
  const [game, setGame] = useState(null);
  const [playerId] = useState(() => 'p_' + Math.floor(Math.random() * 10000));

  return (
    <div>
      {!game && <Lobby socket={socket} setGame={setGame} playerId={playerId} />}
      {game && (
        <>
          <Board game={game} />
          <Controls socket={socket} game={game} playerId={playerId} />
        </>
      )}
    </div>
  );
}
