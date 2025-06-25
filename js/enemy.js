class Enemy {
    constructor(x, y) {
        this.width = 50;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.color = '#ff4d4d'; // Brighter red
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

class Boss {
    constructor(level) {
        this.width = 200 + (level - 1) * 20;
        this.height = 100 + (level - 1) * 10;
        this.x = (GAME_WIDTH - this.width) / 2;
        this.y = -this.height;
        this.speed = 1 + (level - 1) * 0.2;
        this.color = `hsl(${level * 60}, 100%, 50%)`; // Color changes with level
        this.angle = 0;
        this.level = level;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw HP bar
        const maxHP = 500 + (this.level - 1) * 250;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 20, this.width, 10);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 20, this.width * (bossHP / maxHP), 10);
    }

    update() {
        if (this.y < 50) {
            this.y += this.speed;
        }
        this.angle += 0.01 * this.level;
    }
}