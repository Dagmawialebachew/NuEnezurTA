// 1. REGISTRATION & GLOBAL CONFIG
gsap.registerPlugin(ScrollTrigger);

const UI = {
    loader: document.getElementById('global-loader'),
    loaderText: document.querySelectorAll('.loader-text'),
    loaderBar: document.getElementById('loader-bar'),
    cursor: document.getElementById('cursor'),
    menuBtn: document.getElementById('menu-toggle'),
    closeBtn: document.getElementById('menu-close'),
    navOverlay: document.getElementById('nav-overlay'),
    navBar: document.querySelector('nav'),
    heroCard: document.querySelector('#hero-card'),
    heroBg: document.querySelector('#hero-bg'),
    navLinks: document.querySelectorAll('.nav-link')
};

let menuOpen = false;
let lastScroll = 0;


// Define state outside so it persists across re-initializations
// PERSISTENT STATE: Define outside to keep audio preference during swiping
let isGlobalMuted = true;

const initHeroSwiper = () => {
    const selectors = {
        progressFill: document.querySelector('.swiper-progress-bar'),
        currIdxText: document.querySelector('.curr-idx'),
        totalIdxText: document.querySelector('.total-idx'),
        regionText: document.querySelector('.region-text'),
        soundBtn: document.getElementById('sound-toggle'),
        swiperContainer: document.querySelector('.hero-swiper'),
        wrapper: document.querySelector('.hero-swiper .swiper-wrapper')
    };
    

    if (!selectors.swiperContainer || !selectors.wrapper) return;

    // 1. ELITE SHUFFLE: Randomize slides before Swiper initialization
    const slides = Array.from(selectors.wrapper.querySelectorAll('.swiper-slide'));
    for (let i = slides.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slides[i], slides[j]] = [slides[j], slides[i]];
    }
    selectors.wrapper.innerHTML = '';
    slides.forEach(slide => selectors.wrapper.appendChild(slide));

    // 2. INITIALIZE SWIPER
    const swiper = new Swiper('.hero-swiper', {
        loop: true,
        autoplay: {
            delay: 7000,
            disableOnInteraction: false,
        },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        on: {
            init: function () {
                // Determine true count (total slides minus loop clones)
                const totalSlides = this.slides.length - (this.loopedSlides * 2);
                if (selectors.totalIdxText) {
                    selectors.totalIdxText.innerText = totalSlides < 10 ? `0${totalSlides}` : totalSlides;
                }
                updateSlideMedia(this);
                updateRegionText(this, true); // Immediate update on init
            },
            slideChange: function () {
                const totalSlides = this.slides.length - (this.loopedSlides * 2);
                const currentRealIndex = this.realIndex + 1;

                // Update Index UI
                if (selectors.currIdxText) {
                    selectors.currIdxText.innerText = currentRealIndex < 10 ? `0${currentRealIndex}` : currentRealIndex;
                }

                // Update Progress Bar
                if (selectors.progressFill) {
                    const progressPercent = (currentRealIndex / totalSlides) * 100;
                    gsap.to(selectors.progressFill, { width: `${progressPercent}%`, duration: 0.8, ease: "power2.out" });
                }

                updateRegionText(this);
                updateSlideMedia(this);
            }
        }
    });

    // 3. REGION TEXT TRANSITION: GSAP "Slide and Fade"
   function updateRegionText(instance, immediate = false) {
    // 1. Get the current active slide element directly from the DOM
    const activeSlide = instance.slides[instance.activeIndex];
    
    // 2. Safety Check: If the slide doesn't exist yet, kill the function
    if (!activeSlide || !selectors.regionText) return;

    // 3. Get the attribute
    const newRegion = activeSlide.getAttribute('data-region');
    
    // 4. If attribute is missing, don't break the script
    if (!newRegion) return;

    if (immediate) {
        selectors.regionText.innerText = newRegion;
    } else {
        gsap.to(selectors.regionText, { 
            y: -10, opacity: 0, duration: 0.3, 
            onComplete: () => {
                selectors.regionText.innerText = newRegion;
                gsap.to(selectors.regionText, { y: 0, opacity: 1, duration: 0.3 });
            }
        });
    }
}

    // 4. MEDIA MANAGEMENT: Video Play/Pause & Audio Sync
    function updateSlideMedia(instance) {
        instance.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (!video) return;

            if (index === instance.activeIndex) {
                video.muted = isGlobalMuted;
                video.play().catch(() => {});
            } else {
                video.pause();
                video.currentTime = 0; // Ensures clean start when returned to
            }
        });
    }

    // 5. AUDIO TOGGLE EVENT
    if (selectors.soundBtn) {
        selectors.soundBtn.addEventListener('click', () => {
            isGlobalMuted = !isGlobalMuted;
            
            const iconMuted = document.getElementById('icon-muted');
            const iconUnmuted = document.getElementById('icon-unmuted');
            
            if(iconMuted) iconMuted.classList.toggle('hidden', !isGlobalMuted);
            if(iconUnmuted) iconUnmuted.classList.toggle('hidden', isGlobalMuted);

            const activeVid = swiper.slides[swiper.activeIndex].querySelector('video');
            if (activeVid) activeVid.muted = isGlobalMuted;
        });
    }

    return swiper;
};
// ---


// ---

// 3. CONTENT REVEAL (ABOUT & DESTINATIONS)
const initScrollAnimations = () => {
    // FIX: Escape Tailwind brackets for [20vw] to avoid SyntaxError
    const backgroundExploreText = document.querySelector("#about h2.text-\\[20vw\\]");
    
    if (backgroundExploreText) {
        gsap.to(backgroundExploreText, {
            scrollTrigger: {
                trigger: "#about",
                start: "top bottom",
                end: "bottom top",
                scrub: 2
            },
            x: 150, 
            ease: "none"
        });
    }

    // Parallax for All Images
    document.querySelectorAll('.parallax-img').forEach(img => {
        gsap.to(img, {
            scrollTrigger: {
                trigger: img,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            yPercent: -15, 
            ease: "none"
        });
    });

    // Global Text Reveal
    gsap.utils.toArray('.reveal-text').forEach(text => {
        gsap.to(text, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
                trigger: text,
                start: "top 92%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Why Travel With Us - List Stagger
    const listItems = document.querySelectorAll("#about .space-y-16 > div");
    if (listItems.length > 0) {
        gsap.from(listItems, {
            scrollTrigger: {
                trigger: "#about .space-y-16",
                start: "top 85%",
            },
            x: -40,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "expo.out"
        });
    }
};
const initInteractivity = () => {
    // 1. Check if device has a mouse (fine pointer)
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    if (isDesktop) {
        // Only show cursor element on desktop
        UI.cursor.style.display = 'block';

        document.addEventListener('mousemove', (e) => {
            // Smooth cursor movement
            gsap.to(UI.cursor, { 
                x: e.clientX, 
                y: e.clientY, 
                duration: 0.1,
                opacity: 1 // Make it visible once movement starts
            });

            // Hero Parallax Depth
            if (UI.heroCard) {
                const xPos = (e.clientX / window.innerWidth - 0.5) * 40;
                const yPos = (e.clientY / window.innerHeight - 0.5) * 40;
                gsap.to(UI.heroCard, { x: xPos, y: yPos, duration: 1, ease: "power2.out" });
                gsap.to(UI.heroBg, { x: -xPos / 2, y: -yPos / 2, duration: 1.5, ease: "power2.out" });
            }
        });
    } else {
        // 2. Completely kill the cursor for mobile/touch
        if (UI.cursor) UI.cursor.remove(); 
    }

    // Continuous Badge Rotation (Keep this as is)
    gsap.to(".animate-spin-slow", {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none"
    });
};

const initVaultAnimations = () => {
    // 1. Stagger Reveal for Header
    gsap.from("#vault .reveal-item", {
        scrollTrigger: {
            trigger: "#vault",
            start: "top 80%",
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
        duration: 1.5,
        ease: "expo.out"
    });

    // 2. Parallax Effect for Cards
    // Cards move at slightly different speeds for depth
    document.querySelectorAll('.vault-card').forEach(card => {
        const speed = card.getAttribute('data-speed');
        
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            y: (i, target) => -window.innerHeight * speed,
            ease: "none"
        });

        // 3. Sub-Parallax for Images inside cards (creates "Zoom Out" effect on scroll)
        const img = card.querySelector('.vault-img');
        gsap.to(img, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            scale: 1, // Scales from 1.1 down to 1
            ease: "none"
        });

        // 4. Number Parallax (The "01", "02" float faster)
        const num = card.querySelector('.vault-number');
        gsap.to(num, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            y: -40,
            ease: "none"
        });
    });
};


// ---

// 4. DESTINATION INTERACTIONS (MOBILE FRIENDLY)
const initTourInteractions = () => {
    const tourRows = document.querySelectorAll('.tour-row');
    
    // We removed the "tour-preview" cursor-follow logic 
    // because we now have visible thumbnails.
    // Instead, we add a "Magnetic" feel to the thumbnails on desktop.
    
    tourRows.forEach(row => {
        row.addEventListener('click', () => {
            // Optional: Add logic to open a specific trip modal or link
            console.log("Tour clicked: " + row.querySelector('h3').innerText);
        });
    });
};

// ---

// 5. NAVIGATION & HERO Intro
const toggleMenu = (open) => {
    menuOpen = open;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (open) {
        UI.navOverlay.classList.remove('hidden');
        
        tl.to(UI.navOverlay, { 
            opacity: 1, 
            duration: 0.5 
        })
        // Force the opacity from 0 to 1 explicitly
        .fromTo(".nav-link", 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 }, 
            "-=0.3"
        )
        .fromTo(".nav-secondary-info", 
            { x: 30, opacity: 0 }, 
            { x: 0, opacity: 1, stagger: 0.1, duration: 0.8 }, 
            "-=0.6"
        );

    } else {
        tl.to(UI.navOverlay, { 
            opacity: 0, 
            duration: 0.4, 
            onComplete: () => {
                UI.navOverlay.classList.add('hidden');
                // We keep the opacity at 0 for the next open
                gsap.set([".nav-link", ".nav-secondary-info"], { opacity: 0 });
            } 
        });
    }
};
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) {
        gsap.to(UI.navBar, { y: -100, opacity: 0, duration: 0.4 });
    } else {
        gsap.to(UI.navBar, { y: 0, opacity: 1, duration: 0.4 });
    }
    lastScroll = currentScroll;
});

const initHeroIntro = () => {
    const introTl = gsap.timeline({ defaults: { ease: "power4.out" } });

    introTl
        .fromTo(UI.heroBg, 
            { scale: 1.4, filter: "brightness(0)" }, 
            { scale: 1, filter: "brightness(0.5)", duration: 2.5, ease: "power2.out" }
        )
        .to(".hero-stagger", { 
            y: 0, 
            opacity: 1, 
            stagger: 0.2, 
            duration: 1.8, 
            ease: "expo.out" 
        }, "-=2.0")
        .to(UI.heroCard, { 
            x: 0, 
            opacity: 1, 
            duration: 2.5, 
            ease: "expo.out" 
        }, "-=1.8");
};


// ---

// 6. INITIALIZATION
// Change this at the bottom of your script
// This function handles the "Curtain Rise"
const runGlobalLoader = () => {
    const tl = gsap.timeline({
        onComplete: () => {
            // After the loader is gone, initialize the scroll-heavy stuff
            initScrollAnimations();
            initVaultAnimations();
            UI.loader.remove(); // Clean up DOM
        }
    });

    tl.to(UI.loaderText, { 
        y: 0, 
        duration: 1.2, 
        stagger: 0.2, 
        ease: "expo.out" 
    })
    .to(UI.loaderBar, { 
        width: "100%", 
        duration: 1.5, 
        ease: "power2.inOut" 
    }, "-=0.8")
    .to(UI.loader, { 
        yPercent: -100, 
        duration: 1.2, 
        ease: "expo.inOut" 
    }, "+=0.3")
    // Trigger your existing Hero Intro exactly when the curtain starts lifting
    .add(() => {
        initHeroIntro(); 
    }, "-=1.0");
};

// 6. MODIFIED INITIALIZATION
const init = () => {
    // Immediate background setup (Non-visual)
    initInteractivity();
    initHeroSwiper();
    initTourInteractions();
    
    // Start the loading sequence
    runGlobalLoader();
};

// Use 'load' instead of 'DOMContentLoaded' to ensure videos/images are buffered
window.addEventListener('load', init);

