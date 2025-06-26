class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'rapidFire', 'invincibility', 'hp_10', 'hp_50', 'hp_100'
        this.speed = 2;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (this.type === 'rapidFire') {
            ctx.fillStyle = '#ff9900'; // Orange
        } else if (this.type === 'invincibility') {
            ctx.fillStyle = '#ffff00'; // Yellow/Gold
        } else if (this.type === 'hp_10') {
            ctx.fillStyle = '#90ee90'; // Light Green
        } else if (this.type === 'hp_50') {
            ctx.fillStyle = '#32cd32'; // Lime Green
        } else if (this.type === 'hp_100') {
            ctx.fillStyle = '#008000'; // Dark Green
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
