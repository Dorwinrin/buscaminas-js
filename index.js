const FLAG = '🚩';
const BOMB = '💣';
const tilesAmount = 36;
const columnsAmount = 6;
const bombsAmount = 10;
const revealedTiles = new Array(tilesAmount).fill(false);
const flaggedTiles = new Array(tilesAmount).fill(false);
const bombTiles = new Array(tilesAmount).fill(false);
const numberTiles = new Array(tilesAmount).fill(0);
const gameState = {
  tilesRevealed: 0,
};
const texts = {
  START: `Click to reveal a tile
  Right-click to flag a tile`,
  WIN: `YOU WIN!
  (press F5 to restart)`,
  LOSE: `YOU LOSE!
  (press F5 to restart)`,
};
const board = document.getElementById('board');
const subtitle = document.getElementById('subtitle');
const tilesRemainingElement = document.getElementById('tilesRemaining');
const bombsRemainingElement = document.getElementById('bombsRemaining');

(function init() {
  subtitle.innerText = texts.START;
  initTiles(tilesAmount);
  initBombs(bombTiles, bombsAmount);
  initNumbers(numberTiles, bombTiles);
  updateCounters();
})();

function checkGameState() {
  gameState.tilesRevealed = revealedTiles.filter((revealed) => revealed).length;
  updateCounters();
  if (gameState.tilesRevealed === tilesAmount - bombsAmount) {
    winGame();
  }
}

function updateCounters() {
  tilesRemainingElement.innerText = tilesAmount - gameState.tilesRevealed - bombsAmount;
  bombsRemainingElement.innerText = bombsAmount - flaggedTiles.filter(flagged => flagged).length;
}

function winGame() {
  subtitle.innerText = texts.WIN;
  for (let i = 0; i < tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (bombTiles[i]) {
      const tile = document.getElementById(`tile-${i}`);
      tile.innerText = FLAG;
    }  
  }
  updateCounters();
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
    revealedTiles[index] = true;
    disableTile(tile);
    tile.innerText = bombTiles[index] ? BOMB : numberTiles[index] || '';
    if (tile.innerText === BOMB) {
      loseGame();
    }
    if (tile.innerText === '') propagateClick(index);
    checkGameState();
  };
}

function disableTile(tile) {
  tile.onclick = null;
  tile.oncontextmenu = (event) => event.preventDefault();
}

function loseGame() {
  subtitle.innerText = texts.LOSE;
  for (let i = 0; i < tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (bombTiles[i]) {
      const tile = document.getElementById(`tile-${i}`);
      tile.innerText = BOMB;
    }
  }
}

function handleRightClick(tile, index) {
  return (event) => {
    event.preventDefault();
    if (flaggedTiles[index]) {
      flaggedTiles[index] = false;
      tile.innerText = '';
      tile.onclick = handleClick(tile, index);
    } else {
      flaggedTiles[index] = true;
      tile.innerText = FLAG;
      tile.onclick = null;
      updateCounters();
    }
  };
}

function initBombs(bombTiles, bombsAmount) {
  while (bombsAmount > 0) {
    const index = Math.floor(Math.random() * bombTiles.length);
    if (!bombTiles[index]) {
      bombTiles[index] = true;
      bombsAmount--;
    }
  }
}

function initNumbers(numberTiles, bombTiles) {
  for (let i = 0; i < numberTiles.length; i++) {
    if (bombTiles[i]) continue;

    const adjacentIndices = getAdjacentIndices(i);
    for (const adjacent of adjacentIndices) {
      if (bombTiles[adjacent]) numberTiles[i]++;
    }
  }
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

function initTiles(tiles) {
  for (let i = 0; i < tiles; i++) {
    const tile = document.createElement('div');
    tile.setAttribute('id', `tile-${i}`);
    tile.classList.add('tile');

    tile.onclick = handleClick(tile, i);
    tile.oncontextmenu = handleRightClick(tile, i);
    board.appendChild(tile);
  }
}

function propagateClick(index) {
  const adjacentIndices = getAdjacentIndices(index);
  for (const adjacent of adjacentIndices) {
    const tile = document.getElementById(`tile-${adjacent}`);
    if (tile.onclick !== null) tile.onclick();
  }
}
