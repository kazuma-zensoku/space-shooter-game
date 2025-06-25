const player = new Player();
const bullets = [];
const enemyBullets = [];
const enemies = [];
const powerUps = [];
const stars = [];
let boss = null;

let keys = {};
let shootCooldown = 0;
let rapidFire = false;
let rapidFireTimer = 0;

// Starfield
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        radius: Math.random() * 1.5,
        speed: Math.random() * 2 + 1
    });
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function spawnEnemy() {
    if (!bossActive) {
        const x = Math.random() * (GAME_WIDTH - 50);
        const y = -30;
        enemies.push(new Enemy(x, y));
    }
}

function update() {
    if (gameOver) return;

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

    // Power-up timer
    if (rapidFireTimer > 0) rapidFireTimer--;
    else rapidFire = false;

    // Update player bullets
    bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        if (bullet.y < 0) bullets.splice(bulletIndex, 1);

        // Collision with mobs
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                const points = (bossesDefeated + 1) * 10;
                score += points;
                scoreSinceLastBoss += points;
                if (Math.random() < 0.15) {
                    powerUps.push(new PowerUp(enemy.x, enemy.y, 'rapidFire'));
                }
            }
        });

        // Collision with boss
        if (bossActive && boss && isColliding(bullet, boss)) {
            bullets.splice(bulletIndex, 1);
            bossHP -= 10;
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
    powerUps.forEach((powerUp, index) => {
        powerUp.update();
        if (powerUp.y > GAME_HEIGHT) powerUps.splice(index, 1);
        if (isColliding(player, powerUp)) {
            powerUps.splice(index, 1);
            if (powerUp.type === 'rapidFire') {
                rapidFire = true;
                rapidFireTimer = 300;
            }
        }
    });

    // Update enemy bullets
    enemyBullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        if (bullet.y > GAME_HEIGHT || bullet.y < 0 || bullet.x < 0 || bullet.x > GAME_WIDTH) {
            enemyBullets.splice(bulletIndex, 1);
        }
        if (isColliding(player, bullet)) {
            enemyBullets.splice(bulletIndex, 1);
            playerHP -= 10;
            if (playerHP <= 0) gameOver = true;
        }
    });

    // Update enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        if (enemy.y > GAME_HEIGHT) enemies.splice(enemyIndex, 1);

        // Mob shooting logic
        if (Math.random() < 0.01 + (bossesDefeated * 0.005)) { // Firing rate increases with levels
            const bulletSpeed = 4 + bossesDefeated * 0.2;
            const directions = Math.min(bossesDefeated + 1, 5); // Cap directions at 5
            
            if (directions === 1) {
                enemyBullets.push(new EnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height, 0, 1, bulletSpeed));
            } else {
                for (let i = 0; i < directions; i++) {
                    const angle = (i / (directions - 1) - 0.5) * 0.5; // Spread from -0.25 to 0.25 rad
                    enemyBullets.push(new EnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height, Math.sin(angle), Math.cos(angle), bulletSpeed));
                }
            }
        }

        if (isColliding(player, enemy)) {
            enemies.splice(enemyIndex, 1);
            playerHP -= 20;
            if (playerHP <= 0) gameOver = true;
        }
    });

    // Boss spawning logic
    if (!bossActive) {
        const mobScoreValue = (bossesDefeated + 1) * 10;
        const scoreThreshold = 30 * mobScoreValue; // Approx. 30 mob kills
        if (scoreSinceLastBoss >= scoreThreshold) {
            const bossLevel = bossesDefeated + 1;
            bossActive = true;
            boss = new Boss(bossLevel);
            bossHP = 500 + (bossLevel - 1) * 300;
        }
    }

    // Boss attack logic
    if (boss) {
        boss.update();
        const bulletSpeed = 4 + boss.level * 0.3;
        const fireRate = 0.03 + boss.level * 0.02;

        // Main rotating attack
        if (Math.random() < fireRate) {
            const angle = boss.angle + (Math.random() - 0.5) * (Math.PI / 4);
            enemyBullets.push(new EnemyBullet(boss.x + boss.width / 2, boss.y + boss.height / 2, Math.cos(angle), Math.sin(angle), bulletSpeed));
        }

        // Radial burst attack, density increases with level
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

    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '50px Arial';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
        ctx.font = '30px Arial';
        ctx.fillText(`Final Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        return;
    }

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
    if (bossActive) ctx.fillText(`Boss Level: ${boss.level}`, GAME_WIDTH - 150, 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 667);
gameLoop();
