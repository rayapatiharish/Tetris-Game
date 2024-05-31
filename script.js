let canvas = document.querySelector("#tetris");
let nextCanvas = document.querySelector("#next");
let scoreboard = document.querySelector("#score");
let levelDisplay = document.querySelector("#level");
let ctx = canvas.getContext("2d");
let nextCtx = nextCanvas.getContext("2d");
ctx.scale(30, 30);
nextCtx.scale(30, 30);

const SHAPES = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1],
        [1, 1],
    ]
]

const COLORS = [
    "#000", // black for empty cells
    "#9b5fe0",
    "#16a4d8",
    "#60dbe8",
    "#8bd346",
    "#efdf48",
    "#f9a52c",
    "#d64e12"
]

const ROWS = 20;
const COLS = 10;

let grid;
let fallingPieceObj;
let nextPieceObj;
let score;
let linesCleared;
let level;
let gameInterval;
let gameOver = false;

const backgroundMusic = document.getElementById('background-music');

document.querySelector("#restart-button").addEventListener("click", () => {
    startGame();
    backgroundMusic.play();
});

function startGame() {
    grid = generateGrid();
    fallingPieceObj = null;
    nextPieceObj = randomPieceObject();
    score = 0;
    linesCleared = 0;
    level = 1;
    gameOver = false;
    updateScore();
    updateLevel();

    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(newGameState, 1000 / level);
    renderNextPiece();
}

function newGameState() {
    if (gameOver) return;
    checkGrid();
    if (!fallingPieceObj) {
        fallingPieceObj = nextPieceObj;
        nextPieceObj = randomPieceObject();
        renderNextPiece();
        renderPiece();
    }
    moveDown();
}

function checkGrid() {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == 0) {
                allFilled = false;
            }
        }
        if (allFilled) {
            count++;
            grid.splice(i, 1);
            grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }
    }
    if (count > 0) {
        linesCleared += count;
        score += count * 10 * level;
        updateScore();
        updateLevel();
    }
}

function generateGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid.push([]);
        for (let j = 0; j < COLS; j++) {
            grid[i].push(0);
        }
    }
    return grid;
}

function randomPieceObject() {
    let ran = Math.floor(Math.random() * 7);
    let piece = SHAPES[ran];
    let colorIndex = ran + 1;
    let x = 4;
    let y = 0;
    return { piece, colorIndex, x, y }
}

function renderPiece() {
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                ctx.fillStyle = COLORS[fallingPieceObj.colorIndex];
                ctx.fillRect(fallingPieceObj.x + j, fallingPieceObj.y + i, 1, 1);
            }
        }
    }
}

function renderNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    let piece = nextPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                nextCtx.fillStyle = COLORS[nextPieceObj.colorIndex];
                nextCtx.fillRect(j, i, 1, 1);
            }
        }
    }
}

function moveDown() {
    if (!collision(fallingPieceObj.x, fallingPieceObj.y + 1))
        fallingPieceObj.y += 1;
    else {
        let piece = fallingPieceObj.piece
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] == 1) {
                    let p = fallingPieceObj.x + j;
                    let q = fallingPieceObj.y + i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }
        if (fallingPieceObj.y == 0) {
            showGameOver();
            return;
        }
        fallingPieceObj = null;
    }
    renderGame();
}

function moveLeft() {
    if (!collision(fallingPieceObj.x - 1, fallingPieceObj.y))
        fallingPieceObj.x -= 1;
    renderGame();
}

function moveRight() {
    if (!collision(fallingPieceObj.x + 1, fallingPieceObj.y))
        fallingPieceObj.x += 1;
    renderGame();
}

function rotate() {
    let rotatedPiece = [];
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i]
        }
    }

    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    if (!collision(fallingPieceObj.x, fallingPieceObj.y, rotatedPiece))
        fallingPieceObj.piece = rotatedPiece
    renderGame()
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || fallingPieceObj.piece
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < COLS && q >= 0 && q < ROWS) {
                    if (grid[q][p] > 0) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    renderPiece();
}

function updateScore() {
    scoreboard.innerText = "Score: " + score;
}

function updateLevel() {
    level = Math.floor(linesCleared / 5) + 1;
    levelDisplay.innerText = "Level: " + level;
    clearInterval(gameInterval);
    gameInterval = setInterval(newGameState, 1000 / level);
}

function showGameOver() {
    gameOver = true;
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, canvas.height / 2 - 1.5, COLS, 3);

    ctx.fillStyle = 'RED';
    ctx.font = 'bold 1px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', COLS / 2, ROWS / 2 - 0.5); // First line
    ctx.fillText('HARISH', COLS / 2, ROWS / 2 + 0.5);     // Second line
}

document.addEventListener("keydown", function (e) {
    if (gameOver) return;
    let key = e.key;
    if (key == "ArrowDown") {
        moveDown();
    } else if (key == "ArrowLeft") {
        moveLeft();
    } else if (key == "ArrowRight") {
        moveRight();
    } else if (key == "ArrowUp") {
        rotate();
    }
});

startGame(); // Initialize the game on page load
