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
  board,
  bombsRemainingCounter,
  difficultyForm,
  restartButton,
  subtitle,
  tilesRemainingCounter,
};

let state;

elements.difficultyForm.onsubmit = (event) => {
  event.preventDefault();
  initGame();
};

initGame();

function checkGameState() {
  const revealedTiles = state.revealedTiles.filter((revealed) => revealed).length;
  if (revealedTiles === state.config.tilesAmount - state.config.bombsAmount) {
    winGame();
  }
}

function disableTile(tile) {
  tile.onclick = null;
  tile.oncontextmenu = (event) => event.preventDefault();
}

function createGameState(difficulty = 'normal') {
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
    isTop: i < state.config.columnsAmount,
    isBottom: i > state.config.tilesAmount - state.config.columnsAmount,
    isLeft: i % state.config.columnsAmount === 0,
    isRight: i % state.config.columnsAmount === state.config.columnsAmount - 1,
  };

  if (!isTop && !isLeft) adjacentIndices.push(i - state.config.columnsAmount - 1);
  if (!isTop) adjacentIndices.push(i - state.config.columnsAmount);
  if (!isTop && !isRight) adjacentIndices.push(i - state.config.columnsAmount + 1);
  if (!isLeft) adjacentIndices.push(i - 1);
  if (!isRight) adjacentIndices.push(i + 1);
  if (!isBottom && !isLeft) adjacentIndices.push(i + state.config.columnsAmount - 1);
  if (!isBottom) adjacentIndices.push(i + state.config.columnsAmount);
  if (!isBottom && !isRight) adjacentIndices.push(i + state.config.columnsAmount + 1);

  return adjacentIndices;
}

function handleClick(tile, index) {
  return () => {
    const clickResult = state.bombTiles[index] ? texts.BOMB : state.numberTiles[index] || '';

    state.revealedTiles[index] = true;
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
    if (state.flaggedTiles[index]) {
      state.flaggedTiles[index] = false;
      tile.innerText = '';
      tile.onclick = handleClick(tile, index);
    } else {
      state.flaggedTiles[index] = true;
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
  const selectedDifficulty = document.querySelector('input[name=difficulty]:checked').value;
  state = createGameState(selectedDifficulty);

  elements.subtitle.innerText = texts.START;
  elements.board.replaceChildren([]);
  document.documentElement.style.setProperty('--number-of-columns', state.config.columnsAmount);

  initTiles(state.config.tilesAmount);
  initBombs(state.bombTiles, state.config.bombsAmount);
  initNumbers(state.numberTiles, state.bombTiles);
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
  state.revealedTiles.fill(false);
  state.flaggedTiles.fill(false);
  state.tilesRevealed = 0;

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
  for (let i = 0; i < state.config.tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (state.bombTiles[i]) {
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
  const revealedTiles = state.revealedTiles.filter((revealed) => revealed).length;
  const flaggedTiles = state.flaggedTiles.filter((flagged) => flagged).length;
  elements.tilesRemainingCounter.innerText =
    state.config.tilesAmount - state.config.bombsAmount - revealedTiles;
  elements.bombsRemainingCounter.innerText = state.config.bombsAmount - flaggedTiles;
}

function winGame() {
  elements.subtitle.innerText = texts.WIN;
  for (let i = 0; i < state.config.tilesAmount; i++) {
    const tile = document.getElementById(`tile-${i}`);
    disableTile(tile);
    if (state.bombTiles[i]) {
      tile.innerText = texts.FLAG;
    }
  }
}
