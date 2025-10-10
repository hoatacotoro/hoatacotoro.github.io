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
    '#3cbe8e', // I
    '#c4ac43', // O
    '#bd66b4', // T
    '#c67543', // L
    '#5e4cb0', // J
    '#9aca48', // S
    '#d4535a'  // Z
];

let board = [];
let currentPiece = null;
let currentPosition = null;
let nextPiece = null;
let score = 0;
let level = 1;
let gameInterval = null;
let isPaused = false;
let isGameOver = false; 

// Mobile touch variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function initGame() {
    createBoard();
    createNextPieceBoard();
    generateNewPiece();
    drawBoard();
    drawNextPiece();
    hideGameOver();
    startGameLoop();
    setupMobileControls(); // Initialize mobile controls
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

function createNextPieceBoard() {
    const nextBoard = document.getElementById('next-piece-board');
    nextBoard.innerHTML = '';
    
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const cell = document.createElement('div');
            cell.className = 'next-cell';
            cell.id = `next-cell-${y}-${x}`;
            nextBoard.appendChild(cell);
        }
    }
}

function generateNewPiece() {
    if (nextPiece) {
        currentPiece = nextPiece;
    } else {
        const shapeIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        currentPiece = {
            shape: SHAPES[shapeIndex],
            color: COLORS[shapeIndex]
        };
    }
    
    currentPosition = {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2),
        y: 0
    };
    
    const nextShapeIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    nextPiece = {
        shape: SHAPES[nextShapeIndex],
        color: COLORS[nextShapeIndex]
    };
}

function drawNextPiece() {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const cell = document.getElementById(`next-cell-${y}-${x}`);
            cell.style.backgroundColor = '#27262b';
        }
    }
    
    const nextShape = nextPiece.shape;
    const offsetX = Math.floor((4 - nextShape[0].length) / 2);
    const offsetY = Math.floor((4 - nextShape.length) / 2);
    
    for (let y = 0; y < nextShape.length; y++) {
        for (let x = 0; x < nextShape[y].length; x++) {
            if (nextShape[y][x]) {
                const cell = document.getElementById(`next-cell-${offsetY + y}-${offsetX + x}`);
                cell.style.backgroundColor = nextPiece.color;
            }
        }
    }
}

function drawBoard() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.getElementById(`cell-${y}-${x}`);
            cell.style.backgroundColor = COLORS[board[y][x]];
            cell.className = board[y][x] === EMPTY ? 'cell' : 'cell filled';
        }
    }

    if (currentPiece && !isGameOver) {
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
    drawNextPiece();
    
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
    if (isPaused || isGameOver) return;

    currentPosition.y++;
    if (checkCollision(currentPiece.shape, currentPosition)) {
        currentPosition.y--;
        lockPiece();
    }
    drawBoard();
}

function move(direction) {
    if (isPaused || isGameOver) return;

    currentPosition.x += direction;
    if (checkCollision(currentPiece.shape, currentPosition)) {
        currentPosition.x -= direction;
    }
    drawBoard();
}

function rotate() {
    if (isPaused || isGameOver) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (!checkCollision(rotated, currentPosition)) {
        currentPiece.shape = rotated;
    }
    drawBoard();
}

function hardDrop() {
    if (isPaused || isGameOver) return;

    while (!checkCollision(currentPiece.shape, {x: currentPosition.x, y: currentPosition.y + 1})) {
        currentPosition.y++;
    }
    lockPiece();
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
    if (isGameOver) return;
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
    isGameOver = false;
    nextPiece = null;
    initGame();
    updateUI();
}

function showGameOver() {
    const gameOverElement = document.getElementById('game-over');
    gameOverElement.className = 'game-over-visible';
}

function hideGameOver() {
    const gameOverElement = document.getElementById('game-over');
    gameOverElement.className = 'game-over-hidden';
}

function gameOver() {
    clearInterval(gameInterval);
    isGameOver = true;
    showGameOver();
}

// Mobile Controls Functions
function isMobileDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function handleTouchStart(event) {
    if (!isGameOver && !isPaused) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }
}

function handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling
}

function handleTouchEnd(event) {
    if (isGameOver || isPaused) return;
    
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    
    handleSwipe();
}

function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDistance = 30;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
            move(1); // Swipe right
        } else {
            move(-1); // Swipe left
        }
    }
    else if (Math.abs(diffY) > minSwipeDistance) {
        if (diffY > 0) {
            moveDown(); // Swipe down
        } else {
            rotate(); // Swipe up
        }
    }
}

function setupMobileControls() {
    if (isMobileDevice()) {
        // Button controls
        document.getElementById('left-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            move(-1);
        });
        
        document.getElementById('right-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            move(1);
        });
        
        document.getElementById('down-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveDown();
        });
        
        document.getElementById('rotate-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            rotate();
        });
        
        document.getElementById('hard-drop-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            hardDrop();
        });
        
        // Swipe controls on game board
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
        gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Prevent context menu on long press
        gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
}

// Prevent zooming and scrolling
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

window.addEventListener("keydown", function(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
});

document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    if (e.key === ' ') {
        e.preventDefault();
        pauseGame();
    } else if (!isPaused) {
        switch(e.key) {
            case 'ArrowLeft': move(-1); break;
            case 'ArrowRight': move(1); break;
            case 'ArrowDown': hardDrop(); break;
            case 'ArrowUp': rotate(); break;
        }
    }
});

window.onload = initGame;