
class HeroSphereAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = 0;
        this.height = 0;

        // Animation properties
        this.rotationSpeed = 0.0005; // Reduced speed (was 0.002)
        this.rotationX = 0;
        this.rotationY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        this.init();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Mouse interaction
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            // Normalize mouse position from -1 to 1
            this.mouseX = ((e.clientX - rect.left) / this.width) * 2 - 1;
            this.mouseY = ((e.clientY - rect.top) / this.height) * 2 - 1;
        });

        this.createParticles();
    }

    resize() {
        // Ensure canvas matches container size perfectly
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const particleCount = 150;
        const radius = Math.min(this.width, this.height) * 0.4; // Sphere radius

        for (let i = 0; i < particleCount; i++) {
            // distribute points on a sphere using Fibonacci sphere algorithm for even distribution
            const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            this.particles.push({
                x, y, z,
                baseX: x, baseY: y, baseZ: z,
                size: Math.random() * 1.5 + 0.5,
                color: this.getRandomColor(),
                pulseSpeed: Math.random() * 0.05 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(157, 78, 221, 0.9)', // Primary Purple
            'rgba(224, 170, 255, 0.9)', // Light Purple
            'rgba(100, 200, 255, 0.9)', // Blueish
            'rgba(255, 255, 255, 1)'    // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    project(p) {
        // Simple 3D projection
        // Camera distance
        const perspective = 800;
        const scale = perspective / (perspective + p.z);

        return {
            x: p.x * scale + this.width / 2,
            y: p.y * scale + this.height / 2,
            scale: scale
        };
    }

    rotate(p, angleX, angleY) {
        // Rotate around Y axis
        let x = p.baseX * Math.cos(angleY) - p.baseZ * Math.sin(angleY);
        let z = p.baseX * Math.sin(angleY) + p.baseZ * Math.cos(angleY);
        let y = p.baseY;

        // Rotate around X axis
        let y2 = y * Math.cos(angleX) - z * Math.sin(angleX);
        let z2 = y * Math.sin(angleX) + z * Math.cos(angleX);

        p.x = x;
        p.y = y2;
        p.z = z2;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Smooth rotation based on mouse
        this.targetRotationY += this.rotationSpeed; // Constant rotation
        this.targetRotationX = this.mouseY * 0.3; // Reduced from 0.5 to 0.1

        // Add mouse influence to Y rotation
        const mouseInfluenceY = this.mouseX * 0.3; // Reduced from 0.5 to 0.1

        // Interpolate current rotation
        this.rotationX += (this.targetRotationX - this.rotationX) * 0.04; // Slower easing (was 0.05)
        this.rotationY += (this.rotationSpeed + (mouseInfluenceY * 0.02)); // Reduced multiplier from 0.05 to 0.01

        // Draw connections first (behind particles)
        this.ctx.lineWidth = 0.5;

        // Update and project all particles first
        const projectedParticles = this.particles.map(p => {
            this.rotate(p, this.rotationX, this.rotationY);
            return {
                ...this.project(p),
                original: p
            };
        });

        // Sort by Z depth so we draw back-to-front
        projectedParticles.sort((a, b) => b.original.z - a.original.z);

        // Draw connections
        // Optimization: Only connect nearby particles in 3D space
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                // 3D distance check
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                // Connect if close enough
                if (dist < 60) {
                    const proj1 = this.project(p1);
                    const proj2 = this.project(p2);

                    // Opacity based on distance and depth
                    const alpha = (1 - dist / 60) * 0.3;
                    // Fade out lines that are far back
                    const depthAlpha = (p1.z > 0 && p2.z > 0) ? 0.5 : 1;

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(157, 78, 221, ${alpha * depthAlpha})`;
                    this.ctx.moveTo(proj1.x, proj1.y);
                    this.ctx.lineTo(proj2.x, proj2.y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles
        projectedParticles.forEach(p => {
            // Pulsing size
            const pulse = Math.sin(Date.now() * 0.002 + p.original.pulseOffset);
            const size = p.original.size * p.scale * (1 + pulse * 0.2);

            // Opacity based on Z depth (fade out back particles slightly)
            const alpha = p.original.z > 100 ? 0.5 : 1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.original.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();

            // Add glow to some particles
            if (p.original.size > 1.5) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = p.original.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }

            this.ctx.globalAlpha = 1;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('hero-canvas')) {
        new HeroSphereAnimation('hero-canvas');
    }
});
