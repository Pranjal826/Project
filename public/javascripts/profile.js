const profileContainer = document.querySelector('.profile-container');

    // Create a GSAP animation
    gsap.from(profileContainer, {
        opacity: 0,        // Start with opacity 0
        scale: 0.5,         // Start with scale at 0.5
        rotation: -360,     // Start with a -360-degree rotation
        duration: 1.5,     // Animation duration in seconds
        ease: "elastic.out(1, 0.3)" // Easing function for a bounce effect
    });