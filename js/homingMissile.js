class HomingMissile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 15;
        this.speed = 2.5;
        this.turnRate = 0.04; // How quickly it can turn
        this.dx = 0;
        this.dy = 1;
    }

    update() {
        // Find player
        const targetX = player.x + player.width / 2;
        const targetY = player.y + player.height / 2;

        // Calculate direction to player
        const angleToPlayer = Math.atan2(targetY - this.y, targetX - this.x);
        
        // Normalize current velocity vector
        const currentAngle = Math.atan2(this.dy, this.dx);

        // Gently turn towards the player
        let newAngle = currentAngle;
        if (Math.abs(angleToPlayer - currentAngle) > Math.PI) {
            if (angleToPlayer > currentAngle) {
                newAngle -= this.turnRate;
            } else {
                newAngle += this.turnRate;
            }
        } else {
            if (angleToPlayer > currentAngle) {
                newAngle += this.turnRate;
            } else {
                newAngle -= this.turnRate;
            }
        }

        // Update velocity based on new angle
        this.dx = Math.cos(newAngle);
        this.dy = Math.sin(newAngle);

        // Move the missile
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(this.dy, this.dx) + Math.PI / 2;
        ctx.rotate(angle);
        
        ctx.fillStyle = '#ff4500'; // OrangeRed
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
