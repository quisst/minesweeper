let boardWidth;
let boardHeight;
let bombCount;
let remainingBombs;
let board = [];
let openedCells = 0;
let timerInterval;
let firstClick = true;
let isGameOver = false;
const difficultySettings = {
    easy: { width: 8, height: 8, bombs: 9 },
    medium: { width: 9, height: 9, bombs: 10 },
    hard: { width: 16, height: 16, bombs: 40 },
    expert: { width: 30, height: 16, bombs: 99 },
};

window.onload = function () {
    initBoard();
    setupDifficultyButtons();
    document
        .getElementById("restartButton")
        .addEventListener("click", initBoard);
};

document.getElementById("minefield").addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("cell") && e.buttons === 3) {
        const index = Array.from(e.target.parentNode.children).indexOf(
            e.target
        );
        const x = index % boardWidth;
        const y = Math.floor(index / boardWidth);
        const cell = board[y][x];
        if (
            typeof cell === "number" &&
            cell > 0 &&
            checkSurroundingFlags(x, y) === cell
        ) {
            openSurroundingCells(x, y);
        }
    }
});

function setDifficulty(level) {
    const settings = difficultySettings[level];
    boardWidth = settings.width;
    boardHeight = settings.height;
    bombCount = settings.bombs;
    initBoard();
    if (level === "easy") {
        const minefield = document.getElementById("minefield");
        minefield.style.gridTemplateColumns = "repeat(8, 40px)";
    } else if (level === "medium") {
        const minefield = document.getElementById("minefield");
        minefield.style.gridTemplateColumns = "repeat(9, 40px)";
    } else if (level === "hard") {
        const minefield = document.getElementById("minefield");
        minefield.style.gridTemplateColumns = "repeat(16, 40px)";
    }
}

function setupDifficultyButtons() {
    Object.keys(difficultySettings).forEach((level) => {
        const button = document.getElementById(level);
        button.addEventListener("click", () => {
            setDifficulty(level);
            document.getElementById("difficulty").style.display = "none";
            document.getElementById("gameContainer").style.display = "block";
        });
    });
}

function initBoard() {
    board = Array(boardHeight)
        .fill()
        .map(() => Array(boardWidth).fill(0));
    placeBombs();
    calculateNumbers();
    renderBoard();
    firstClick = true;
    openedCells = 0;
    remainingBombs = bombCount;
    updateRemainingBombs();
    isGameOver = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        document.getElementById("timer").textContent = "00:00";
    }
    placeRandomCheck();
}

function placeRandomCheck() {
    let emptyCells = [];
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x] === 0) {
                emptyCells.push({ x, y });
            }
        }
    }
    if (emptyCells.length > 0) {
        let randomCell =
            emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const minefield = document.getElementById("minefield");
        const cellElement =
            minefield.children[randomCell.y * boardWidth + randomCell.x];
        cellElement.textContent = "✔";
    }
}

function startTimer() {
    let startTime = Date.now();
    timerInterval = setInterval(function () {
        let elapsedTime = Date.now() - startTime;
        let minutes = Math.floor(elapsedTime / 60000);
        let seconds = Math.floor((elapsedTime % 60000) / 1000);
        document.getElementById("timer").textContent =
            (minutes < 10 ? "0" : "") +
            minutes +
            ":" +
            (seconds < 10 ? "0" : "") +
            seconds;
    }, 1000);
}

function placeBombs() {
    let bombsPlaced = 0;
    while (bombsPlaced < bombCount) {
        let x = Math.floor(Math.random() * boardWidth);
        let y = Math.floor(Math.random() * boardHeight);
        if (board[y][x] !== "B") {
            board[y][x] = "B";
            bombsPlaced++;
        }
    }
}

function calculateNumbers() {
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x] === "B") continue;
            let bombs = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    let nx = x + dx,
                        ny = y + dy;
                    if (
                        nx >= 0 &&
                        nx < boardWidth &&
                        ny >= 0 &&
                        ny < boardHeight &&
                        board[ny][nx] === "B"
                    ) {
                        bombs++;
                    }
                }
            }
            board[y][x] = bombs;
        }
    }
}

function renderBoard() {
    const minefield = document.getElementById("minefield");
    minefield.innerHTML = "";
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.addEventListener("click", () => openCell(x, y));
            minefield.appendChild(cell);
        }
    }
}

function updateRemainingBombs() {
    document.getElementById(
        "remainingBombs"
    ).textContent = `남은 폭탄: ${remainingBombs}`;
}

function openCell(x, y) {
    if (isGameOver) return;
    const cell = board[y][x];
    const minefield = document.getElementById("minefield");
    const cellElement = minefield.children[y * boardWidth + x];
    if (
        cellElement.classList.contains("open") ||
        cellElement.textContent === "🚩"
    )
        return;
    if (firstClick) {
        startTimer();
        firstClick = false;
    }
    if (cell === "B") {
        cellElement.classList.add("bomb");
        revealAllBombs();
        clearInterval(timerInterval);
        alert("게임 오버!");
        isGameOver = true;
        return;
    }
    if (cell !== 0) {
        cellElement.classList.add("number" + cell);
    }
    if (cellElement.classList.contains("open")) return;
    cellElement.classList.add("open");
    cellElement.textContent = cell !== 0 ? cell : "";
    openedCells++;
    if (cell === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                let nx = x + dx,
                    ny = y + dy;
                if (nx >= 0 && nx < boardWidth && ny >= 0 && ny < boardHeight) {
                    openCell(nx, ny);
                }
            }
        }
    }
    if (openedCells === boardWidth * boardHeight - bombCount) {
        clearInterval(timerInterval);
        alert("게임 승리!");
    }
}

function renderBoard() {
    const minefield = document.getElementById("minefield");
    minefield.innerHTML = "";
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.addEventListener("click", () => openCell(x, y));
            cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                toggleFlag(x, y);
            });
            minefield.appendChild(cell);
        }
    }
}

function toggleFlag(x, y) {
    const minefield = document.getElementById("minefield");
    const cellElement = minefield.children[y * boardWidth + x];
    if (cellElement.classList.contains("open")) return;
    if (cellElement.textContent === "🚩") {
        cellElement.textContent = "";
        remainingBombs++;
    } else {
        cellElement.textContent = "🚩";
        remainingBombs--;
    }
    updateRemainingBombs();
}

function checkSurroundingFlags(x, y) {
    let flaggedCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            let nx = x + dx,
                ny = y + dy;
            if (nx >= 0 && nx < boardWidth && ny >= 0 && ny < boardHeight) {
                const cellElement =
                    document.getElementById("minefield").children[
                        ny * boardWidth + nx
                    ];
                if (cellElement.textContent === "🚩") {
                    flaggedCount++;
                }
            }
        }
    }
    return flaggedCount;
}

function openSurroundingCells(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            let nx = x + dx,
                ny = y + dy;
            if (nx >= 0 && nx < boardWidth && ny >= 0 && ny < boardHeight) {
                const cellElement =
                    document.getElementById("minefield").children[
                        ny * boardWidth + nx
                    ];
                if (
                    !cellElement.textContent.includes("🚩") &&
                    !cellElement.classList.contains("open")
                ) {
                    openCell(nx, ny);
                }
            }
        }
    }
}

function revealAllBombs() {
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const cell = board[y][x];
            const minefield = document.getElementById("minefield");
            const cellElement = minefield.children[y * boardWidth + x];
            if (cell === "B") {
                cellElement.classList.add("bomb");
                cellElement.textContent = "💣";
            }
            clearInterval(timerInterval);
        }
    }
    clearInterval(timerInterval);
}

initBoard();
