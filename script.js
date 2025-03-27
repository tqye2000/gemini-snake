//------------------------------------------------------
// Snake Game JavaScript Code
//------------------------------------------------------
// --- HTML Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const restartButton = document.getElementById('restartButton');

// --- Control Buttons ---
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// --- Game Constants ---
const BOX_SIZE = 20; // Size of each grid square (snake segment, food)
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const INITIAL_SPEED = 150; // Milliseconds between game ticks (lower is faster)
const SPEED_INCREMENT = 5; // How much speed increases per food eaten

// --- Game State Variables ---
let snake = [];
let dx = BOX_SIZE; // Initial horizontal velocity
let dy = 0;        // Initial vertical velocity
let food = { x: 0, y: 0 };
let score = 0;
let changingDirection = false; // Prevent rapid 180-degree turns
let gameInterval;
let isGameOver = false;
let gameStarted = false;
let currentSpeed = INITIAL_SPEED;

// --- Audio Elements ---
const gameOverSound = new Audio('game_over_sound.mp3'); // Add the path to your sound file

// --- Helper Functions ---

// Draw a single square on the canvas
function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
    ctx.strokeStyle = '#333'; // Border for squares
    ctx.strokeRect(x, y, BOX_SIZE, BOX_SIZE);
}

// Draw the entire snake
function drawSnake() {
    snake.forEach((segment, index) => {
        const color = index === 0 ? '#006400' : '#008000'; // Dark green head, lighter green body
        drawRect(segment.x, segment.y, color);
    });
}

// Draw the food
function drawFood() {
    drawRect(food.x, food.y, '#DC143C'); // Crimson red for food
}

// Generate random coordinates for food, ensuring it's not on the snake
function createFood() {
    let foodX, foodY;
    while (true) {
        foodX = Math.floor(Math.random() * (CANVAS_WIDTH / BOX_SIZE)) * BOX_SIZE;
        foodY = Math.floor(Math.random() * (CANVAS_HEIGHT / BOX_SIZE)) * BOX_SIZE;

        // Check if the generated position overlaps with the snake
        let overlap = false;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                overlap = true;
                break;
            }
        }
        if (!overlap) break; // Found a valid position
    }
    food = { x: foodX, y: foodY };
}

// Move the snake by updating segment positions
function moveSnake() {
    if (isGameOver) return;

    // Calculate the new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Add the new head to the beginning of the snake array
    snake.unshift(head);

    // Check if the snake ate the food
    const ateFood = snake[0].x === food.x && snake[0].y === food.y;

    if (ateFood) {
        score += 10;
        scoreDisplay.textContent = score;
        createFood();
        increaseSpeed(); // Make game faster
        // Don't remove the tail, effectively growing the snake
    } else {
        // Remove the last segment of the snake if no food was eaten
        snake.pop();
    }

    // Reset the changingDirection flag AFTER moving, allowing next input
    changingDirection = false;
}

// Check for collisions (walls or self)
function checkCollision() {
    const head = snake[0];

    // Check wall collision
    if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT) {
        return true;
    }

    // Check self collision (ignore the head itself)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Change snake direction based on keyboard input
function changeDirection(event) {
    handleDirectionChange(event.key);
}

// Process direction change from keyboard or buttons
function handleDirectionChange(directionCommand) {
     // Start game on first valid input if not started
    if (!gameStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Up', 'Down', 'Left', 'Right'].includes(directionCommand)) {
        startGame();
    }

    if (changingDirection || !gameStarted) return; // Prevent multiple changes per tick or changing before start

    changingDirection = true; // Assume direction will change, unless reversed

    const goingUp = dy === -BOX_SIZE;
    const goingDown = dy === BOX_SIZE;
    const goingLeft = dx === -BOX_SIZE;
    const goingRight = dx === BOX_SIZE;

    let directionChanged = false;
    if ((directionCommand === 'ArrowUp' || directionCommand === 'Up') && !goingDown) {
        dx = 0; dy = -BOX_SIZE; directionChanged = true;
    } else if ((directionCommand === 'ArrowDown' || directionCommand === 'Down') && !goingUp) {
        dx = 0; dy = BOX_SIZE; directionChanged = true;
    } else if ((directionCommand === 'ArrowLeft' || directionCommand === 'Left') && !goingRight) {
        dx = -BOX_SIZE; dy = 0; directionChanged = true;
    } else if ((directionCommand === 'ArrowRight' || directionCommand === 'Right') && !goingLeft) {
        dx = BOX_SIZE; dy = 0; directionChanged = true;
    }

    // If the input didn't result in a valid direction change (e.g., reversing),
    // allow another input immediately in the *next* tick.
    if (!directionChanged) {
        changingDirection = false;
    }
}

// Handle game over state
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval); // Stop the game loop
    if (gameOverSound.readyState >= 2) { // Check if the sound file is available
        gameOverSound.play(); // Play game over sound
    }
    messageDisplay.textContent = `Game Over! Final Score: ${score}`;
    messageDisplay.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    gameStarted = false; // Allow restarting
}

// Increase game speed (decrease interval)
function increaseSpeed() {
    if (currentSpeed > 50) { // Set a maximum speed limit (minimum interval)
        currentSpeed -= SPEED_INCREMENT;
        clearInterval(gameInterval); // Clear existing interval
        gameInterval = setInterval(gameLoop, currentSpeed); // Start new interval with faster speed
    }
}

// Main game loop function
function gameLoop() {
    if (isGameOver) return;

    // Important: Check collision *after* calculating the next move but *before* drawing
    // We check collision based on where the head WILL BE. Let's adjust.
    // It's actually better to check collision *after* moveSnake happens,
    // based on the new head position.

    // Clear the canvas before drawing new frame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    moveSnake(); // Move snake first

    if (checkCollision()) { // Check collision based on new position
        gameOver();
        return; // Stop loop if game over
    }

    // Draw elements in the new positions
    drawFood();
    drawSnake();
}

// Initialize and Reset the game
function initializeGame() {
    // Reset variables
    snake = [ // Initial snake position (center-ish)
        { x: BOX_SIZE * 10, y: BOX_SIZE * 10 },
        { x: BOX_SIZE * 9, y: BOX_SIZE * 10 },
        { x: BOX_SIZE * 8, y: BOX_SIZE * 10 }
    ];
    dx = BOX_SIZE; // Start moving right
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    currentSpeed = INITIAL_SPEED;
    isGameOver = false;
    changingDirection = false;
    gameStarted = false; // Reset game started flag

    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null; // Explicitly nullify
    }

    // Setup initial state display
    messageDisplay.textContent = 'Use Arrow Keys or Tap Controls to Start'; // Updated message
    messageDisplay.classList.remove('hidden');
    restartButton.classList.add('hidden');

    // Clear canvas and draw initial state
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    createFood(); // Create first food piece
    drawSnake();
    drawFood();
}

// Function to actually start the game loop
function startGame() {
    if (gameStarted || isGameOver) return; // Prevent starting multiple times
    gameStarted = true;
    isGameOver = false;
    changingDirection = false; // Reset just in case
    messageDisplay.classList.add('hidden'); // Hide start message
    restartButton.classList.add('hidden'); // Ensure restart button is hidden
    currentSpeed = INITIAL_SPEED; // Reset speed
    if (gameInterval) clearInterval(gameInterval); // Clear just in case
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// --- Event Listeners ---

// Keyboard Input
document.addEventListener('keydown', changeDirection);

// Touch/Click Input for Buttons
function addButtonListener(button, directionCommand) {
    const handler = (event) => {
        event.preventDefault(); // Prevent scrolling/zooming on touch
        handleDirectionChange(directionCommand);
    };
    // Use both touchstart and mousedown for broad compatibility
    button.addEventListener('touchstart', handler, { passive: false }); // passive:false needed for preventDefault
    button.addEventListener('mousedown', handler);
}

addButtonListener(btnUp, 'Up');
addButtonListener(btnDown, 'Down');
addButtonListener(btnLeft, 'Left');
addButtonListener(btnRight, 'Right');


// Restart Button
restartButton.addEventListener('click', initializeGame); // Reset game state on button click

// --- Initial Setup ---
initializeGame(); // Set up the game when the script loads
