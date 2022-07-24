const FLAG = '🚩';
const BOMB = '💣';
const tilesAmount = 96;
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
  console.log(bombTiles)
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
