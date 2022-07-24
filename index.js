const FLAG = '🚩';
const BOMB = '💣';
const tilesAmount = 96;
const columnsAmount = 12;
const bombsAmount = 30;
const toggledTiles = new Array(tilesAmount).fill(false);
const flaggedTiles = new Array(tilesAmount).fill(false);
const bombTiles = new Array(tilesAmount).fill(false);
const numberTiles = new Array(tilesAmount).fill(0);

(function init() {
  console.log('Init game');
  initTiles(tilesAmount);
  initBombs(bombTiles, bombsAmount);
  initNumbers(numberTiles, bombTiles);
})();

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
    const adjacentIndices = [];
    const isTop = i < columnsAmount;
    const isBottom = i > numberTiles.length - columnsAmount;
    const isLeft = i % columnsAmount === 0;
    const isRight = i % columnsAmount === columnsAmount - 1;

    if (!isTop && !isLeft) adjacentIndices.push(i - columnsAmount - 1);
    if (!isTop) adjacentIndices.push(i - columnsAmount);
    if (!isTop && !isRight) adjacentIndices.push(i - columnsAmount + 1);
    if (!isLeft) adjacentIndices.push(i - 1);
    if (!isRight) adjacentIndices.push(i + 1);
    if (!isBottom && !isLeft) adjacentIndices.push(i + columnsAmount - 1);
    if (!isBottom) adjacentIndices.push(i + columnsAmount);
    if (!isBottom && !isRight) adjacentIndices.push(i + columnsAmount + 1);

    for (const adjacent of adjacentIndices) {
      if (bombTiles[adjacent]) numberTiles[i]++;
    }
  }
}

function initTiles(tiles) {
  const board = document.getElementById('board');
  for (let i = 0; i < tiles; i++) {
    const tile = document.createElement('div');
    tile.setAttribute('id', `tile-${i}`);
    tile.classList.add('tile');

    tile.onclick = handleClick(tile, i);
    tile.oncontextmenu = handleRightClick(tile, i);
    board.appendChild(tile);
  }
}

function handleClick(tile, index) {
  return () => {
    tile.classList.add('revealed');
    toggledTiles[index] = true;
    tile.onclick = null;
    tile.oncontextmenu = (event) => event.preventDefault();
    tile.innerText = bombTiles[index] ? BOMB : numberTiles[index];
  };
}

function handleRightClick(tile, index) {
  return (event) => {
    event.preventDefault();
    if (flaggedTiles[index]) {
      flaggedTiles[index] = false;
      tile.classList.remove('flagged');
      tile.innerText = '';
      tile.onclick = handleClick(tile, index);
    } else {
      flaggedTiles[index] = true;
      tile.classList.add('flagged');
      tile.innerText = FLAG;
      tile.onclick = null;
    }
  };
}
