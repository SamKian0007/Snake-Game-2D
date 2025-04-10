// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
let GAME_SPEED = 150; // Milliseconds per tick - now variable
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const highScoreDisplay = document.getElementById('highScoreValue');

// Game state
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameover'
let score = 0;
let highScore = 0;
let snake = [];
let food = {};
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let gameLoop;

// Initialize the game
function init() {
    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);
    speedSlider.addEventListener('input', updateGameSpeed);
    
    // Load high score from localStorage
    loadHighScore();
    
    // Update speed value display
    updateSpeedDisplay();
    
    // Draw the start screen
    drawStartScreen();
}

// Load high score from localStorage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('snakeEscapeHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = highScore;
    }
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem('snakeEscapeHighScore', highScore);
    highScoreDisplay.textContent = highScore;
}

// Update game speed based on slider value
function updateGameSpeed() {
    GAME_SPEED = parseInt(speedSlider.value);
    updateSpeedDisplay();
    
    // If game is running, restart the loop with new speed
    if (gameState === 'playing') {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameUpdate, GAME_SPEED);
    }
}

// Update the speed display text
function updateSpeedDisplay() {
    let speedText;
    if (GAME_SPEED <= 70) {
        speedText = 'Very Fast';
    } else if (GAME_SPEED <= 100) {
        speedText = 'Fast';
    } else if (GAME_SPEED <= 150) {
        speedText = 'Normal';
    } else if (GAME_SPEED <= 200) {
        speedText = 'Slow';
    } else {
        speedText = 'Very Slow';
    }
    speedValue.textContent = speedText;
}

// Reset game to initial state
function resetGame() {
    // Initialize snake in the middle of the grid
    snake = [
        { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) },
        { x: Math.floor(GRID_SIZE / 2) - 1, y: Math.floor(GRID_SIZE / 2) },
        { x: Math.floor(GRID_SIZE / 2) - 2, y: Math.floor(GRID_SIZE / 2) }
    ];
    
    // Initialize direction
    direction = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;
    
    // Reset score
    score = 0;
    
    // Create first food
    createFood();
}

// Start the game
function startGame() {
    resetGame();
    gameState = 'playing';
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, GAME_SPEED);
}

// Update game state
function gameUpdate() {
    if (gameState !== 'playing') return;
    
    // Update direction
    direction = nextDirection;
    
    // Get current head position
    const head = { ...snake[0] };
    
    // Calculate new head position
    head.x += direction.x;
    head.y += direction.y;
    
    // Check for collisions
    if (isCollision(head)) {
        gameState = 'gameover';
        
        // Check if we have a new high score
        if (score > highScore) {
            highScore = score;
            saveHighScore();
        }
        
        drawGameOverScreen();
        clearInterval(gameLoop);
        return;
    }
    
    // Check if food is eaten
    const ateFood = head.x === food.x && head.y === food.y;
    
    // Move snake
    snake.unshift(head);
    if (!ateFood) {
        snake.pop();
    } else {
        // Create new food and increase score
        score += 10;
        createFood();
    }
    
    // Draw the game
    drawGame();
}

// Check if position collides with walls or snake body
function isCollision(position) {
    // Check walls
    if (
        position.x < 0 || 
        position.x >= GRID_SIZE || 
        position.y < 0 || 
        position.y >= GRID_SIZE
    ) {
        return true;
    }
    
    // Check self collision (skip head)
    for (let i = 1; i < snake.length; i++) {
        if (position.x === snake[i].x && position.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Create food at random position
function createFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // Check if food spawns on snake
        let onSnake = false;
        for (const segment of snake) {
            if (newFood.x === segment.x && newFood.y === segment.y) {
                onSnake = true;
                break;
            }
        }
        
        if (!onSnake) {
            food = newFood;
            return;
        }
    } while (true);
}

// Handle keyboard input
function handleKeyDown(e) {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== DIRECTIONS.DOWN) {
                nextDirection = DIRECTIONS.UP;
            }
            break;
        case 'ArrowDown':
            if (direction !== DIRECTIONS.UP) {
                nextDirection = DIRECTIONS.DOWN;
            }
            break;
        case 'ArrowLeft':
            if (direction !== DIRECTIONS.RIGHT) {
                nextDirection = DIRECTIONS.LEFT;
            }
            break;
        case 'ArrowRight':
            if (direction !== DIRECTIONS.LEFT) {
                nextDirection = DIRECTIONS.RIGHT;
            }
            break;
        case 'Escape':
            if (gameState === 'playing') {
                pauseGame();
            } else if (gameState === 'paused') {
                resumeGame();
            }
            break;
    }
}

// Handle mouse clicks
function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check which screen is active and handle buttons accordingly
    if (gameState === 'start') {
        // Start button (centered)
        if (
            clickX >= CANVAS_SIZE / 2 - 60 &&
            clickX <= CANVAS_SIZE / 2 + 60 &&
            clickY >= CANVAS_SIZE / 2 &&
            clickY <= CANVAS_SIZE / 2 + 40
        ) {
            startGame();
        }
    } else if (gameState === 'paused') {
        // Resume button
        if (
            clickX >= CANVAS_SIZE / 2 - 60 &&
            clickX <= CANVAS_SIZE / 2 + 60 &&
            clickY >= CANVAS_SIZE / 2 - 30 &&
            clickY <= CANVAS_SIZE / 2 + 10
        ) {
            resumeGame();
        }
        
        // Restart button
        if (
            clickX >= CANVAS_SIZE / 2 - 60 &&
            clickX <= CANVAS_SIZE / 2 + 60 &&
            clickY >= CANVAS_SIZE / 2 + 30 &&
            clickY <= CANVAS_SIZE / 2 + 70
        ) {
            startGame();
        }
    } else if (gameState === 'gameover') {
        // Restart button
        if (
            clickX >= CANVAS_SIZE / 2 - 60 &&
            clickX <= CANVAS_SIZE / 2 + 60 &&
            clickY >= CANVAS_SIZE / 2 &&
            clickY <= CANVAS_SIZE / 2 + 40
        ) {
            startGame();
        }
        
        // Main Menu button
        if (
            clickX >= CANVAS_SIZE / 2 - 60 &&
            clickX <= CANVAS_SIZE / 2 + 60 &&
            clickY >= CANVAS_SIZE / 2 + 60 &&
            clickY <= CANVAS_SIZE / 2 + 100
        ) {
            gameState = 'start';
            drawStartScreen();
        }
    }
}

// Pause the game
function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        clearInterval(gameLoop);
        drawPauseScreen();
    }
}

// Resume the game
function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        gameLoop = setInterval(gameUpdate, GAME_SPEED);
    }
}

// Drawing functions
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(
        food.x * CELL_SIZE,
        food.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
    );
    
    // Draw snake
    ctx.fillStyle = 'green';
    for (const segment of snake) {
        ctx.fillRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    }
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    
    // Draw high score
    ctx.fillText(`High Score: ${highScore}`, CANVAS_SIZE - 170, 30);
}

function drawStartScreen() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SnakeEscape', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 60);
    
    // Draw high score
    ctx.font = '24px Arial';
    ctx.fillText(`High Score: ${highScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
    
    // Draw start button
    ctx.fillStyle = 'green';
    ctx.fillRect(CANVAS_SIZE / 2 - 60, CANVAS_SIZE / 2, 120, 40);
    
    // Draw button text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Start Game', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 25);
    
    // Reset text alignment
    ctx.textAlign = 'left';
}

function drawPauseScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 80);
    
    // Draw resume button
    ctx.fillStyle = 'green';
    ctx.fillRect(CANVAS_SIZE / 2 - 60, CANVAS_SIZE / 2 - 30, 120, 40);
    
    // Draw restart button
    ctx.fillStyle = 'orange';
    ctx.fillRect(CANVAS_SIZE / 2 - 60, CANVAS_SIZE / 2 + 30, 120, 40);
    
    // Draw button text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Resume', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 5);
    ctx.fillText('Restart', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 55);
    
    // Reset text alignment
    ctx.textAlign = 'left';
}

function drawGameOverScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 100);
    
    // Draw score
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 60);
    
    // Draw high score
    ctx.fillStyle = score > highScore - 10 ? '#FFD700' : 'white';
    ctx.fillText(`High Score: ${highScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 30);
    
    // Draw "New High Score!" if applicable
    if (score === highScore && score > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('New High Score!', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 5);
    }
    
    // Draw restart button
    ctx.fillStyle = 'green';
    ctx.fillRect(CANVAS_SIZE / 2 - 60, CANVAS_SIZE / 2 + 20, 120, 40);
    
    // Draw main menu button
    ctx.fillStyle = 'blue';
    ctx.fillRect(CANVAS_SIZE / 2 - 60, CANVAS_SIZE / 2 + 80, 120, 40);
    
    // Draw button text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Restart', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 45);
    ctx.fillText('Main Menu', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 105);
    
    // Reset text alignment
    ctx.textAlign = 'left';
}

// Initialize the game when page loads
window.onload = init; 