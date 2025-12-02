/**
 * Infinite Cosmic Tunnel - A hypnotic, endless journey through space-time.
 * Uses a 3D perspective projection to create a "warp speed" or wormhole effect.
 * No interaction required - just sit back and watch the infinite flow.
 */

class CosmicAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.stars = [];

        // Configuration for the infinite feel
        this.config = {
            starCount: 400,
            speed: 2,         // Base travel speed
            rotationSpeed: 0.002, // Slow rotation of the entire tunnel
            fov: 300,         // Field of view (depth perception)
            colors: [         // Cosmic palette
                { h: 260, s: 80, l: 65 }, // Purple
                { h: 190, s: 90, l: 60 }, // Cyan
                { h: 320, s: 70, l: 60 }, // Pink
                { h: 40, s: 100, l: 70 }  // Gold accent
            ]
        };

        this.tunnelRotation = 0;

        this.resize();
        this.initStars();
        this.animate = this.animate.bind(this);

        window.addEventListener('resize', () => this.resize());
        requestAnimationFrame(this.animate);
    }

    resize() {
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < this.config.starCount; i++) {
            this.stars.push(this.createStar(true)); // true = random depth start
        }
    }

    createStar(randomZ = false) {
        // Spawn stars in a circle around the center (tunnel walls)
        // Instead of random X/Y, we use Polar coordinates (angle & radius)
        // This creates a "tube" shape rather than a scattered box
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.random() * 300; // Tunnel width variation

        return {
            angle: angle,
            radius: radius, // Distance from center line
            x: 0, // Placeholder, calculated in draw
            y: 0,
            z: randomZ ? Math.random() * 2000 : 2000, // Start far away
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            size: Math.random() * 1.5 + 0.5,
            speedMult: Math.random() * 0.5 + 0.8 // Slight speed variance
        };
    }

    animate() {
        // Clear with a very slight trail effect for smoothness
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        // Using clearRect for sharp movement, or fillRect for trails
        // Let's use clearRect for crisp stars in this infinite tunnel
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Create a circular clipping mask
        // This ensures stars only appear within a circle and fade out at edges
        this.ctx.save();
        this.ctx.beginPath();
        const maxRadius = Math.min(this.width, this.height) / 2;
        this.ctx.arc(this.centerX, this.centerY, maxRadius, 0, Math.PI * 2);
        this.ctx.clip();

        // Rotate the entire tunnel slowly
        this.tunnelRotation += this.config.rotationSpeed;

        // Center of perspective
        const cx = this.centerX;
        const cy = this.centerY;

        this.stars.forEach((star, index) => {
            // Move star towards camera (Z decreases)
            star.z -= this.config.speed * star.speedMult;

            // Reset star if it passes the camera
            if (star.z <= 1) {
                this.stars[index] = this.createStar(false);
                return;
            }

            // 3D Projection Logic
            // Scale factor increases as Z gets smaller (closer)
            const scale = this.config.fov / star.z;

            // Apply tunnel rotation to star's angle
            const currentAngle = star.angle + this.tunnelRotation;

            // Project 3D polar coordinates to 2D screen X/Y
            // x = r * cos(theta)
            // y = r * sin(theta)
            // Then apply perspective scale
            const x2d = (Math.cos(currentAngle) * star.radius) * scale;
            const y2d = (Math.sin(currentAngle) * star.radius) * scale;

            // Final screen coordinates
            const screenX = cx + x2d;
            const screenY = cy + y2d;

            // Calculate distance from center for circular fade out
            const distFromCenter = Math.sqrt(x2d * x2d + y2d * y2d);
            const fadeStartRadius = maxRadius * 0.7;

            let edgeAlpha = 1;
            if (distFromCenter > fadeStartRadius) {
                edgeAlpha = Math.max(0, 1 - (distFromCenter - fadeStartRadius) / (maxRadius - fadeStartRadius));
            }

            // Size also scales with proximity
            const size = Math.max(0.1, star.size * scale);

            // Opacity fades in from distance and out when too close OR too far from center
            let alpha = 1;
            if (star.z > 1500) {
                alpha = (2000 - star.z) / 500;
            }

            // Combine alphas
            alpha *= edgeAlpha;

            if (alpha <= 0.01) return; // Skip drawing if invisible

            // Draw Star
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);

            // Color calculation
            const { h, s, l } = star.color;
            // Increase lightness as it gets closer for "shining" effect
            const litL = Math.min(100, l + (scale * 10));

            this.ctx.fillStyle = `hsla(${h}, ${s}%, ${litL}%, ${alpha})`;
            this.ctx.fill();

            // Optional: Draw "Warp Lines" (streak effect) for fast moving stars close to camera
            if (scale > 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                // Previous position estimation
                const prevScale = this.config.fov / (star.z + this.config.speed * 2);
                const prevX = cx + (Math.cos(currentAngle) * star.radius) * prevScale;
                const prevY = cy + (Math.sin(currentAngle) * star.radius) * prevScale;

                this.ctx.lineTo(prevX, prevY);
                this.ctx.strokeStyle = `hsla(${h}, ${s}%, ${litL}%, ${alpha * 0.5})`;
                this.ctx.lineWidth = size;
                this.ctx.stroke();
            }
        });

        this.ctx.restore(); // Restore from clipping mask

        requestAnimationFrame(this.animate);
    }
}