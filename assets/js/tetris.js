const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY = 0;

const SHAPES = [
    [],
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]]  // Z
];

const COLORS = [
    '#27262b',
    '#00FFFF', // I
    '#FFFF00', // O
    '#800080', // T
    '#FFA500', // L
    '#0000FF', // J
    '#00FF00', // S
    '#FF0000'  // Z
];

let board = [];
let currentPiece = null;
let currentPosition = null;
let score = 0;
let level = 1;
let gameInterval = null;
let isPaused = false;

function initGame() {
    createBoard();
    generateNewPiece();
    drawBoard();
    startGameLoop();
}

function createBoard() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(EMPTY));
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${y}-${x}`;
            gameBoard.appendChild(cell);
        }
    }
}

function generateNewPiece() {
    const shapeIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    currentPiece = {
        shape: SHAPES[shapeIndex],
        color: COLORS[shapeIndex]
    };
    currentPosition = {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2),
        y: 0
    };
}

function drawBoard() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.getElementById(`cell-${y}-${x}`);
            cell.style.backgroundColor = COLORS[board[y][x]];
            cell.className = board[y][x] === EMPTY ? 'cell' : 'cell filled';
        }
    }

    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const posY = currentPosition.y + y;
                    const posX = currentPosition.x + x;
                    if (posY >= 0 && posY < BOARD_HEIGHT && posX >= 0 && posX < BOARD_WIDTH) {
                        const cell = document.getElementById(`cell-${posY}-${posX}`);
                        cell.style.backgroundColor = currentPiece.color;
                        cell.className = 'cell filled';
                    }
                }
            }
        }
    }
}

function checkCollision(shape, position) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newY = position.y + y;
                const newX = position.x + x;

                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return true;
                }

                if (newY >= 0 && board[newY][newX] !== EMPTY) {
                    return true;
                }
            }
        }
    }
    return false;
}

function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const posY = currentPosition.y + y;
                const posX = currentPosition.x + x;
                if (posY >= 0) {
                    board[posY][posX] = COLORS.indexOf(currentPiece.color);
                }
            }
        }
    }
    clearLines();
    generateNewPiece();
    
    if (checkCollision(currentPiece.shape, currentPosition)) {
        gameOver();
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== EMPTY)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(EMPTY));
            linesCleared++;
            y++;
        }
    }

    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        level = Math.floor(score / 1000) + 1;
        updateUI();
    }
}

function moveDown() {
    if (isPaused) return;

    currentPosition.y++;
    if (checkCollision(currentPiece.shape, currentPosition)) {
        currentPosition.y--;
        lockPiece();
    }
    drawBoard();
}

function move(direction) {
    if (isPaused) return;

    currentPosition.x += direction;
    if (checkCollision(currentPiece.shape, currentPosition)) {
        currentPosition.x -= direction;
    }
    drawBoard();
}

function rotate() {
    if (isPaused) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (!checkCollision(rotated, currentPosition)) {
        currentPiece.shape = rotated;
    }
    drawBoard();
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    const speed = Math.max(100, 1000 - (level - 1) * 100);
    gameInterval = setInterval(moveDown, speed);
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

function pauseGame() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
    } else {
        startGameLoop();
    }
}

function restartGame() {
    clearInterval(gameInterval);
    score = 0;
    level = 1;
    isPaused = false;
    initGame();
    updateUI();
}

function gameOver() {
    clearInterval(gameInterval);
    alert(`game over your score is: ${score}`);
    restartGame();
}

window.addEventListener("keydown", function(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        pauseGame();
    } else if (!isPaused) {
        switch(e.key) {
            case 'ArrowLeft': move(-1); break;
            case 'ArrowRight': move(1); break;
            case 'ArrowDown': moveDown(); break;
            case 'ArrowUp': rotate(); break;
        }
    }
});

window.onload = initGame;