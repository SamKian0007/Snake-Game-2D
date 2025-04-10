# SnakeEscape

A classic Snake game implemented with HTML5 Canvas and JavaScript.

## How to Play

1. Open `index.html` in a web browser to start the game.
2. Click the "Start Game" button on the start screen.
3. Control the snake using the arrow keys (up, down, left, right).
4. Eat the red food dots to grow the snake and increase your score.
5. Avoid colliding with the walls or the snake's own body.
6. Press the Escape key to pause the game at any time.
7. Adjust the game speed using the slider before starting a new game.

## Game Features

- **Start Screen**: Begin the game with a single click.
- **Game Play**: Control a snake that moves continuously across a grid.
- **Food Collection**: Eat food dots to grow longer and increase your score.
- **Collision Detection**: Game ends if the snake hits the walls or itself.
- **Pause Screen**: Pause the game with the Escape key, with options to resume or restart.
- **Game Over Screen**: See your final score and choose to restart or return to the main menu.
- **Speed Control**: Adjust the game speed from very slow to very fast with a slider.
- **High Score System**: Your highest score is saved and displayed across game sessions.

## Technical Details

- Built using HTML5 Canvas for rendering
- JavaScript for game logic and state management
- Grid-based movement system
- localStorage for persistent high score tracking
- No external libraries or frameworks required

## Controls

- **Arrow Keys**: Change the snake's direction
- **Escape Key**: Pause/Resume the game
- **Mouse**: Click buttons on game screens
- **Speed Slider**: Adjust game speed (lower value = faster snake)

## Project Structure

- `index.html`: Main HTML file with Canvas element and controls
- `game.js`: Game logic and rendering
