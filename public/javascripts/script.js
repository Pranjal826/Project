const navItems = document.querySelectorAll('.nav-items');
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: navItems,
            start: 'top 80%', 
            toggleActions: 'play none none reverse',
        },
    });

navItems.forEach((item) => {
        tl.from(item, {
            opacity: 0,
            x: -20,
            duration: 0.5,
        });
    });