// Game state
let gameState = {
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    theme: 'dark',
    difficulty: 'easy'
};

// Player move history for AI analysis
let playerMoveHistory = [];
let computerMoveHistory = [];
let lastPlayerMove = null;

// DOM elements
const elements = {
    wins: document.getElementById('wins'),
    losses: document.getElementById('losses'),
    draws: document.getElementById('draws'),
    streak: document.getElementById('streak'),
    playerChoice: document.getElementById('playerChoice'),
    computerChoice: document.getElementById('computerChoice'),
    resultMessage: document.getElementById('resultMessage'),
    resetBtn: document.getElementById('resetBtn'),
    choiceBtns: document.querySelectorAll('.choice-btn'),
    playerAvatar: document.getElementById('playerAvatar'),
    computerAvatar: document.getElementById('computerAvatar'),
    themeBtn: document.getElementById('themeBtn'),
    themeDropdown: document.getElementById('themeDropdown'),
    difficultyBtn: document.getElementById('difficultyBtn'),
    difficultyDropdown: document.getElementById('difficultyDropdown'),
    difficultyBadge: document.getElementById('difficultyBadge'),
    difficultyText: document.getElementById('difficultyText'),
    victoryScreen: document.getElementById('victoryScreen'),
    victoryMessage: document.getElementById('victoryMessage'),
    victoryClose: document.getElementById('victoryClose'),
};

// Game choices
const choices = ['rock', 'paper', 'scissors'];

// Choice icons mapping
const choiceIcons = {
    rock: 'fas fa-hand-rock',
    paper: 'fas fa-hand-paper',
    scissors: 'fas fa-hand-scissors'
};

// Choice colors mapping
const choiceColors = {
    rock: 'var(--danger-color)',
    paper: 'var(--accent-color)',
    scissors: 'var(--accent-secondary)'
};

// Avatar themes
const avatarThemes = {
    ninja: {
        player: 'fas fa-user-ninja',
        computer: 'fas fa-robot'
    },
    warrior: {
        player: 'fas fa-user-shield',
        computer: 'fas fa-dragon'
    },
    wizard: {
        player: 'fas fa-user-graduate',
        computer: 'fas fa-ghost'
    },
    alien: {
        player: 'fas fa-user-astronaut',
        computer: 'fas fa-rocket'
    },
    space: {
        player: 'fas fa-user-astronaut',
        computer: 'fas fa-satellite'
    },
};

// Difficulty strategies
const difficultyStrategies = {
    easy: {
        name: 'Easy',
        description: 'Computer mostly loses or draws on purpose (85% of the time)',
        winRate: 0.15,
        strategy: 'lose_on_purpose',
        loseRate: 0.85
    },
    medium: {
        name: 'Medium',
        description: 'Computer chooses moves completely at random with no bias',
        winRate: 0.33,
        strategy: 'random',
        loseRate: 0.0
    },
    hard: {
        name: 'Hard',
        description: 'Computer uses basic counter strategy, predicting and countering your last move',
        winRate: 0.6,
        strategy: 'counter_last',
        loseRate: 0.0
    },
    expert: {
        name: 'Expert',
        description: 'Computer analyzes your most frequent choices and uses probability to counter',
        winRate: 0.8,
        strategy: 'analyze_patterns',
        loseRate: 0.0
    }
};

// Move history tracking (already declared above)

// Initialize the game
function initGame() {
    loadGameState();
    updateScoreboard();
    updateDifficultyDisplay();
    setupEventListeners();
    applyTheme(gameState.theme);
    addFadeInAnimation();
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('rockPaperScissorsState');
    if (savedState) {
        gameState = { ...gameState, ...JSON.parse(savedState) };
    }
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('rockPaperScissorsState', JSON.stringify(gameState));
}

// Update scoreboard display
function updateScoreboard() {
    elements.wins.textContent = gameState.wins;
    elements.losses.textContent = gameState.losses;
    elements.draws.textContent = gameState.draws;
    elements.streak.textContent = gameState.streak;
}

// Update difficulty display
function updateDifficultyDisplay() {
    const difficulty = difficultyStrategies[gameState.difficulty];
    elements.difficultyText.textContent = difficulty.name;
    elements.difficultyBadge.className = `difficulty-badge ${gameState.difficulty}`;
}

// Setup event listeners
function setupEventListeners() {
    // Choice buttons
    elements.choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handlePlayerChoice(btn.dataset.choice);
        });
    });

    // Reset button
    elements.resetBtn.addEventListener('click', () => {
        resetGame();
    });

    // Theme controls
    elements.themeBtn.addEventListener('click', () => {
        toggleThemeDropdown();
    });

    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
            gameState.theme = theme;
            saveGameState();
            toggleThemeDropdown();
        });
    });

    // Difficulty controls
    elements.difficultyBtn.addEventListener('click', () => {
        toggleDifficultyDropdown();
    });

    // Difficulty options
    document.querySelectorAll('.difficulty-option').forEach((option) => {
        option.addEventListener('click', () => {
            const difficulty = option.dataset.difficulty;
            applyDifficulty(difficulty);
            gameState.difficulty = difficulty;
            saveGameState();
            toggleDifficultyDropdown();
        });
    });


    // Victory screen close
    elements.victoryClose.addEventListener('click', () => {
        hideVictoryScreen();
    });

    // Close dropdowns and modals when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.control-group')) {
            elements.themeDropdown.classList.remove('show');
            elements.difficultyDropdown.classList.remove('show');
        }
    });
}

// Handle player choice
function handlePlayerChoice(playerChoice) {
    // Disable buttons during game
    setButtonsState(false);
    
    // Show player choice with animation
    showChoice(elements.playerChoice, playerChoice);
    
    // Add click animation
    addClickAnimation();
    
    // Computer makes choice immediately
    const computerChoice = getComputerChoice(playerChoice);
    showChoice(elements.computerChoice, computerChoice);
    
    // Determine result
    const result = determineWinner(playerChoice, computerChoice);
    
    // Show result immediately
    showResult(result, playerChoice, computerChoice);
    updateGameState(result);
    setButtonsState(true);
}

// Get computer choice - Advanced Difficulty System
function getComputerChoice(playerChoice) {
    const strategy = difficultyStrategies[gameState.difficulty];
    let computerChoice;
    
    // Update move history
    playerMoveHistory.push(playerChoice);
    lastPlayerMove = playerChoice;
    
    // Keep only last 20 moves for analysis
    if (playerMoveHistory.length > 20) {
        playerMoveHistory.shift();
    }
    
    // Apply difficulty strategy
    switch (strategy.strategy) {
        case 'lose_on_purpose':
            computerChoice = getLoseOnPurposeChoice(playerChoice);
            break;
        case 'random':
            computerChoice = getRandomChoice();
            break;
        case 'counter_last':
            computerChoice = getCounterLastChoice(playerChoice);
            break;
        case 'analyze_patterns':
            computerChoice = getAnalyzePatternsChoice();
            break;
        default:
            computerChoice = getRandomChoice();
    }
    
    // Add computer choice to history
    computerMoveHistory.push(computerChoice);
    if (computerMoveHistory.length > 20) {
        computerMoveHistory.shift();
    }
    
    return computerChoice;
}

// Random choice strategy
function getRandomChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}

// Easy: Computer mostly loses or draws on purpose
function getLoseOnPurposeChoice(playerChoice) {
    const loseRate = difficultyStrategies.easy.loseRate;
    
    if (Math.random() < loseRate) {
        // 85% chance to lose or draw - make computer choose a losing move
        const counterMap = {
            'rock': 'scissors',      // If player chooses rock, computer chooses scissors (player wins)
            'paper': 'rock',         // If player chooses paper, computer chooses rock (player wins)
            'scissors': 'paper'      // If player chooses scissors, computer chooses paper (player wins)
        };
        
        // 70% chance to choose losing move, 15% chance to draw
        if (Math.random() < 0.7) {
            return counterMap[playerChoice];
        } else {
            // Draw by choosing the same move
            return playerChoice;
        }
    } else {
        // 15% chance to win - choose a winning move
        const winMap = {
            'rock': 'paper',         // If player chooses rock, computer chooses paper (computer wins)
            'paper': 'scissors',     // If player chooses paper, computer chooses scissors (computer wins)
            'scissors': 'rock'       // If player chooses scissors, computer chooses rock (computer wins)
        };
        return winMap[playerChoice];
    }
}

// Hard: Counter the player's last move
function getCounterLastChoice(playerChoice) {
    // Counter the current move (predicting player will repeat or follow pattern)
    const counterMap = {
        'rock': 'paper',
        'paper': 'scissors',
        'scissors': 'rock'
    };
    
    // 60% chance to counter, 40% chance to be random
    if (Math.random() < 0.6) {
        return counterMap[playerChoice];
    } else {
        return getRandomChoice();
    }
}

// Expert: Analyze patterns and use probability
function getAnalyzePatternsChoice() {
    if (playerMoveHistory.length < 3) {
        return getRandomChoice();
    }
    
    // Count frequency of each move
    const moveCounts = { rock: 0, paper: 0, scissors: 0 };
    playerMoveHistory.forEach(move => {
        moveCounts[move]++;
    });
    
    // Find most frequent move
    const mostFrequent = Object.keys(moveCounts).reduce((a, b) => 
        moveCounts[a] > moveCounts[b] ? a : b
    );
    
    // Counter the most frequent move
    const counterMap = {
        'rock': 'paper',
        'paper': 'scissors',
        'scissors': 'rock'
    };
    
    // 75% chance to counter most frequent, 25% chance to be random
    if (Math.random() < 0.75) {
        return counterMap[mostFrequent];
    } else {
        return getRandomChoice();
    }
}

// Pattern-based strategy
function getPatternBasedChoice() {
    if (playerMoveHistory.length < 3) {
        return getRandomChoice();
    }
    
    // Look for simple patterns
    const lastMove = playerMoveHistory[playerMoveHistory.length - 1];
    const secondLastMove = playerMoveHistory[playerMoveHistory.length - 2];
    
    // If player repeats the same move, counter it
    if (lastMove === secondLastMove) {
        return getCounterMove(lastMove);
    }
    
    // If player cycles through moves, predict next
    if (lastMove === 'rock' && secondLastMove === 'scissors') {
        return 'paper'; // Predict paper
    } else if (lastMove === 'paper' && secondLastMove === 'rock') {
        return 'scissors'; // Predict scissors
    } else if (lastMove === 'scissors' && secondLastMove === 'paper') {
        return 'rock'; // Predict rock
    }
    
    // Look for frequency patterns in recent moves
    const recentMoves = playerMoveHistory.slice(-5);
    const moveCounts = {
        rock: recentMoves.filter(move => move === 'rock').length,
        paper: recentMoves.filter(move => move === 'paper').length,
        scissors: recentMoves.filter(move => move === 'scissors').length
    };
    
    // If one move is clearly dominant, counter it
    const totalMoves = recentMoves.length;
    for (const [move, count] of Object.entries(moveCounts)) {
        if (count >= totalMoves * 0.6) { // If 60% or more of recent moves are the same
            return getCounterMove(move);
        }
    }
    
    return getRandomChoice();
}

// Adaptive strategy
function getAdaptiveChoice(playerChoice) {
    if (playerMoveHistory.length < 5) {
        return getRandomChoice();
    }
    
    // Analyze player's move frequency
    const moveCounts = {
        rock: playerMoveHistory.filter(move => move === 'rock').length,
        paper: playerMoveHistory.filter(move => move === 'paper').length,
        scissors: playerMoveHistory.filter(move => move === 'scissors').length
    };
    
    // Find most common move
    const mostCommonMove = Object.keys(moveCounts).reduce((a, b) => 
        moveCounts[a] > moveCounts[b] ? a : b
    );
    
    // Also analyze recent moves for immediate adaptation
    const recentMoves = playerMoveHistory.slice(-3);
    const recentCounts = {
        rock: recentMoves.filter(move => move === 'rock').length,
        paper: recentMoves.filter(move => move === 'paper').length,
        scissors: recentMoves.filter(move => move === 'scissors').length
    };
    
    // If recent moves show a clear pattern, prioritize that
    const recentMostCommon = Object.keys(recentCounts).reduce((a, b) => 
        recentCounts[a] > recentCounts[b] ? a : b
    );
    
    // Mix long-term and short-term analysis
    const useRecentPattern = Math.random() < 0.7; // 70% chance to use recent pattern
    const targetMove = useRecentPattern ? recentMostCommon : mostCommonMove;
    
    // Counter the target move
    return getCounterMove(targetMove);
}

// AI strategy (most advanced)
function getAIChoice(playerChoice) {
    if (playerMoveHistory.length < 3) {
        return getRandomChoice();
    }
    
    // Advanced pattern recognition
    const patterns = analyzePatterns();
    
    // If strong pattern detected, use it
    if (patterns.confidence > 0.7) {
        return patterns.predictedMove;
    }
    
    // Psychological strategy
    const psychologicalChoice = getPsychologicalChoice(playerChoice);
    
    // Meta-strategy: analyze computer's own performance
    const computerPerformance = analyzeComputerPerformance();
    
    // Mix strategies based on performance and psychology
    const strategyChoice = Math.random();
    
    if (strategyChoice < 0.4) {
        // Use psychological strategy
        return psychologicalChoice;
    } else if (strategyChoice < 0.7) {
        // Use adaptive strategy
        return getAdaptiveChoice(playerChoice);
    } else {
        // Use meta-strategy based on performance
        return computerPerformance;
    }
}

// Analyze player patterns
function analyzePatterns() {
    if (playerMoveHistory.length < 5) {
        return { confidence: 0, predictedMove: getRandomChoice() };
    }
    
    // Look for complex patterns
    const recentMoves = playerMoveHistory.slice(-5);
    const patterns = {
        rock: 0,
        paper: 0,
        scissors: 0
    };
    
    // Count recent moves
    recentMoves.forEach(move => {
        patterns[move]++;
    });
    
    // Find dominant move
    const dominantMove = Object.keys(patterns).reduce((a, b) => 
        patterns[a] > patterns[b] ? a : b
    );
    
    const confidence = patterns[dominantMove] / recentMoves.length;
    const predictedMove = getCounterMove(dominantMove);
    
    return { confidence, predictedMove };
}

// Psychological strategy
function getPsychologicalChoice(playerChoice) {
    // Players often choose the move that would have beaten their last choice
    const lastPlayerMove = playerMoveHistory[playerMoveHistory.length - 1];
    const lastResult = determineWinner(lastPlayerMove, computerMoveHistory[computerMoveHistory.length - 1]);
    
    if (lastResult === 'lose') {
        // Player lost, they might choose the move that would have beaten their last choice
        return getCounterMove(getCounterMove(lastPlayerMove));
    } else if (lastResult === 'win') {
        // Player won, they might repeat the same move
        return getCounterMove(lastPlayerMove);
    } else {
        // Draw, player might choose a different move
        return getRandomChoice();
    }
}

// Analyze computer's own performance to improve strategy
function analyzeComputerPerformance() {
    if (computerMoveHistory.length < 3) {
        return getRandomChoice();
    }
    
    // Analyze which moves have been most successful for the computer
    const moveSuccess = {
        rock: { wins: 0, total: 0 },
        paper: { wins: 0, total: 0 },
        scissors: { wins: 0, total: 0 }
    };
    
    // Calculate success rate for each move
    for (let i = 0; i < computerMoveHistory.length; i++) {
        const computerMove = computerMoveHistory[i];
        const playerMove = playerMoveHistory[i];
        const result = determineWinner(playerMove, computerMove);
        
        moveSuccess[computerMove].total++;
        if (result === 'lose') { // Computer wins
            moveSuccess[computerMove].wins++;
        }
    }
    
    // Find the most successful move
    let bestMove = 'rock';
    let bestRate = 0;
    
    for (const [move, stats] of Object.entries(moveSuccess)) {
        if (stats.total > 0) {
            const successRate = stats.wins / stats.total;
            if (successRate > bestRate) {
                bestRate = successRate;
                bestMove = move;
            }
        }
    }
    
    // Use the most successful move, but also consider what the player might do next
    const predictedPlayerMove = predictNextPlayerMove();
    return getCounterMove(predictedPlayerMove);
}

// Predict the next player move based on advanced analysis
function predictNextPlayerMove() {
    if (playerMoveHistory.length < 5) {
        return choices[Math.floor(Math.random() * choices.length)];
    }
    
    // Look for complex patterns including psychological factors
    const recentMoves = playerMoveHistory.slice(-5);
    const moveCounts = {
        rock: recentMoves.filter(move => move === 'rock').length,
        paper: recentMoves.filter(move => move === 'paper').length,
        scissors: recentMoves.filter(move => move === 'scissors').length
    };
    
    // Find the least used move (players might switch to it)
    const leastUsedMove = Object.keys(moveCounts).reduce((a, b) => 
        moveCounts[a] < moveCounts[b] ? a : b
    );
    
    // Consider psychological factors
    const lastMove = playerMoveHistory[playerMoveHistory.length - 1];
    const lastResult = determineWinner(lastMove, computerMoveHistory[computerMoveHistory.length - 1]);
    
    if (lastResult === 'lose') {
        // Player lost, might try something different
        return leastUsedMove;
    } else if (lastResult === 'win') {
        // Player won, might repeat or try the move that would have beaten their last choice
        const options = [lastMove, getCounterMove(getCounterMove(lastMove))];
        return options[Math.floor(Math.random() * options.length)];
    } else {
        // Draw, player might try the least used move
        return leastUsedMove;
    }
}

// Get counter move
function getCounterMove(move) {
    const counters = {
        rock: 'paper',
        paper: 'scissors',
        scissors: 'rock'
    };
    return counters[move];
}

// Show mistake indicator for computer
function showMistakeIndicator() {
    const mistakeIndicator = document.createElement('div');
    mistakeIndicator.innerHTML = `
        <div style="
            position: absolute;
            top: -10px;
            right: -10px;
            background: var(--warning-color);
            color: var(--text-primary);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            animation: mistakePulse 1s ease-out;
            z-index: 10;
        ">
            !
        </div>
    `;
    
    // Add to computer choice display
    elements.computerChoice.style.position = 'relative';
    elements.computerChoice.appendChild(mistakeIndicator);
    
    // Remove after animation
    setTimeout(() => {
        if (mistakeIndicator.parentElement) {
            mistakeIndicator.remove();
        }
    }, 1000);
}

// Determine winner
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }
    
    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
}

// Show choice in display with enhanced animations
function showChoice(displayElement, choice) {
    displayElement.innerHTML = `<i class="${choiceIcons[choice]}"></i>`;
    displayElement.className = `choice-display ${choice} fade-in`;
    
    // Add pop animation
    displayElement.classList.add('pop');
    setTimeout(() => {
        displayElement.classList.remove('pop');
    }, 300);
    
    // Add flash animation
    setTimeout(() => {
        displayElement.classList.add('flash');
        setTimeout(() => {
            displayElement.classList.remove('flash');
        }, 300);
    }, 150);
    
    // Show mistake indicator for computer on easier difficulties
    if (displayElement === elements.computerChoice && gameState.lastComputerMistake && gameState.difficulty === 'easy') {
        setTimeout(() => {
            showMistakeIndicator();
        }, 500);
    }
}

// Show result with enhanced animations
function showResult(result, playerChoice, computerChoice) {
    const messages = {
        win: ['You Win! 🎉', 'Victory! 🏆', 'Excellent! ⭐', 'Amazing! 🌟'],
        lose: ['You Lose! 😔', 'Better luck next time! 💪', 'The computer wins! 🤖', 'Try again! 🔄'],
        draw: ['It\'s a Draw! 🤝', 'Tie game! ⚖️', 'Equal match! 🎯', 'Stalemate! 🎲']
    };
    
    const randomMessage = messages[result][Math.floor(Math.random() * messages[result].length)];
    
    elements.resultMessage.textContent = randomMessage;
    elements.resultMessage.className = `result-message ${result} fade-in`;
    
    // Add animations based on result
    if (result === 'win') {
        setTimeout(() => {
            elements.resultMessage.classList.add('bounce');
            setTimeout(() => {
                elements.resultMessage.classList.remove('bounce');
            }, 1000);
        }, 200);
        
        // Show victory screen for streaks
        if (gameState.streak >= 3) {
            setTimeout(() => {
                showVictoryScreen();
            }, 1000);
        }
    } else if (result === 'lose') {
        setTimeout(() => {
            elements.resultMessage.classList.add('shake');
            setTimeout(() => {
                elements.resultMessage.classList.remove('shake');
            }, 500);
        }, 200);
    } else {
        setTimeout(() => {
            elements.resultMessage.classList.add('pulse');
            setTimeout(() => {
                elements.resultMessage.classList.remove('pulse');
            }, 1000);
        }, 200);
    }
}

// Update game state with streak tracking
function updateGameState(result) {
    switch (result) {
        case 'win':
            gameState.wins++;
            gameState.streak++;
            break;
        case 'lose':
            gameState.losses++;
            gameState.streak = 0; // Reset streak on loss
            break;
        case 'draw':
            gameState.draws++;
            gameState.streak = 0; // Reset streak on draw
            break;
    }
    
    updateScoreboard();
    saveGameState();
}

// Set buttons state (enabled/disabled)
function setButtonsState(enabled) {
    elements.choiceBtns.forEach(btn => {
        btn.disabled = !enabled;
        btn.classList.toggle('disabled', !enabled);
    });
}

// Theme management
function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    updateAvatars(theme);
}

function toggleThemeDropdown() {
    elements.themeDropdown.classList.toggle('show');
}

// Difficulty management
function applyDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    updateDifficultyDisplay();
    // Reset move history when changing difficulty
    playerMoveHistory = [];
    computerMoveHistory = [];
}

function toggleDifficultyDropdown() {
    elements.difficultyDropdown.classList.toggle('show');
}



// Avatar management
function updateAvatars(theme) {
    const avatarTheme = getAvatarTheme(theme);
    elements.playerAvatar.innerHTML = `<i class="${avatarTheme.player}"></i>`;
    elements.computerAvatar.innerHTML = `<i class="${avatarTheme.computer}"></i>`;
}

function getAvatarTheme(theme) {
    switch (theme) {
        case 'neon':
            return avatarThemes.warrior;
        case 'ocean':
            return avatarThemes.alien;
        case 'space':
            return avatarThemes.space;
        default:
            return avatarThemes.ninja;
    }
}

// Victory screen
function showVictoryScreen() {
    const streakMessages = {
        3: "🔥 3-Win Streak! You're on fire!",
        5: "🔥🔥 5-Win Streak! Unstoppable!",
        7: "🔥🔥🔥 7-Win Streak! Legendary!",
        10: "🔥🔥🔥🔥 10-Win Streak! GODLIKE!"
    };
    
    const message = streakMessages[gameState.streak] || `🔥 ${gameState.streak}-Win Streak! Amazing!`;
    elements.victoryMessage.textContent = message;
    
    elements.victoryScreen.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideVictoryScreen();
    }, 3000);
}

function hideVictoryScreen() {
    elements.victoryScreen.classList.remove('show');
}


// Reset game
function resetGame() {
    showResetConfirmation();
}

// Show reset confirmation dialog
function showResetConfirmation() {
    const confirmationDialog = document.createElement('div');
    confirmationDialog.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        ">
            <div style="
                background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-accent) 100%);
                border: 2px solid var(--accent-color);
                border-radius: 20px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px var(--shadow-color);
                animation: fadeIn 0.3s ease-out;
            ">
                <h3 style="
                    color: var(--text-primary);
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                    font-weight: 600;
                ">
                    <i class="fas fa-exclamation-triangle" style="color: var(--warning-color); margin-right: 10px;"></i>
                    Reset Game?
                </h3>
                <p style="
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin-bottom: 25px;
                    line-height: 1.5;
                ">
                    This will reset all your scores and streak to zero. This action cannot be undone.
                </p>
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button id="confirmResetBtn" style="
                        background: linear-gradient(45deg, var(--danger-color), var(--accent-secondary));
                        border: none;
                        color: var(--text-primary);
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        min-width: 100px;
                    ">
                        <i class="fas fa-check" style="margin-right: 8px;"></i>
                        Yes, Reset
                    </button>
                    <button id="cancelResetBtn" style="
                        background: var(--glass-bg);
                        border: 2px solid var(--border-color);
                        color: var(--text-primary);
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        min-width: 100px;
                    ">
                        <i class="fas fa-times" style="margin-right: 8px;"></i>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(confirmationDialog);
    
    // Add event listeners to buttons
    const confirmBtn = confirmationDialog.querySelector('#confirmResetBtn');
    const cancelBtn = confirmationDialog.querySelector('#cancelResetBtn');
    
    // Confirm button event listener
    confirmBtn.addEventListener('click', () => {
        confirmReset();
        confirmationDialog.remove();
    });
    
    // Cancel button event listener
    cancelBtn.addEventListener('click', () => {
        confirmationDialog.remove();
    });
    
    // Add hover effects
    confirmBtn.addEventListener('mouseover', () => {
        confirmBtn.style.transform = 'translateY(-2px)';
        confirmBtn.style.boxShadow = '0 8px 25px var(--shadow-color)';
    });
    
    confirmBtn.addEventListener('mouseout', () => {
        confirmBtn.style.transform = 'translateY(0)';
        confirmBtn.style.boxShadow = 'none';
    });
    
    cancelBtn.addEventListener('mouseover', () => {
        cancelBtn.style.transform = 'translateY(-2px)';
        cancelBtn.style.background = 'var(--accent-color)';
    });
    
    cancelBtn.addEventListener('mouseout', () => {
        cancelBtn.style.transform = 'translateY(0)';
        cancelBtn.style.background = 'var(--glass-bg)';
    });
    
    // Close dialog when clicking outside
    confirmationDialog.addEventListener('click', (e) => {
        if (e.target === confirmationDialog) {
            confirmationDialog.remove();
        }
    });
    
    // Close dialog with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            confirmationDialog.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Confirm reset action
function confirmReset() {
    gameState.wins = 0;
    gameState.losses = 0;
    gameState.draws = 0;
    gameState.streak = 0;
    
    // Reset move history
    playerMoveHistory = [];
    computerMoveHistory = [];
    
    updateScoreboard();
    saveGameState();
    
    // Reset displays
    elements.playerChoice.innerHTML = '<i class="fas fa-question"></i>';
    elements.playerChoice.className = 'choice-display';
    elements.computerChoice.innerHTML = '<i class="fas fa-question"></i>';
    elements.computerChoice.className = 'choice-display';
    
    // Reset result message
    elements.resultMessage.textContent = 'Choose your weapon!';
    elements.resultMessage.className = 'result-message';
    
    // Add reset animation
    addResetAnimation();
    
    // Show success message
    showResetSuccess();
}

// Show reset success message
function showResetSuccess() {
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, var(--accent-color), var(--accent-secondary));
            color: var(--text-primary);
            padding: 15px 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px var(--shadow-color);
            z-index: 10001;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        ">
            <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
            Game reset successfully!
        </div>
    `;
    document.body.appendChild(successMessage);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successMessage.parentElement) {
            successMessage.remove();
        }
    }, 3000);
}

// Add click animation
function addClickAnimation() {
    elements.resultMessage.classList.add('shake');
    setTimeout(() => {
        elements.resultMessage.classList.remove('shake');
    }, 500);
}

// Add fade in animation to all elements
function addFadeInAnimation() {
    const animatedElements = [
        '.scoreboard-container',
        '.game-area',
        '.result-message',
        '.game-controls',
        '.reset-section'
    ];
    
    animatedElements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            setTimeout(() => {
                element.classList.add('fade-in');
            }, index * 200);
        }
    });
}

// Add reset animation
function addResetAnimation() {
    const container = document.querySelector('.container');
    container.classList.add('shake');
    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}


// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '3') {
        const choiceIndex = parseInt(e.key) - 1;
        const choice = choices[choiceIndex];
        if (choice) {
            handlePlayerChoice(choice);
        }
    } else if (e.key === 'r' || e.key === 'R') {
        resetGame();
    } else if (e.key === 't' || e.key === 'T') {
        toggleThemeDropdown();
    } else if (e.key === 'd' || e.key === 'D') {
        toggleDifficultyDropdown();
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);


