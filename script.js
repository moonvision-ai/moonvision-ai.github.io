// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Canvas Animations
class StarField {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 200;

        this.resize();
        this.createStars();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2,
                opacity: Math.random(),
                speed: Math.random() * 0.5 + 0.1,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(star => {
            // Update star properties
            star.opacity += star.twinkle;
            if (star.opacity > 1 || star.opacity < 0.1) {
                star.twinkle = -star.twinkle;
            }

            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.fill();

            // Add glow effect for larger stars
            if (star.radius > 1) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(157, 78, 221, ${star.opacity * 0.3})`; // Purple glow
                this.ctx.fill();
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

class AstroChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.angle = 0;
        this.signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        this.colors = ['#9D4EDD', '#00B4D8', '#E0AAFF', '#C77DFF', '#7209B7', '#480CA8']; // Neon theme colors

        this.resize();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Draw outer circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw zodiac signs
        this.signs.forEach((sign, index) => {
            const angle = (index * 30 - 90 + this.angle) * Math.PI / 180;
            const x = centerX + Math.cos(angle) * (radius - 15);
            const y = centerY + Math.sin(angle) * (radius - 15);

            this.ctx.fillStyle = this.colors[index % this.colors.length];
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sign, x, y + 5);
        });

        // Draw inner elements
        for (let i = 0; i < 3; i++) {
            const innerRadius = radius * (0.3 + i * 0.2);
            const planetAngle = (this.angle * (i + 1) * 0.5) * Math.PI / 180;
            const x = centerX + Math.cos(planetAngle) * innerRadius;
            const y = centerY + Math.sin(planetAngle) * innerRadius;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
        }

        this.angle += 0.5;
        requestAnimationFrame(() => this.animate());
    }
}

// Removed old CosmicAnimation class to prevent conflict with new external file

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards for animation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas animations
    new StarField('starfield');
    // new AstroChart('astro-chart'); // Removed or commented out if not used
    // new CosmicAnimation('cosmic-animation'); // Replaced by external file

    // Initialize new Cosmic Network animation if element exists
    if (document.getElementById('cosmic-animation')) {
        new CosmicAnimation('cosmic-animation');
    }

    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate stats when they come into view
    const stats = document.querySelectorAll('.stat h3');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isNumber = /\d+/.test(finalValue);

                if (isNumber) {
                    const number = parseInt(finalValue.match(/\d+/)[0]);
                    const suffix = finalValue.replace(/\d+/, '');
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            target.textContent = finalValue;
                            clearInterval(timer);
                        } else {
                            target.textContent = Math.floor(current) + suffix;
                        }
                    }, 30);
                }
                statsObserver.unobserve(target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Initialize body opacity
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Auto-scroll functionality for App Showcase
document.addEventListener('DOMContentLoaded', () => {
    const showcaseScroll = document.getElementById('showcase-scroll');
    if (showcaseScroll) {
        let animationFrameId;
        let isHovering = false;
        const speed = 0.5; // Adjust scroll speed

        // Auto-scroll Animation
        function autoScroll() {
            cancelAnimationFrame(animationFrameId); // Prevent multiple loops

            const animate = () => {
                if (!isHovering) {
                    showcaseScroll.scrollLeft += speed;
                    // Reset if reached end (infinite loop illusion would require duplicating items, but simple reset is fine for now or back-and-forth)
                    if (showcaseScroll.scrollLeft >= (showcaseScroll.scrollWidth - showcaseScroll.clientWidth)) {
                        showcaseScroll.scrollLeft = 0;
                    }
                }
                animationFrameId = requestAnimationFrame(animate);
            };

            animate();
        }

        // Start auto-scroll
        autoScroll();

        // Pause on hover (Targeting the outer container so buttons also pause scrolling)
        const showcaseContainer = document.querySelector('.showcase-container-outer');
        if (showcaseContainer) {
            showcaseContainer.addEventListener('mouseenter', () => {
                isHovering = true;
                cancelAnimationFrame(animationFrameId);
            });

            showcaseContainer.addEventListener('mouseleave', () => {
                isHovering = false;
                autoScroll(); // Resume auto-scroll on leave
            });
        } else {
            // Fallback if container not found (shouldn't happen based on HTML)
            showcaseScroll.addEventListener('mouseenter', () => {
                isHovering = true;
                cancelAnimationFrame(animationFrameId);
            });

            showcaseScroll.addEventListener('mouseleave', () => {
                isHovering = false;
                autoScroll();
            });
        }

        // Manual Navigation Buttons
        const prevBtn = document.querySelector('.showcase-nav.prev');
        const nextBtn = document.querySelector('.showcase-nav.next');

        // Calculate scroll step based on item width + gap. 
        // Note: showcase-item width is dynamic (min 300px, max 340px), plus 40px gap. 
        // We'll estimate a safe scroll amount or calculate dynamically if needed.
        // Using a slightly larger step ensures we fully clear an item.
        const scrollStep = 340 + 40;

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Stop auto-scroll to prevent conflict with smooth scrolling
                cancelAnimationFrame(animationFrameId);

                // Scroll LEFT by one step
                showcaseScroll.scrollBy({
                    left: -scrollStep,
                    behavior: 'smooth'
                });
            });

            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Stop auto-scroll to prevent conflict and immediate reset
                cancelAnimationFrame(animationFrameId);

                // Scroll RIGHT by one step
                showcaseScroll.scrollBy({
                    left: scrollStep,
                    behavior: 'smooth'
                });
            });
        }
    }
});

// Add hover effects to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });

    btn.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});