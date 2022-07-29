const config = {
  tilesAmount: 60,
  columnsAmount: 12,
  bombsAmount: 15,
};
const elements = {
  board: document.getElementById('board'),
  bombsRemainingCounter: document.getElementById('bombsRemaining'),
  restartButton: document.getElementById('restartButton'),
  subtitle: document.getElementById('subtitle'),
  tilesRemainingCounter: document.getElementById('tilesRemaining'),
};
const gameState = {
  bombTiles: new Array(config.tilesAmount),
  flaggedTiles: new Array(config.tilesAmount),
  numberTiles: new Array(config.tilesAmount),
  revealedTiles: new Array(config.tilesAmount),
  tilesRevealed: 0,
};
const texts = {
  BOMB: '💣',
  FLAG: '🚩',
  LOSE: `YOU LOSE!`,
  START: `Click to reveal a tile
  Right-click to flag a tile`,
  WIN: `YOU WIN!`,
};

(() => {
  elements.restartButton.onclick = initGame;
  document.documentElement.style.setProperty('--number-of-columns', config.columnsAmount);
  initGame();
})();

function checkGameState() {
  const revealedTiles = gameState.revealedTiles.filter((revealed) => revealed).length;
  if (revealedTiles === config.tilesAmount - config.bombsAmount) {
    winGame();
  }
}

function disableTile(tile) {
  tile.onclick = null;
  tile.oncontextmenu = (event) => event.preventDefault();
}

function getAdjacentIndices(i) {
  const adjacentIndices = [];
  const { isTop, isLeft, isRight, isBottom } = {
    isTop: i < config.columnsAmount,
    isBottom: i > config.tilesAmount - config.columnsAmount,
    isLeft: i % config.columnsAmount === 0,
    isRight: i % config.columnsAmount === config.columnsAmount - 1,
  };

  if (!isTop && !isLeft) adjacentIndices.push(i - config.columnsAmount - 1);
  if (!isTop) adjacentIndices.push(i - config.columnsAmount);
  if (!isTop && !isRight) adjacentIndices.push(i - config.columnsAmount + 1);
  if (!isLeft) adjacentIndices.push(i - 1);
  if (!isRight) adjacentIndices.push(i + 1);
  if (!isBottom && !isLeft) adjacentIndices.push(i + config.columnsAmount - 1);
  if (!isBottom) adjacentIndices.push(i + config.columnsAmount);
  if (!isBottom && !isRight) adjacentIndices.push(i + config.columnsAmount + 1);

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
  elements.subtitle.innerText = texts.START;
  elements.board.replaceChildren([]);
  initTiles(config.tilesAmount);
  initBombs(gameState.bombTiles, config.bombsAmount);
  initNumbers(gameState.numberTiles, gameState.bombTiles);
  updateCounters();
  elements.restartButton.setAttribute('disabled', true);
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
  for (let i = 0; i < config.tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (gameState.bombTiles[i]) {
      const tile = document.getElementById(`tile-${i}`);
      tile.innerText = texts.BOMB;
    }
  }
  elements.restartButton.removeAttribute('disabled');
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
    config.tilesAmount - config.bombsAmount - revealedTiles;
  elements.bombsRemainingCounter.innerText = config.bombsAmount - flaggedTiles;
}

function winGame() {
  elements.subtitle.innerText = texts.WIN;
  for (let i = 0; i < config.tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (gameState.bombTiles[i]) {
      tile.innerText = texts.FLAG;
    }
  }
  elements.restartButton.removeAttribute('disabled');
}
