class Bullet {
    constructor(x, y, dx, dy) {
        this.width = 5;
        this.height = 10;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = 7;
        this.color = '#ffff00';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }
}