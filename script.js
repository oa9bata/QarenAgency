// Supabase Configuration
// Use environment variables for security
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables not found. Please check your .env file.');
}

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
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
        navbar.style.background = 'rgba(117, 79, 61, 0.15)';
        navbar.style.backdropFilter = 'blur(25px)';
    } else {
        navbar.style.background = 'rgba(117, 79, 61, 0.1)';
        navbar.style.backdropFilter = 'blur(20px)';
    }
});

// Hero phone form submission with Supabase
const phoneInput = document.querySelector('.phone-input');
const ctaButton = document.querySelector('.cta-button');
const ctaSection = document.querySelector('.cta-section');
const contactInfo = document.querySelector('.contact-info');
const thankYouMessage = document.querySelector('.thank-you-message');

if (ctaButton && phoneInput) {
    ctaButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        
        if (phone && isValidPhone(phone)) {
            // Show loading state
            ctaButton.textContent = 'جاري الإرسال...';
            ctaButton.disabled = true;
            ctaButton.style.background = 'rgba(117, 79, 61, 0.8)';
            
            try {
                // Check if Supabase is available
                if (typeof supabase !== 'undefined' && supabase) {
                    // Save to Supabase
                    const { data, error } = await supabase
                        .from('contact_submissions')
                        .insert([
                            {
                                phone: phone,
                                submission_type: 'hero'
                            }
                        ]);

                    if (error) {
                        throw error;
                    }
                }

                // Success - hide form and show thank you message
                setTimeout(() => {
                    if (ctaSection) {
                        ctaSection.style.opacity = '0';
                        ctaSection.style.transform = 'translateY(-20px)';
                    }
                    if (contactInfo) {
                        contactInfo.style.opacity = '0';
                        contactInfo.style.transform = 'translateY(-20px)';
                    }
                    
                    setTimeout(() => {
                        if (ctaSection) ctaSection.style.display = 'none';
                        if (contactInfo) contactInfo.style.display = 'none';
                        
                        // Show thank you message
                        if (thankYouMessage) {
                            thankYouMessage.style.display = 'block';
                            setTimeout(() => {
                                thankYouMessage.classList.add('show');
                            }, 100);
                        }
                    }, 300);
                }, 500);

            } catch (error) {
                console.error('Error saving to database:', error);
                showError('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى');
                
                // Reset button state
                ctaButton.textContent = 'ابدأ';
                ctaButton.disabled = false;
                ctaButton.style.background = 'linear-gradient(135deg, #754F3D, #ffffff)';
            }
        } else {
            showError('يرجى إدخال رقم هاتف سعودي صحيح');
        }
    });
}

// Contact form submission with Supabase integration
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameField = contactForm.querySelector('input[type="text"]');
        const emailField = contactForm.querySelector('input[type="email"]');
        const phoneField = contactForm.querySelector('input[type="tel"]');
        const messageField = contactForm.querySelector('textarea');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Get form values
        const name = nameField ? nameField.value.trim() : '';
        const email = emailField ? emailField.value.trim() : '';
        const phone = phoneField ? phoneField.value.trim() : '';
        const message = messageField ? messageField.value.trim() : '';
        
        // Validate required fields
        if (!name || !email || !message) {
            showError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        // Validate phone number if provided
        if (phone && !isValidPhone(phone)) {
            showError('يرجى إدخال رقم هاتف سعودي صحيح');
            return;
        }
        
        // Show loading state
        submitButton.textContent = 'جاري الإرسال...';
        submitButton.disabled = true;
        submitButton.style.background = 'rgba(117, 79, 61, 0.8)';
        
        try {
            // Check if Supabase is available
            if (typeof supabase !== 'undefined' && supabase) {
                // Save to Supabase
                const { data, error } = await supabase
                    .from('contact_submissions')
                    .insert([
                        {
                            name: name,
                            email: email,
                            phone: phone || null,
                            message: message,
                            submission_type: 'contact'
                        }
                    ]);

                if (error) {
                    throw error;
                }
            }

            // Success
            submitButton.textContent = 'تم الإرسال!';
            submitButton.style.background = 'linear-gradient(135deg, #754F3D, #ffffff)';
            contactForm.reset();
            
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Error saving to database:', error);
            showError('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى');
            
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.background = 'linear-gradient(135deg, #754F3D, #ffffff)';
        }
    });
}

// Enhanced Intersection Observer for animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add staggered animation for multiple elements
                const siblings = entry.target.parentElement.children;
                Array.from(siblings).forEach((sibling, index) => {
                    if (sibling.classList.contains('animate-on-scroll')) {
                        setTimeout(() => {
                            sibling.style.opacity = '1';
                            sibling.style.transform = 'translateY(0)';
                        }, index * 200);
                    }
                });
            }
        });
    }, observerOptions);

    // Apply animation to cards
    document.querySelectorAll('.service-card, .portfolio-card').forEach((card, index) => {
        card.classList.add('animate-on-scroll');
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;
        animateOnScroll.observe(card);
    });
}

// Stats animation function
function initializeStatsAnimation() {
    // Enhanced stats counter animation
    function animateCounter(element, target, duration = 2000) {
        let startTime = null;
        const startValue = 0;
        
        function updateCounter(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            element.textContent = currentValue + '+';
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Trigger stats animation when about section is visible
    const aboutSection = document.querySelector('.about');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                
                // Animate each stat counter with delay
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach((stat, index) => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    if (target && !isNaN(target)) {
                        setTimeout(() => {
                            animateCounter(stat, target, 2500);
                        }, index * 300);
                    }
                });
                
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (aboutSection) {
        statsObserver.observe(aboutSection);
    }
}

// Enhanced service card hover effects
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Add subtle rotation and glow effect
        card.style.transform = 'translateY(-15px) rotate(1deg)';
        card.style.boxShadow = '0 25px 50px rgba(117, 79, 61, 0.25)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotate(0deg)';
        card.style.boxShadow = 'none';
    });
});

// Portfolio card hover effects
document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const comingSoon = card.querySelector('.coming-soon');
        if (comingSoon) {
            comingSoon.style.transform = 'scale(1.1)';
            comingSoon.style.color = '#ffffff';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        const comingSoon = card.querySelector('.coming-soon');
        if (comingSoon) {
            comingSoon.style.transform = 'scale(1)';
            comingSoon.style.color = '#754F3D';
        }
    });
});

// Social links enhanced hover effects
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-8px) rotate(5deg)';
        link.style.boxShadow = '0 15px 30px rgba(117, 79, 61, 0.4)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0) rotate(0deg)';
        link.style.boxShadow = '0 10px 20px rgba(117, 79, 61, 0.3)';
    });
});

// Contact method hover effects
document.querySelectorAll('.contact-method').forEach(method => {
    method.addEventListener('mouseenter', () => {
        const icon = method.querySelector('.icon');
        if (icon) {
            icon.style.transform = 'rotate(15deg) scale(1.1)';
        }
    });
    
    method.addEventListener('mouseleave', () => {
        const icon = method.querySelector('.icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg) scale(1)';
        }
    });
});

// Enhanced floating animations with more variety
const floatingElements = document.querySelectorAll('.floating-circle, .gradient-blob, .gradient-circle');
floatingElements.forEach((element, index) => {
    // Add random delays and durations for more natural movement
    const delay = Math.random() * 2;
    const duration = 8 + Math.random() * 4; // Between 8-12 seconds
    
    element.style.animationDelay = `${delay}s`;
    element.style.animationDuration = `${duration}s`;
    
    // Add different animation types
    if (index % 2 === 0) {
        element.style.animationName = 'float';
    } else {
        element.style.animationName = 'pulse';
    }
});

// Parallax effect for hero elements
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-circle, .gradient-blob');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.2);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Form input focus effects
document.querySelectorAll('.phone-input, .contact-form input, .contact-form textarea').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all spaces, dashes, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check for the specific Saudi phone number patterns you requested
    const validPatterns = [
        /^\+966[0-9]{9}$/, // +966 followed by 9 digits (total 13 chars)
        /^966[0-9]{9}$/, // 966 followed by 9 digits (total 12 chars)
        /^9665[0-9]{8}$/, // 9665 followed by 8 digits (total 12 chars)
        /^\+9665[0-9]{8}$/, // +9665 followed by 8 digits (total 13 chars)
        /^05[0-9]{8}$/, // 05 followed by 8 digits (total 10 digits)
        /^5[0-9]{8}$/ // 5 followed by 8 digits (total 9 digits)
    ];
    
    return validPatterns.some(pattern => pattern.test(cleanPhone));
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #754F3D, #ffffff);
        color: #000000;
        padding: 15px 25px;
        border-radius: 15px;
        z-index: 1000;
        font-weight: 600;
        font-family: 'IBM Plex Sans Arabic', sans-serif;
        box-shadow: 0 10px 30px rgba(117, 79, 61, 0.3);
        animation: slideIn 0.4s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove error after 4 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 400);
    }, 4000);
}

// Add CSS animations for notifications and enhanced effects
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes glow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(117, 79, 61, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(117, 79, 61, 0.6);
        }
    }
    
    .loading {
        position: relative;
        overflow: hidden;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(117, 79, 61, 0.2), transparent);
        animation: loading 2s infinite;
    }
    
    @keyframes loading {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }
`;
document.head.appendChild(style);

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animation to hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Add staggered animation to navigation items
    const navItems = document.querySelectorAll('.nav-menu a');
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 500 + (index * 100));
    });

    // Initialize scroll animations after DOM is loaded
    initializeScrollAnimations();
    initializeStatsAnimation();
});