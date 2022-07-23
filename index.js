const tilesAmount = 16;
const toggledTiles = new Array(16).fill(false);

(function init() {
  console.log('Init game');
  initTiles(tilesAmount);
})();

function initTiles(tiles) {
  for (let i = 1; i <= tiles; i++) {
    const tile = document.getElementById(`casilla-${i}`);
    tile.addEventListener('click', handleClick(tile, i));
  }
}

function handleClick(tile, index) {
  return () => {
    if (toggledTiles[index]) {
      tile.classList.remove('clicked');
      toggledTiles[index] = false;
    } else {
      tile.classList.add('clicked');
      toggledTiles[index] = true;
    }
  };
}
