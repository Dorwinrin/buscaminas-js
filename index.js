const FLAG = '🚩';
const BOMB = '💣';
const tilesAmount = 60;
const columnsAmount = 10;
const bombsAmount = 12;
const gameState = {
  bombTiles: new Array(tilesAmount),
  flaggedTiles: new Array(tilesAmount),
  numberTiles: new Array(tilesAmount),
  revealedTiles: new Array(tilesAmount),
  tilesRevealed: 0,
};
const texts = {
  START: `Click to reveal a tile
  Right-click to flag a tile`,
  WIN: `YOU WIN!`,
  LOSE: `YOU LOSE!`,
};
const elements = {
  board: document.getElementById('board'),
  bombsRemainingCounter: document.getElementById('bombsRemaining'),
  restartButton: document.getElementById('restartButton'),
  subtitle: document.getElementById('subtitle'),
  tilesRemainingCounter: document.getElementById('tilesRemaining'),
};

(() => {
  elements.restartButton.addEventListener('click', restartGame);
  initGame();
})();

function checkGameState() {
  const revealedTiles = gameState.revealedTiles.filter((revealed) => revealed).length;
  updateCounters();
  if (revealedTiles === tilesAmount - bombsAmount) {
    winGame();
  }
}

function disableTile(tile) {
  tile.onclick = null;
  tile.oncontextmenu = (event) => event.preventDefault();
}

function getAdjacentIndices(i) {
  const adjacentIndices = [];
  const { isTop, isLeft, isRight, isBottom } = getTilePosition(i);

  if (!isTop && !isLeft) adjacentIndices.push(i - columnsAmount - 1);
  if (!isTop) adjacentIndices.push(i - columnsAmount);
  if (!isTop && !isRight) adjacentIndices.push(i - columnsAmount + 1);
  if (!isLeft) adjacentIndices.push(i - 1);
  if (!isRight) adjacentIndices.push(i + 1);
  if (!isBottom && !isLeft) adjacentIndices.push(i + columnsAmount - 1);
  if (!isBottom) adjacentIndices.push(i + columnsAmount);
  if (!isBottom && !isRight) adjacentIndices.push(i + columnsAmount + 1);
  return adjacentIndices;
}

function getTilePosition(i) {
  const isTop = i < columnsAmount;
  const isBottom = i > tilesAmount - columnsAmount;
  const isLeft = i % columnsAmount === 0;
  const isRight = i % columnsAmount === columnsAmount - 1;
  return { isTop, isLeft, isRight, isBottom };
}

function handleClick(tile, index) {
  return () => {
    tile.classList.add('revealed');
    gameState.revealedTiles[index] = true;
    disableTile(tile);
    tile.innerText = gameState.bombTiles[index] ? BOMB : gameState.numberTiles[index] || '';
    if (tile.innerText === BOMB) {
      loseGame();
    }
    if (tile.innerText === '') propagateClick(index);
    checkGameState();
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
      tile.innerText = FLAG;
      tile.onclick = null;
      updateCounters();
    }
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
  initTiles(tilesAmount);
  initBombs(gameState.bombTiles, bombsAmount);
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
  for (let i = 0; i < tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (gameState.bombTiles[i]) {
      const tile = document.getElementById(`tile-${i}`);
      tile.innerText = BOMB;
    }
  }
  elements.restartButton.removeAttribute('disabled');
}

function propagateClick(index) {
  const adjacentIndices = getAdjacentIndices(index);
  for (const adjacent of adjacentIndices) {
    const tile = document.getElementById(`tile-${adjacent}`);
    if (tile.onclick !== null) tile.onclick();
  }
}

function restartGame() {
  initGame();
}

function updateCounters() {
  const revealedTiles = gameState.revealedTiles.filter((revealed) => revealed).length;
  elements.tilesRemainingCounter.innerText = tilesAmount - revealedTiles - bombsAmount;
  elements.bombsRemainingCounter.innerText =
    bombsAmount - gameState.flaggedTiles.filter((flagged) => flagged).length;
}

function winGame() {
  elements.subtitle.innerText = texts.WIN;
  for (let i = 0; i < tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (gameState.bombTiles[i]) {
      const tile = document.getElementById(`tile-${i}`);
      tile.innerText = FLAG;
    }
  }
  updateCounters();
  elements.restartButton.removeAttribute('disabled');
}
