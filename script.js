// Переменные состояния
let currentPlayer = 'X';
let boardState = Array(9).fill(null);
let gameActive = true;
let pendingCellIndex = null;
let currentQuestion = null;

// Массивы для вопросов
let allQuestions = [];
let availableQuestions = [];

// DOM Элементы
const boardEl = document.getElementById('board');
const questionTextEl = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const optionBtns = document.querySelectorAll('.quiz-btn');
const statusMsgEl = document.getElementById('statusMsg');
const playerXInd = document.getElementById('playerX');
const playerOInd = document.getElementById('playerO');
const modal = document.getElementById('endModal');
const winnerText = document.getElementById('winnerText');

// --- Загрузка вопросов из JSON ---
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error("Не удалось загрузить вопросы");
        
        allQuestions = await response.json();
        availableQuestions = [...allQuestions]; // Создаем копию для игры
        initGame(); // Запускаем игру только после загрузки
    } catch (error) {
        console.error(error);
        questionTextEl.innerText = "Ошибка загрузки вопросов. Проверьте JSON или хостинг.";
    }
}

// --- Инициализация игры ---
function initGame() {
    boardEl.innerHTML = '';
    boardState.fill(null);
    gameActive = true;
    currentPlayer = 'X';
    pendingCellIndex = null;
    
    // Перерисовка поля
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', onCellClick);
        boardEl.appendChild(cell);
    }
    
    updateUI();
    statusMsgEl.innerText = "";
    optionsContainer.style.visibility = 'hidden';
    questionTextEl.innerText = "Нажмите на свободную клетку, чтобы сделать ход!";
}

// --- Обработка клика по клетке ---
function onCellClick(e) {
    if (!gameActive) return;
    if (pendingCellIndex !== null) return;

    const index = e.target.dataset.index;

    if (boardState[index]) return;
    pendingCellIndex = index;
    e.target.classList.add('pending');
    if (currentPlayer === 'X') {
        e.target.classList.add('pending-x');
    } else {
        e.target.classList.add('pending-o');
    }
    askQuestion();
}

// --- Логика вопроса ---
function askQuestion() {
    if (availableQuestions.length === 0) {
        availableQuestions = [...allQuestions];
    }
    const randIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randIndex];
    availableQuestions.splice(randIndex, 1);
    questionTextEl.innerText = currentQuestion.q;
    optionBtns.forEach((btn, i) => {
        btn.innerText = currentQuestion.a[i];
    });

    optionsContainer.style.visibility = 'visible';
    statusMsgEl.innerText = '';
}

// --- Обработка ответа ---
function handleAnswer(selectedIndex) {
    if (pendingCellIndex === null || !gameActive) return;

    const cell = boardEl.children[pendingCellIndex];
    cell.classList.remove('pending', 'pending-x', 'pending-o');

    if (selectedIndex === currentQuestion.correct) {
        boardState[pendingCellIndex] = currentPlayer;
        cell.innerText = currentPlayer === 'X' ? '✕' : '◯';
        cell.classList.add(currentPlayer === 'X' ? 'x' : 'o');
        
        statusMsgEl.innerText = "Верно!";
        statusMsgEl.style.color = "green";

        checkWin();
    } else {
        statusMsgEl.innerText = "Ошибка! Ход переходит сопернику.";
        statusMsgEl.style.color = "red";
    }
    pendingCellIndex = null;
    optionsContainer.style.visibility = 'hidden';
    questionTextEl.innerText = "Нажмите на свободную клетку...";

    if (gameActive) {
        switchPlayer();
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateUI();
}

function updateUI() {
    if (currentPlayer === 'X') {
        playerXInd.classList.add('active');
        playerOInd.classList.remove('active');
    } else {
        playerXInd.classList.remove('active');
        playerOInd.classList.add('active');
    }
}

// --- Проверка победы ---
function checkWin() {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        endGame(`Победил ${currentPlayer === 'X' ? 'Игрок 1' : 'Игрок 2'}!`);
        return;
    }

    if (!boardState.includes(null)) {
        endGame("Ничья!");
        return;
    }
}

function endGame(msg) {
    gameActive = false;
    winnerText.innerText = msg;
    modal.style.display = 'flex';
}

function restartGame() {
    modal.style.display = 'none';
    initGame();
}

document.addEventListener('DOMContentLoaded', loadQuestions);