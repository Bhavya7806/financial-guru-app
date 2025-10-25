import React, { useEffect, useRef } from 'react';
import './Hero.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


// Register GSAP plugins (done once)
gsap.registerPlugin(ScrollTrigger);

// Component receives user and modal handler props
const Hero = ({ user, onOpenAuthModal }) => {
    const heroRef = useRef(null); 

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Define all targets
        const headlineWords = heroRef.current?.querySelectorAll('.hero-headline .word');
        const subtitle = heroRef.current?.querySelector('.hero-subtitle');
        const ctaButtons = heroRef.current?.querySelectorAll('.cta-btn');
        const trustItems = heroRef.current?.querySelectorAll('.trust-item');

        ScrollTrigger.getAll().forEach(t => t.kill());

        if (reducedMotion) {
            gsap.set([headlineWords, subtitle, ctaButtons, trustItems], { opacity: 1, y: 0, scale: 1 });
            return;
        }

        // --- CORE FIX: Use gsap.set to override CSS and guarantee starting state ---
        gsap.set([headlineWords, subtitle, ctaButtons, trustItems], { opacity: 0, y: 30 });
        gsap.set(".bg-shapes", { opacity: 0 }); 

        const animationTimeout = setTimeout(() => {
            
            // --- 1. Hero Entrance Animation ---
            if (headlineWords && headlineWords.length > 0) {
                const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

                tl.to(".bg-shapes", { opacity: 1, duration: 1.5 }, 0)
                  .to(headlineWords, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.2) 
                  .to(subtitle, { y: 0, opacity: 1, scale: 1, duration: 0.6 }, "<0.3") 
                  .to(ctaButtons, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 }, "<0.2");
            } else {
                gsap.set([".hero-headline", ".hero-subtitle", ".cta-btn"], { opacity: 1, y: 0 });
            }

            // --- 2. Background Parallax (ScrollTrigger) ---
            ScrollTrigger.create({
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
                onUpdate: (self) => {
                    gsap.to(".shape-1", { y: self.progress * 100, x: self.progress * 50, rotation: self.progress * 90, ease: "none", duration: 0.1 });
                    gsap.to(".shape-2", { y: self.progress * -150, x: self.progress * -80, ease: "none", duration: 0.1 });
                }
            });

            // --- 3. Trust Indicators (Scroll-Triggered Stagger) ---
            gsap.to(trustItems, {
                opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power3.out",
                scrollTrigger: { trigger: ".trust-indicators", start: "top 95%", toggleActions: "play none none none" }
            });

            // --- 4. Magnetic Hover Effect (Interaction) ---
            const handleMagneticMove = (btn, e) => {
                const strength = 15;
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: (x / rect.width) * strength, y: (y / rect.height) * strength, duration: 0.4, ease: "power2.out" });
            };

            const handleMagneticLeave = (btn) => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
            };

            document.querySelectorAll(".cta-btn").forEach(btn => {
                btn.addEventListener("mousemove", (e) => handleMagneticMove(btn, e));
                btn.addEventListener("mouseleave", () => handleMagneticLeave(btn));
            });

        }, 50); 
        
        // Cleanup function
        return () => {
            clearTimeout(animationTimeout);
            ScrollTrigger.getAll().forEach(t => t.kill());
        };

    }, []); 

    // --- Button Handlers ---
    const handleGetStarted = () => {
      if (user) {
        // If logged in, redirect to the Dashboard
        window.location.href = '/dashboard'; 
      } else {
        // If not logged in, open the Sign Up modal
        onOpenAuthModal('signup');
      }
    };

    const handleWatchDemo = () => {
      alert("Demo video not yet implemented!");
    };
    
    const handleLearnMore = () => {
      // Smooth scroll to the #about section below the hero
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Splitting the headline for animation
    const headlineText = "AI-Powered Financial Freedom"; 
    const headlineWords = headlineText.split(' ').reduce((acc, word, index, array) => {
        acc.push(
            <span key={index} className="word">{word}</span>
        );
        if (index < array.length - 1) { acc.push(' '); } 
        return acc;
    }, []);

    return (
        <section className="hero-section" ref={heroRef}>
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <div className="hero-content">
                <h1 className="hero-headline">
                    {headlineWords}
                </h1>

                <p className="hero-subtitle">
                    Smart expense tracking, budget planning, and goal setting—all in one place. Take control of your money.
                </p>

                <div className="hero-buttons">
                    {/* Get Started Button: Smart redirection/modal open */}
                    <button onClick={handleGetStarted} className="cta-btn primary-btn">
                        {user ? 'Go to Dashboard' : 'Start Free Trial'}
                    </button>
                    
                    {/* Watch Demo Button: Alert handler */}
                    <button onClick={handleWatchDemo} className="cta-btn secondary-btn">
                        Watch Demo
                    </button>
                </div>
            </div>
             {/* 5. Trust Indicators (Appears on scroll) */}
            <section className="trust-section">
                <div className="trust-indicators">
                    {/* Learn More Button: Smooth scroll handler */}
                    <button className="trust-item" onClick={handleLearnMore} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        Learn More →
                    </button>
                    <div className="trust-item">🔒 Bank-Level Security</div>
                    <div className="trust-item">📈 Trusted by 50K+ Users</div>
                </div>
            </section>
        </section>
    );
};

export default Hero;