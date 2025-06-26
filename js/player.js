class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - this.height - 10;
        this.speed = 5;
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        } else if (direction === 'right' && this.x < GAME_WIDTH - this.width) {
            this.x += this.speed;
        }
    }

    draw() {
        ctx.save();
        if (this.invincible) {
            // Create a smoother, less jarring blinking effect by varying alpha
            ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.4;
        }
        ctx.fillStyle = '#0095DD';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
