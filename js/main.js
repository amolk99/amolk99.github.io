// ============================================
// DOM Elements
// ============================================
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
const sections = document.querySelectorAll('section');
const timelineItems = document.querySelectorAll('.timeline-item');

// ============================================
// Navigation
// ============================================

// Scroll effect for navigation
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class for styling
    if (currentScroll > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking a link
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = nav.offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Scroll Animations
// ============================================

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements that should animate
document.querySelectorAll('.section-header, .about-content, .skill-card, .timeline-item, .feature-item, .contact-content, .hobby-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ============================================
// Interactive Map
// ============================================

// Location data
const locations = {
    india: {
        coords: [28.6139, 77.2090], // New Delhi
        name: 'New Delhi, India',
        description: 'Born here. Where my journey began.',
        dates: '1999 - 2007'
    },
    singapore: {
        coords: [1.3521, 103.8198],
        name: 'Singapore',
        description: 'Became Singaporean. Completed education and early career in robotics.',
        dates: '2007 - 2022'
    },
    sweden: {
        coords: [56.8770, 14.8059], // Växjö (Linnaeus University)
        name: 'Växjö, Sweden',
        description: "B.Sc. & Master's in Computer Science at Linnaeus University.",
        dates: '2022 - Present'
    },
    finland: {
        coords: [62.2426, 25.7473], // Jyväskylä
        name: 'Jyväskylä, Finland',
        description: 'Splitting time with my partner. Embracing Nordic life.',
        dates: '2022 - Present'
    }
};

// Initialize map
let map;
let markers = {};

function initMap() {
    // Create map centered on Europe
    map = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: true
    }).setView([40, 50], 2);

    // Add modern map tiles (CartoDB Positron for clean look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Custom marker icon
    const createIcon = (isActive = false) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="map-marker ${isActive ? 'active' : ''}" style="
                width: ${isActive ? '20px' : '16px'};
                height: ${isActive ? '20px' : '16px'};
                background: ${isActive ? '#4f8cff' : '#7c5cff'};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
                transition: all 0.3s ease;
            "></div>`,
            iconSize: [isActive ? 20 : 16, isActive ? 20 : 16],
            iconAnchor: [isActive ? 10 : 8, isActive ? 10 : 8],
            popupAnchor: [0, -10]
        });
    };

    // Add markers for each location
    Object.keys(locations).forEach(key => {
        const loc = locations[key];
        const marker = L.marker(loc.coords, {
            icon: createIcon(key === 'finland' || key === 'sweden')
        }).addTo(map);

        // Create popup content
        const popupContent = `
            <div class="map-popup">
                <h4>${loc.name}</h4>
                <p style="color: #4f8cff; font-weight: 500; margin-bottom: 4px;">${loc.dates}</p>
                <p>${loc.description}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
        });

        markers[key] = marker;
    });

    // Draw connection lines between locations
    const lineCoords = [
        locations.india.coords,
        locations.singapore.coords,
        locations.sweden.coords,
        locations.finland.coords
    ];

    L.polyline(lineCoords, {
        color: '#7c5cff',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 10',
        smoothFactor: 1
    }).addTo(map);

    // Fit bounds to show all markers
    const bounds = L.latLngBounds(Object.values(locations).map(l => l.coords));
    map.fitBounds(bounds, { padding: [50, 50] });
}

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('map')) {
        initMap();
    }
});

// Timeline interaction with map
timelineItems.forEach(item => {
    item.addEventListener('click', () => {
        const location = item.dataset.location;
        if (location && locations[location] && map) {
            // Pan to location
            map.flyTo(locations[location].coords, 5, {
                duration: 1.5
            });
            
            // Open popup
            if (markers[location]) {
                markers[location].openPopup();
            }
            
            // Update active states
            timelineItems.forEach(ti => {
                ti.querySelector('.timeline-marker').classList.remove('active');
            });
            item.querySelector('.timeline-marker').classList.add('active');
        }
    });
    
    // Hover effect
    item.addEventListener('mouseenter', () => {
        const location = item.dataset.location;
        if (location && markers[location]) {
            markers[location].openPopup();
        }
    });
});

// ============================================
// Animation Demos
// ============================================

// Add continuous animation to shapes
const animationDemo = document.querySelector('.animation-demo');
if (animationDemo) {
    const shapes = animationDemo.querySelectorAll('.animation-circle, .animation-square, .animation-triangle');
    shapes.forEach((shape, index) => {
        shape.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
        shape.style.animationDelay = `${-index * 0.7}s`;
    });
}

// ============================================
// Hero Shape Animation
// ============================================

// Mouse parallax effect for hero shapes
const heroShapes = document.querySelector('.hero-shapes');
if (heroShapes) {
    document.addEventListener('mousemove', (e) => {
        const shapes = heroShapes.querySelectorAll('.shape');
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 15;
            shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

// ============================================
// Typing Effect for Hero (optional enhancement)
// ============================================

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ============================================
// Skills Cards Hover Effect
// ============================================

const skillCards = document.querySelectorAll('.skill-card');
skillCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ============================================
// Responsive Demo Animation
// ============================================

const responsiveDemo = document.querySelector('.responsive-demo');
if (responsiveDemo) {
    const devices = responsiveDemo.querySelectorAll('.device');
    
    // Add subtle floating animation
    devices.forEach((device, index) => {
        device.style.animation = `float ${2 + index * 0.3}s ease-in-out infinite`;
        device.style.animationDelay = `${-index * 0.4}s`;
    });
}

// ============================================
// Smooth Section Reveal
// ============================================

// Intersection Observer for section animations
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '-50px'
});

sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease-out';
    sectionObserver.observe(section);
});

// First section (hero) should be visible immediately
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'translateY(0)';
}

// ============================================
// Interactive Map Preview Animation
// ============================================

const mapPreview = document.querySelector('.interactive-map-preview');
if (mapPreview) {
    // Create additional animated dots
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: #5e5ce6;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
            animation-delay: ${-i * 0.6}s;
            top: ${20 + Math.random() * 60}%;
            left: ${20 + Math.random() * 60}%;
        `;
        mapPreview.appendChild(dot);
    }
}

// ============================================
// Color Palette Animation
// ============================================

const colorSwatches = document.querySelectorAll('.color-swatch');
colorSwatches.forEach((swatch, index) => {
    swatch.addEventListener('mouseenter', () => {
        swatch.style.transform = 'scale(1.1) translateY(-4px)';
        swatch.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    });
    
    swatch.addEventListener('mouseleave', () => {
        swatch.style.transform = 'scale(1) translateY(0)';
        swatch.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
    });
    
    swatch.style.transition = 'all 0.3s ease';
});

// ============================================
// Contact Link Hover Effects
// ============================================

const contactLinks = document.querySelectorAll('.contact-link');
contactLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const icon = link.querySelector('.contact-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1)';
            icon.style.background = 'var(--color-primary)';
            icon.querySelector('svg').style.color = 'white';
        }
    });
    
    link.addEventListener('mouseleave', () => {
        const icon = link.querySelector('.contact-icon');
        if (icon) {
            icon.style.transform = 'scale(1)';
            icon.style.background = 'var(--color-card)';
            icon.querySelector('svg').style.color = 'var(--color-primary)';
        }
    });
});

// ============================================
// Performance Optimization
// ============================================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for mouse events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Scroll Progress Indicator
// ============================================

const scrollProgressBar = document.querySelector('.scroll-progress-bar');
const scrollDots = document.querySelectorAll('.scroll-dot');
const sectionIds = ['hero', 'about', 'skills', 'journey', 'work', 'hobbies', 'contact'];

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // Update progress bar
    if (scrollProgressBar) {
        scrollProgressBar.style.setProperty('--scroll-progress', `${scrollPercent}%`);
    }
    
    // Update active dot based on current section
    let currentSection = 'hero';
    sectionIds.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 3) {
                currentSection = id;
            }
        }
    });
    
    scrollDots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.section === currentSection) {
            dot.classList.add('active');
        }
    });
}

// Add click handlers for scroll dots
scrollDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const sectionId = dot.dataset.section;
        const section = document.getElementById(sectionId);
        if (section) {
            const navHeight = nav.offsetHeight;
            const targetPosition = section.offsetTop - navHeight - 20;
            window.scrollTo({
                top: sectionId === 'hero' ? 0 : targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', throttle(updateScrollProgress, 16));
window.addEventListener('load', updateScrollProgress);

// ============================================
// Initialize
// ============================================

console.log('Amol Kaushik Portfolio - Initialized');
console.log('Built with passion for design and code.');
