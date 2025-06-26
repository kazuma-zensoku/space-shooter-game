const player = new Player();
let bullets = [];
let enemyBullets = [];
let enemies = [];
let powerUps = [];
const stars = [];
let boss = null;

let keys = {};
let shootCooldown = 0;
let rapidFire = false;
let rapidFireTimer = 0;

// Game State
let gameState = 'startMenu'; // 'startMenu', 'playing', 'gameOver', 'practiceMenu'
let isPracticeMode = false;

// Boss damage tracker for item drops
let bossDamageSinceLastDrop = 0;

// UI Elements
const startMenu = document.getElementById('start-menu');
const practiceMenu = document.getElementById('practice-menu');
const gameOverMenu = document.getElementById('game-over-menu');
const startGameBtn = document.getElementById('start-game-btn');
const practiceModeBtn = document.getElementById('practice-mode-btn');
const startPracticeBtn = document.getElementById('start-practice-btn');
const levelInput = document.getElementById('level-input');
const backBtns = document.querySelectorAll('.back-btn');
const finalScoreEl = document.getElementById('final-score');
const highScoresListEl = document.getElementById('high-scores-list');

// --- Event Listeners ---
startGameBtn.addEventListener('click', () => {
    isPracticeMode = false;
    startGame(1);
});

practiceModeBtn.addEventListener('click', () => {
    gameState = 'practiceMenu';
    updateMenuVisibility();
});

startPracticeBtn.addEventListener('click', () => {
    isPracticeMode = true;
    const level = parseInt(levelInput.value, 10) || 1;
    startGame(level);
});

backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        gameState = 'startMenu';
        updateMenuVisibility();
    });
});

// Starfield
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        radius: Math.random() * 1.5,
        speed: Math.random() * 2 + 1
    });
}

document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

function spawnEnemy() {
    if (gameState === 'playing' && !bossActive) {
        const x = Math.random() * (GAME_WIDTH - 50);
        const y = -30;
        enemies.push(new Enemy(x, y));
    }
}

function startGame(startLevel = 1) {
    // Reset game state variables
    score = 0;
    playerHP = 100;
    bossesDefeated = startLevel - 1;
    scoreSinceLastBoss = 0;
    bossActive = false;
    boss = null;
    bossHP = 0;
    bossDamageSinceLastDrop = 0;
    rapidFire = false;
    rapidFireTimer = 0;
    player.invincible = false;
    player.invincibleTimer = 0;

    // Clear arrays
    bullets.length = 0;
    enemies.length = 0;
    enemyBullets.length = 0;
    powerUps.length = 0;

    // Reset player position
    player.x = GAME_WIDTH / 2 - player.width / 2;
    player.y = GAME_HEIGHT - player.height - 10;

    gameState = 'playing';
    updateMenuVisibility();
}

function handleGameOver() {
    gameState = 'gameOver';
    if (!isPracticeMode) {
        saveHighScore(score);
    }
    finalScoreEl.textContent = `Your Score: ${score}`;
    renderHighScores();
    updateMenuVisibility();
}

function renderHighScores() {
    const highScores = getHighScores();
    highScoresListEl.innerHTML = ''; // Clear previous list
    const newScoreIndex = isPracticeMode ? -1 : highScores.findIndex(s => s.score === score);

    highScores.forEach((highScore, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${highScore.score}`;
        if (index === newScoreIndex) {
            li.classList.add('highlight');
        }
        highScoresListEl.appendChild(li);
    });
}

function updateMenuVisibility() {
    startMenu.classList.add('hidden');
    practiceMenu.classList.add('hidden');
    gameOverMenu.classList.add('hidden');

    if (gameState === 'startMenu') startMenu.classList.remove('hidden');
    else if (gameState === 'practiceMenu') practiceMenu.classList.remove('hidden');
    else if (gameState === 'gameOver') gameOverMenu.classList.remove('hidden');
}

// Helper function to check if an object is outside the game bounds
function isOutOfBounds(obj) {
    return obj.y > GAME_HEIGHT || obj.y < -obj.height || obj.x < -obj.width || obj.x > GAME_WIDTH;
}

function update() {
    if (gameState !== 'playing') return;

    // Player movement and shooting
    if (keys['ArrowLeft']) player.move('left');
    if (keys['ArrowRight']) player.move('right');
    if (keys['Space'] && shootCooldown <= 0) {
        const cooldown = rapidFire ? 3 : 10;
        bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y, 0, -1));
        bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y, -0.4, -0.9));
        bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y, 0.4, -0.9));
        shootCooldown = cooldown;
    }
    if (shootCooldown > 0) shootCooldown--;

    // Power-up timers
    if (rapidFireTimer > 0) rapidFireTimer--;
    else rapidFire = false;
    if (player.invincibleTimer > 0) player.invincibleTimer--;
    else player.invincible = false;

    // Update and clean up arrays
    bullets = bullets.filter(b => !isOutOfBounds(b));
    enemyBullets = enemyBullets.filter(b => !isOutOfBounds(b));
    enemies = enemies.filter(e => !isOutOfBounds(e));
    powerUps = powerUps.filter(p => !isOutOfBounds(p));

    // Update player bullets
    bullets.forEach((bullet) => {
        bullet.update();
        // Collision with mobs
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                bullet.y = -100; // Mark for removal
                const enemyX = enemy.x; // Store position before splicing
                const enemyY = enemy.y;
                enemies.splice(enemyIndex, 1);

                const points = (bossesDefeated + 1) * 10;
                score += points;
                scoreSinceLastBoss += points;

                // Mob item drop logic (15% chance)
                if (Math.random() < 0.15) {
                    const itemPool = [
                        'hp_10', 'hp_10', 'hp_10', 'hp_10', // HP 10 is common
                        'hp_50', 'hp_50',                 // HP 50 is uncommon
                        'rapidFire', 'rapidFire',         // Rapid Fire is also uncommon
                        'hp_100',                        // HP 100 is rare
                        'invincibility'                  // Invincibility is also rare
                    ];
                    const randomType = itemPool[Math.floor(Math.random() * itemPool.length)];
                    powerUps.push(new PowerUp(enemyX, enemyY, randomType));
                }
            }
        });

        // Collision with boss
        if (bossActive && boss && isColliding(bullet, boss)) {
            bullet.y = -100; // Mark for removal
            const damage = 10;
            bossHP -= damage;
            bossDamageSinceLastDrop += damage;

            // Boss item drop logic with adjusted probabilities
            if (bossDamageSinceLastDrop >= 150) {
                bossDamageSinceLastDrop = 0;
                const itemPool = [
                    'hp_10', 'hp_10', 'hp_10', 'hp_10', // HP 10 is common
                    'hp_50', 'hp_50',                 // HP 50 is uncommon
                    'rapidFire', 'rapidFire',         // Rapid Fire is also uncommon
                    'hp_100',                        // HP 100 is rare
                    'invincibility'                  // Invincibility is also rare
                ];
                const randomType = itemPool[Math.floor(Math.random() * itemPool.length)];
                powerUps.push(new PowerUp(boss.x + boss.width / 2, boss.y + boss.height / 2, randomType));
            }

            if (bossHP <= 0) {
                score += 1000 * (bossesDefeated + 1);
                bossesDefeated++;
                bossActive = false;
                boss = null;
                scoreSinceLastBoss = 0; // Reset score tracker
            }
        }
    });

    // Update power-ups
    powerUps.forEach((powerUp) => {
        powerUp.update();
        if (isColliding(player, powerUp)) {
            powerUp.y = GAME_HEIGHT + 100; // Mark for removal
            if (powerUp.type === 'rapidFire') {
                rapidFire = true;
                rapidFireTimer = 300; // 5 seconds
            } else if (powerUp.type === 'invincibility') {
                player.invincible = true;
                player.invincibleTimer = 600; // 10 seconds
            } else if (powerUp.type === 'hp_10') {
                playerHP = Math.min(100, playerHP + 10);
            } else if (powerUp.type === 'hp_50') {
                playerHP = Math.min(100, playerHP + 50);
            } else if (powerUp.type === 'hp_100') {
                playerHP = 100;
            }
        }
    });

    // Update enemy bullets
    enemyBullets.forEach((bullet) => {
        bullet.update();
        if (isColliding(player, bullet) && !player.invincible) {
            bullet.y = GAME_HEIGHT + 100; // Mark for removal
            playerHP -= 10;
            if (playerHP <= 0) handleGameOver();
        }
    });

    // Update enemies
    enemies.forEach((enemy) => {
        enemy.update();
        // Mob shooting logic - only shoot if on screen
        if (enemy.y > 0 && Math.random() < 0.01 + (bossesDefeated * 0.005)) {
            const bulletSpeed = 4 + bossesDefeated * 0.2;
            const directions = Math.min(bossesDefeated + 1, 5);
            if (directions === 1) {
                enemyBullets.push(new EnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height, 0, 1, bulletSpeed));
            } else {
                for (let i = 0; i < directions; i++) {
                    const angle = (i / (directions - 1) - 0.5) * 0.5;
                    enemyBullets.push(new EnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height, Math.sin(angle), Math.cos(angle), bulletSpeed));
                }
            }
        }

        if (isColliding(player, enemy) && !player.invincible) {
            enemy.y = GAME_HEIGHT + 100; // Mark for removal
            playerHP -= 20;
            if (playerHP <= 0) handleGameOver();
        }
    });

    // Boss spawning logic
    if (!bossActive) {
        const mobScoreValue = (bossesDefeated + 1) * 10;
        const scoreThreshold = 30 * mobScoreValue;
        if (scoreSinceLastBoss >= scoreThreshold) {
            const bossLevel = bossesDefeated + 1;
            bossActive = true;
            boss = new Boss(bossLevel);
            bossHP = 500 + (bossLevel - 1) * 300;
            bossDamageSinceLastDrop = 0;
        }
    }

    // Boss attack logic
    if (boss) {
        boss.update();
        const bulletSpeed = 4 + boss.level * 0.3;
        const fireRate = 0.03 + boss.level * 0.02;
        if (Math.random() < fireRate) {
            const angle = boss.angle + (Math.random() - 0.5) * (Math.PI / 4);
            enemyBullets.push(new EnemyBullet(boss.x + boss.width / 2, boss.y + boss.height / 2, Math.cos(angle), Math.sin(angle), bulletSpeed));
        }
        const radialAttackRate = 0.01 + boss.level * 0.005;
        if (boss.level > 1 && Math.random() < radialAttackRate) {
            const bulletsInBurst = 8 + Math.floor(boss.level * 1.5);
            for (let i = 0; i < bulletsInBurst; i++) {
                const angle = boss.angle + (i / bulletsInBurst) * Math.PI * 2;
                enemyBullets.push(new EnemyBullet(boss.x + boss.width / 2, boss.y + boss.height / 2, Math.cos(angle), Math.sin(angle), bulletSpeed));
            }
        }
    }
}

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function draw() {
    // Draw starfield
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > GAME_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * GAME_WIDTH;
        }
        ctx.fillRect(star.x, star.y, star.radius, star.radius);
    });

    if (gameState !== 'playing') return; // Don't draw game elements if not playing

    player.draw();
    bullets.forEach(b => b.draw());
    enemyBullets.forEach(b => b.draw());
    enemies.forEach(e => e.draw());
    powerUps.forEach(p => p.draw());
    if (boss) boss.draw();

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`HP: ${playerHP}`, 10, 50);
    if (rapidFire) ctx.fillText('Rapid Fire!', 10, 80);
    if (player.invincible) ctx.fillText(`Invincible: ${Math.ceil(player.invincibleTimer / 60)}s`, 10, 110);
    if (bossActive) ctx.fillText(`Boss Level: ${boss.level}`, GAME_WIDTH - 150, 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initial setup
updateMenuVisibility();
setInterval(spawnEnemy, 667);
gameLoop();
