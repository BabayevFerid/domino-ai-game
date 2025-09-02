const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { createNewGame, joinRoom, playMove, legalMovesForHand } = require('./game/engine');
const { getAIMove } = require('./game/ai');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory rooms
const rooms = new Map();

// HTTP endpoint
app.get('/', (req, res) => {
  res.send({ ok: true, server: 'Domino AI Game' });
});

// Serve client build if exists
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuildPath, 'index.html')));
}

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('createRoom', ({ roomId, variant = 'classic', difficulty = 'medium' }, cb) => {
    if (!roomId) return cb({ error: 'missing roomId' });
    if (rooms.has(roomId)) return cb({ error: 'room exists' });
    const game = createNewGame({ roomId, variant });
    game.settings = { difficulty };
    rooms.set(roomId, game);
    socket.join(roomId);
    cb({ ok: true, game });
    io.to(roomId).emit('roomUpdate', game);
  });

  socket.on('joinRoom', ({ roomId, playerId }, cb) => {
    if (!rooms.has(roomId)) return cb({ error: 'no such room' });
    const game = rooms.get(roomId);
    const res = joinRoom(game, { playerId });
    socket.join(roomId);
    rooms.set(roomId, res.game);
    io.to(roomId).emit('roomUpdate', res.game);
    cb(res);
  });

  socket.on('startAI', async ({ roomId, aiSide }, cb) => {
    const game = rooms.get(roomId);
    if (!game) return cb({ error: 'no such room' });
    game.ai = { side: aiSide, difficulty: game.settings?.difficulty || 'medium' };
    if (game.current === aiSide) {
      const aiMove = getAIMove(game, game.ai.difficulty);
      if (aiMove) playMove(game, aiMove);
    }
    rooms.set(roomId, game);
    io.to(roomId).emit('roomUpdate', game);
    cb({ ok: true });
  });

  socket.on('play', ({ roomId, playerId, move }, cb) => {
    const game = rooms.get(roomId);
    if (!game) return cb({ error: 'no such room' });
    try {
      playMove(game, { playerId, move });
      // AI turn
      if (game.ai && game.current === game.ai.side) {
        const aiMove = getAIMove(game, game.ai.difficulty);
        if (aiMove) playMove(game, aiMove);
      }
      rooms.set(roomId, game);
      io.to(roomId).emit('roomUpdate', game);
      cb({ ok: true });
    } catch (err) {
      cb({ error: String(err) });
    }
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
