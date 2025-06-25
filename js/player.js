class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = (GAME_WIDTH - this.width) / 2;
        this.y = GAME_HEIGHT - this.height - 10;
        this.speed = 5;
        this.color = '#00ff00';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw HP bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y + this.height + 5, this.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y + this.height + 5, this.width * (playerHP / 100), 5);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        } else if (direction === 'right' && this.x < GAME_WIDTH - this.width) {
            this.x += this.speed;
        }
    }
}