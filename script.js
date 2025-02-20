// Canvas setup
const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio setup
const audio = document.getElementById('spaceMusic');
audio.src = 'your-music-file.mp3'; // Replace with your music file path
audio.play().catch(e => console.log("Audio play failed:", e));

// Stars and Planets
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 5 + 1;
        this.isPlanet = Math.random() < 0.1; // 10% chance to be a planet
        if (this.isPlanet) {
            this.size = Math.random() * 10 + 5;
            this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        } else {
            this.color = '#fff';
        }
    }

    update() {
        this.z -= this.speed;
        if (this.z <= 0) this.reset();
    }

    draw() {
        const perspective = 1000 / (1000 - this.z);
        const x = (this.x - width / 2) * perspective + width / 2;
        const y = (this.y - height / 2) * perspective + height / 2;
        const size = this.size * perspective;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

const particles = Array.from({ length: 200 }, () => new Particle());

// Pulse effect
let pulse = 0;
function updatePulse() {
    pulse = Math.sin(Date.now() * 0.001) * 0.05 + 1; // Simple sine wave for pulsing
}

// Animation loop
function animate() {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.1 * pulse})`;
    ctx.fillRect(0, 0, width, height);

    updatePulse();
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}
animate();

// Sync pulse with music (basic approximation)
audio.addEventListener('timeupdate', () => {
    const beat = Math.sin(audio.currentTime * 5); // Adjust multiplier for beat sensitivity
    pulse = 1 + beat * 0.1;
});