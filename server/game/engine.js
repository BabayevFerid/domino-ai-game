const { v4: uuidv4 } = require('uuid');

function allTiles() {
  const tiles = [];
  for (let i = 0; i <= 6; i++)
    for (let j = i; j <= 6; j++) tiles.push([i, j]);
  return tiles;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createNewGame({ roomId, variant = 'classic' } = {}) {
  const tiles = shuffle(allTiles());
  const p1 = tiles.splice(0, 7);
  const p2 = tiles.splice(0, 7);
  const boneyard = tiles;

  return {
    id: uuidv4(),
    roomId,
    variant,
    board: [],
    hands: { p1, p2 },
    boneyard,
    current: 'p1',
    players: {},
    winner: null,
    lastAction: null,
    createdAt: Date.now(),
  };
}

function sideForPlayer(game, playerId) {
  if (game.players.p1 === playerId) return 'p1';
  if (game.players.p2 === playerId) return 'p2';
  return null;
}

function joinRoom(game, { playerId }) {
  if (!game.players.p1) game.players.p1 = playerId;
  else if (!game.players.p2 && game.players.p1 !== playerId) game.players.p2 = playerId;
  return { ok: true, game };
}

function normalizeTile(tile) {
  const [a, b] = tile;
  return a <= b ? [a, b] : [b, a];
}

function canPlace(tile, board, place) {
  if (board.length === 0) return true;
  const left = board[0], right = board[board.length - 1];
  const [a, b] = tile;
  if (place === 'left') return a === left[0] || b === left[0];
  if (place === 'right') return a === right[1] || b === right[1];
  return false;
}

function applyTileToBoard(tile, board, place) {
  tile = normalizeTile(tile);
  if (board.length === 0) board.push(tile);
  else if (place === 'left') {
    const left = board[0];
    if (tile[1] === left[0]) board.unshift(tile);
    else board.unshift([tile[1], tile[0]]);
  } else {
    const right = board[board.length - 1];
    if (tile[0] === right[1]) board.push(tile);
    else board.push([tile[1], tile[0]]);
  }
}

function legalMovesForHand(game, side) {
  const hand = game.hands[side], moves = [];
  if (game.board.length === 0) return hand.map((t, i) => ({ tile: t, place: 'right', handIndex: i }));
  hand.forEach((t, i) => {
    if (canPlace(t, game.board, 'left')) moves.push({ tile: t, place: 'left', handIndex: i });
    if (canPlace(t, game.board, 'right')) moves.push({ tile: t, place: 'right', handIndex: i });
  });
  return moves;
}

function playMove(game, { playerId, move } = {}) {
  const side = sideForPlayer(game, playerId) || playerId;
  if (game.winner) throw new Error('game finished');
  if (game.current !== side) throw new Error('not your turn');

  if (move && move.tile) {
    const hand = game.hands[side];
    const idx = hand.findIndex(t => (t[0] === move.tile[0] && t[1] === move.tile[1]) || (t[0] === move.tile[1] && t[1] === move.tile[0]));
    if (idx === -1) throw new Error('tile not in hand');
    if (!canPlace(move.tile, game.board, move.place)) throw new Error('invalid placement');
    const tile = hand.splice(idx, 1)[0];
    applyTileToBoard(tile, game.board, move.place);
    game.lastAction = { type: 'play', player: side, tile, place: move.place };
    game.current = side === 'p1' ? 'p2' : 'p1';
  } else if (move && move.pass) {
    game.current = side === 'p1' ? 'p2' : 'p1';
    game.lastAction = { type: 'pass', player: side };
  }
  return game;
}

module.exports = { createNewGame, joinRoom, playMove, legalMovesForHand, normalizeTile };
