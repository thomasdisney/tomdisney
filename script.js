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
audio.src = 'YouCantEscape.mp3'; // Your music file
audio.play().catch(e => console.log("Audio play failed:", e));

// Particle class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1000 + 100; // Start further away
        this.speed = Math.random() * 2 + 1;
        this.isPlanet = Math.random() < 0.02; // 2% chance for planets (rarer)
        
        if (this.isPlanet) {
            this.size = Math.random() * 50 + 30; // Larger planets
            this.speed *= 0.3; // Slower planets
            this.pattern = this.createPlanetPattern();
        } else {
            this.size = Math.random() * 0.5 + 0.2; // Smaller stars
            this.color = '#fff';
        }
    }

    createPlanetPattern() {
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 128;
        tempCanvas.height = 128;
        
        // Base gradient (gas giant or terrestrial)
        const type = Math.random();
        if (type < 0.5) { // Terrestrial (oceans/deserts)
            const grad = tCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
            grad.addColorStop(0, `hsl(${Math.random() * 60 + 180}, 70%, 50%)`); // Ocean blues/greens
            grad.addColorStop(0.7, `hsl(${Math.random() * 60 + 40}, 80%, 60%)`); // Desert yellows
            grad.addColorStop(1, `hsl(${Math.random() * 60 + 180}, 50%, 30%)`); // Darker edges
            tCtx.fillStyle = grad;
            tCtx.fillRect(0, 0, 128, 128);

            // Add cloud-like noise
            for (let i = 0; i < 100; i++) {
                tCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                tCtx.beginPath();
                tCtx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 20, 0, Math.PI * 2);
                tCtx.fill();
            }
        } else { // Gas giant (bands and swirls)
            for (let y = 0; y < 128; y++) {
                const hue = Math.random() * 60 + (y < 64 ? 0 : 180); // Reds/oranges or blues
                tCtx.fillStyle = `hsl(${hue}, ${Math.random() * 50 + 50}%, ${Math.random() * 40 + 30}%)`;
                tCtx.fillRect(0, y, 128, 1 + Math.random() * 3);
            }
            // Swirls
            for (let i = 0; i < 5; i++) {
                tCtx.beginPath();
                tCtx.arc(64, 64, Math.random() * 40 + 20, 0, Math.PI * 2);
                tCtx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, 0.5)`;
                tCtx.lineWidth = Math.random() * 5;
                tCtx.stroke();
            }
        }

        return tempCanvas;
    }

    update() {
        this.z += this.speed; // Reverse direction: moving away from viewer
        if (this.z > 2000) this.reset(); // Reset when too far
    }

    draw() {
        const perspective = 1000 / (this.z || 1); // Avoid division by zero
        const x = (this.x - width / 2) * perspective + width / 2;
        const y = (this.y - height / 2) * perspective + height / 2;
        const size = this.size * perspective;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.clip(); // Clip to circle

        if (this.isPlanet) {
            ctx.drawImage(this.pattern, x - size, y - size, size * 2, size * 2);
        } else {
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        ctx.restore();
    }
}

const particles = Array.from({ length: 300 }, () => new Particle()); // More stars due to smaller size

// Pulse effect
let pulse = 0;
function updatePulse() {
    pulse = Math.sin(Date.now() * 0.001) * 0.05 + 1;
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

// Sync pulse with music
audio.addEventListener('timeupdate', () => {
    const beat = Math.sin(audio.currentTime * 5);
    pulse = 1 + beat * 0.1;
});