const difficultyModes = {
  easy: {
    tilesAmount: 40,
    columnsAmount: 8,
    bombsAmount: 8,
  },
  normal: {
    tilesAmount: 60,
    columnsAmount: 12,
    bombsAmount: 15,
  },
  hard: {
    tilesAmount: 90,
    columnsAmount: 15,
    bombsAmount: 30,
  },
};

const texts = {
  BOMB: '💣',
  FLAG: '🚩',
  LOSE: `YOU LOSE!`,
  START: `Click to reveal a tile
  Right-click to flag a tile`,
  WIN: `YOU WIN!`,
};

const elements = {
  board: document.getElementById('board'),
  bombsRemainingCounter: document.getElementById('bombsRemaining'),
  difficulty: document.getElementById('difficulty'),
  restartButton: document.getElementById('restartButton'),
  subtitle: document.getElementById('subtitle'),
  tilesRemainingCounter: document.getElementById('tilesRemaining'),
};

let gameState = createGameState(elements.difficulty.value);

(() => {
  elements.restartButton.onclick = initGame;
  initGame();
})();

function checkGameState() {
  const revealedTiles = gameState.revealedTiles.filter((revealed) => revealed).length;
  if (revealedTiles === gameState.config.tilesAmount - gameState.config.bombsAmount) {
    winGame();
  }
}

function disableTile(tile) {
  tile.onclick = null;
  tile.oncontextmenu = (event) => event.preventDefault();
}

function createGameState(difficulty) {
  const config = difficultyModes[difficulty];

  return {
    bombTiles: new Array(config.tilesAmount),
    config,
    flaggedTiles: new Array(config.tilesAmount),
    numberTiles: new Array(config.tilesAmount),
    revealedTiles: new Array(config.tilesAmount),
    tilesRevealed: 0,
  };
}

function getAdjacentIndices(i) {
  const adjacentIndices = [];
  const { isTop, isLeft, isRight, isBottom } = {
    isTop: i < gameState.config.columnsAmount,
    isBottom: i > gameState.config.tilesAmount - gameState.config.columnsAmount,
    isLeft: i % gameState.config.columnsAmount === 0,
    isRight: i % gameState.config.columnsAmount === gameState.config.columnsAmount - 1,
  };

  if (!isTop && !isLeft) adjacentIndices.push(i - gameState.config.columnsAmount - 1);
  if (!isTop) adjacentIndices.push(i - gameState.config.columnsAmount);
  if (!isTop && !isRight) adjacentIndices.push(i - gameState.config.columnsAmount + 1);
  if (!isLeft) adjacentIndices.push(i - 1);
  if (!isRight) adjacentIndices.push(i + 1);
  if (!isBottom && !isLeft) adjacentIndices.push(i + gameState.config.columnsAmount - 1);
  if (!isBottom) adjacentIndices.push(i + gameState.config.columnsAmount);
  if (!isBottom && !isRight) adjacentIndices.push(i + gameState.config.columnsAmount + 1);

  return adjacentIndices;
}

function handleClick(tile, index) {
  return () => {
    const clickResult = gameState.bombTiles[index]
      ? texts.BOMB
      : gameState.numberTiles[index] || '';

    gameState.revealedTiles[index] = true;
    tile.classList.add('revealed');
    tile.innerText = clickResult;
    disableTile(tile);

    if (clickResult === texts.BOMB) loseGame();
    if (clickResult === '') propagateClick(index);

    checkGameState();
    updateCounters();
  };
}

function handleRightClick(tile, index) {
  return (event) => {
    event.preventDefault();
    if (gameState.flaggedTiles[index]) {
      gameState.flaggedTiles[index] = false;
      tile.innerText = '';
      tile.onclick = handleClick(tile, index);
    } else {
      gameState.flaggedTiles[index] = true;
      tile.innerText = texts.FLAG;
      tile.onclick = null;
    }
    updateCounters();
  };
}

function initBombs(bombTiles, bombsAmount) {
  bombTiles.fill(false);

  while (bombsAmount > 0) {
    const index = Math.floor(Math.random() * bombTiles.length);
    if (!bombTiles[index]) {
      bombTiles[index] = true;
      bombsAmount--;
    }
  }
}

function initGame() {
  gameState = createGameState(elements.difficulty.value);

  elements.subtitle.innerText = texts.START;
  elements.board.replaceChildren([]);
  document.documentElement.style.setProperty('--number-of-columns', gameState.config.columnsAmount);

  initTiles(gameState.config.tilesAmount);
  initBombs(gameState.bombTiles, gameState.config.bombsAmount);
  initNumbers(gameState.numberTiles, gameState.bombTiles);
  updateCounters();
}

function initNumbers(numberTiles, bombTiles) {
  numberTiles.fill(0);

  for (let i = 0; i < numberTiles.length; i++) {
    if (bombTiles[i]) continue;
    const adjacentIndices = getAdjacentIndices(i);
    for (const adjacent of adjacentIndices) {
      if (bombTiles[adjacent]) numberTiles[i]++;
    }
  }
}

function initTiles(tiles) {
  gameState.revealedTiles.fill(false);
  gameState.flaggedTiles.fill(false);
  gameState.tilesRevealed = 0;

  for (let i = 0; i < tiles; i++) {
    const tile = document.createElement('div');
    tile.setAttribute('id', `tile-${i}`);
    tile.classList.add('tile');
    tile.onclick = handleClick(tile, i);
    tile.oncontextmenu = handleRightClick(tile, i);
    elements.board.appendChild(tile);
  }
}

function loseGame() {
  elements.subtitle.innerText = texts.LOSE;
  for (let i = 0; i < gameState.config.tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (gameState.bombTiles[i]) {
      const tile = document.getElementById(`tile-${i}`);
      tile.innerText = texts.BOMB;
    }
  }
}

function propagateClick(index) {
  const adjacentIndices = getAdjacentIndices(index);
  for (const adjacent of adjacentIndices) {
    const tile = document.getElementById(`tile-${adjacent}`);
    if (tile?.onclick != null) tile.onclick();
  }
}

function updateCounters() {
  const revealedTiles = gameState.revealedTiles.filter((revealed) => revealed).length;
  const flaggedTiles = gameState.flaggedTiles.filter((flagged) => flagged).length;
  elements.tilesRemainingCounter.innerText =
    gameState.config.tilesAmount - gameState.config.bombsAmount - revealedTiles;
  elements.bombsRemainingCounter.innerText = gameState.config.bombsAmount - flaggedTiles;
}

function winGame() {
  elements.subtitle.innerText = texts.WIN;
  for (let i = 0; i < gameState.config.tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (gameState.bombTiles[i]) {
      tile.innerText = texts.FLAG;
    }
  }
}
