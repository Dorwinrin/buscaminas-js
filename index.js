const FLAG = '🚩';
const BOMB = '💣';
const tilesAmount = 96;
const toggledTiles = new Array(tilesAmount).fill(false);
const flaggedTiles = new Array(tilesAmount).fill(false);

(function init() {
  console.log('Init game');
  initTiles(tilesAmount);
})();

function initTiles(tiles) {
  const board = document.getElementById('board');
  for (let i = 1; i <= tiles; i++) {
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
    if (toggledTiles[index]) {
      tile.classList.remove('revealed');
      toggledTiles[index] = false;
    } else {
      tile.classList.add('revealed');
      toggledTiles[index] = true;
    }
  };
}

function handleRightClick(tile, index) {
  return (event) => {
    event.preventDefault();
    if (flaggedTiles[index]) {
      tile.classList.remove('flagged');
      tile.innerText = '';
      flaggedTiles[index] = false;
    } else {
      tile.classList.add('flagged');
      tile.innerText = FLAG;
      flaggedTiles[index] = true;
    }
  };
}
