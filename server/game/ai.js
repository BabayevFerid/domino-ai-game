const { legalMovesForHand, normalizeTile } = require('./engine');

/**
 * AI difficulties:
 * - easy: random legal move
 * - medium: greedy (highest pip)
 * - hard: minimax depth 2 (simple heuristic)
 */

function getAIMove(game, difficulty = 'medium') {
  const side = game.current;
  const moves = legalMovesForHand(game, side);
  if (!moves || moves.length === 0) return { pass: true };

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'medium') {
    // pick move with highest sum of tile
    let best = moves[0];
    let max = best.tile[0] + best.tile[1];
    for (let m of moves) {
      const s = m.tile[0] + m.tile[1];
      if (s > max) {
        max = s;
        best = m;
      }
    }
    return best;
  }

  if (difficulty === 'hard') {
    // minimax depth 2
    let best = moves[0], maxScore = -Infinity;
    for (let m of moves) {
      const score = scoreMove(game, m, 2, true);
      if (score > maxScore) {
        maxScore = score;
        best = m;
      }
    }
    return best;
  }

  return moves[0];
}

function cloneGame(g) {
  return JSON.parse(JSON.stringify(g));
}

function scoreMove(game, move, depth = 2, isAI = true) {
  const sim = cloneGame(game);
  const side = sim.current;
  sim.hands[side] = [...sim.hands[side]];

  // apply move
  const handIdx = sim.hands[side].findIndex(
    t => t[0] === move.tile[0] && t[1] === move.tile[1] || t[0] === move.tile[1] && t[1] === move.tile[0]
  );
  if (handIdx >= 0) sim.hands[side].splice(handIdx, 1);
  sim.board = sim.board || [];
  sim.board.push(normalizeTile(move.tile));
  sim.current = side === 'p1' ? 'p2' : 'p1';

  if (depth <= 0) {
    return heuristicScore(sim, isAI);
  }

  const nextMoves = legalMovesForHand(sim, sim.current);
  if (!nextMoves || nextMoves.length === 0) return heuristicScore(sim, isAI);

  let bestScore = isAI ? -Infinity : Infinity;
  for (let nm of nextMoves) {
    const s = scoreMove(sim, nm, depth - 1, isAI);
    if (isAI) bestScore = Math.max(bestScore, s);
    else bestScore = Math.min(bestScore, s);
  }
  return bestScore;
}

function heuristicScore(game, isAI) {
  const aiHand = game.hands[game.ai.side] || [];
  const playerSide = game.ai.side === 'p1' ? 'p2' : 'p1';
  const playerHand = game.hands[playerSide] || [];
  const score = playerHand.reduce((sum, t) => sum + t[0] + t[1], 0) - aiHand.reduce((sum, t) => sum + t[0] + t[1], 0);
  return isAI ? score : -score;
}

module.exports = { getAIMove };
