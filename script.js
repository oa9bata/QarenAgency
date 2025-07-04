// Simple Supabase setup (animations work regardless)
let supabase = null;

// Wait for page to fully load
window.addEventListener('load', function() {
    console.log('🚀 Page loaded, initializing JavaScript...');
    
    // Try to initialize Supabase (without import.meta)
    try {
        // Use environment variables if available (will be set by Vercel)
        const SUPABASE_URL = window.ENV?.VITE_SUPABASE_URL || process?.env?.VITE_SUPABASE_URL || null;
        const SUPABASE_ANON_KEY = window.ENV?.VITE_SUPABASE_ANON_KEY || process?.env?.VITE_SUPABASE_ANON_KEY || null;
        
        if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase connected');
        } else {
            console.log('⚠️ Supabase not configured - forms will work without database');
        }
    } catch (error) {
        console.log('⚠️ Supabase setup failed - forms will work without database');
    }
    
    // Initialize all functionality
    initializeNavigation();
    initializeScrolling();
    initializeForms();
    initializeAnimations();
    
    console.log('✅ All JavaScript initialized');
});

// Navigation functions
function initializeNavigation() {
    console.log('🧭 Initializing navigation...');
    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        console.log('✅ Navigation initialized');
    }
}

function initializeScrolling() {
    console.log('📜 Initializing scrolling...');
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
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
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(117, 79, 61, 0.15)';
                navbar.style.backdropFilter = 'blur(25px)';
            } else {
                navbar.style.background = 'rgba(117, 79, 61, 0.1)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
        }
    });
    
    console.log('✅ Scrolling initialized');
}

function initializeForms() {
    console.log('📝 Initializing forms...');
    
    // Hero phone form
    const phoneInput = document.querySelector('.phone-input');
    const ctaButton = document.querySelector('.cta-button');
    const ctaSection = document.querySelector('.cta-section');
    const contactInfo = document.querySelector('.contact-info');
    const thankYouMessage = document.querySelector('.thank-you-message');

    if (ctaButton && phoneInput) {
        ctaButton.addEventListener('click', async function(e) {
            e.preventDefault();
            const phone = phoneInput.value.trim();
            
            if (phone && isValidPhone(phone)) {
                // Show loading state
                ctaButton.textContent = 'جاري الإرسال...';
                ctaButton.disabled = true;
                ctaButton.style.background = 'rgba(117, 79, 61, 0.8)';
                
                // Try to save to database (animations work regardless)
                try {
                    if (supabase) {
                        const result = await supabase
                            .from('contact_submissions')
                            .insert([{
                                phone: phone,
                                submission_type: 'hero'
                            }]);
                        
                        if (result.error) throw result.error;
                        console.log('✅ Phone saved to database');
                    }
                } catch (error) {
                    console.log('⚠️ Database save failed, but form still works:', error);
                }
                
                // Show success animation (works always)
                setTimeout(function() {
                    if (ctaSection) {
                        ctaSection.style.opacity = '0';
                        ctaSection.style.transform = 'translateY(-20px)';
                    }
                    if (contactInfo) {
                        contactInfo.style.opacity = '0';
                        contactInfo.style.transform = 'translateY(-20px)';
                    }
                    
                    setTimeout(function() {
                        if (ctaSection) ctaSection.style.display = 'none';
                        if (contactInfo) contactInfo.style.display = 'none';
                        
                        // Show thank you message
                        if (thankYouMessage) {
                            thankYouMessage.style.display = 'block';
                            setTimeout(function() {
                                thankYouMessage.classList.add('show');
                            }, 100);
                        }
                    }, 300);
                }, 1500);
            } else {
                showError('يرجى إدخال رقم هاتف سعودي صحيح');
            }
        });
    }
    
    // Contact form
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
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
            
            // Try to save to database (animations work regardless)
            try {
                if (supabase) {
                    const result = await supabase
                        .from('contact_submissions')
                        .insert([{
                            name: name,
                            email: email,
                            phone: phone || null,
                            message: message,
                            submission_type: 'contact'
                        }]);
                    
                    if (result.error) throw result.error;
                    console.log('✅ Contact form saved to database');
                }
            } catch (error) {
                console.log('⚠️ Database save failed, but form still works:', error);
            }
            
            // Show success animation (works always)
            setTimeout(function() {
                submitButton.textContent = 'تم الإرسال!';
                submitButton.style.background = 'linear-gradient(135deg, #754F3D, #ffffff)';
                contactForm.reset();
                
                setTimeout(function() {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
    
    console.log('✅ Forms initialized');
}

function initializeAnimations() {
    console.log('🎨 Initializing animations...');
    
    // Stats counter animation
    function animateCounter(element, target, duration) {
        duration = duration || 2000;
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

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    // Animate cards on scroll
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to service and portfolio cards
    document.querySelectorAll('.service-card, .portfolio-card').forEach(function(card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.8s ease ' + (index * 0.2) + 's, transform 0.8s ease ' + (index * 0.2) + 's';
        cardObserver.observe(card);
    });

    // Stats animation observer
    let statsAnimated = false;
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                
                // Animate each stat counter with delay
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach(function(stat, index) {
                    const target = parseInt(stat.getAttribute('data-target'));
                    if (target && !isNaN(target)) {
                        setTimeout(function() {
                            animateCounter(stat, target, 2500);
                        }, index * 300);
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    // Observe about section for stats animation
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        statsObserver.observe(aboutSection);
    }

    // Enhanced hover effects
    document.querySelectorAll('.service-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            card.style.transform = 'translateY(-15px) rotate(1deg)';
            card.style.boxShadow = '0 25px 50px rgba(117, 79, 61, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'translateY(0) rotate(0deg)';
            card.style.boxShadow = 'none';
        });
    });

    // Portfolio card hover effects
    document.querySelectorAll('.portfolio-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            const comingSoon = card.querySelector('.coming-soon');
            if (comingSoon) {
                comingSoon.style.transform = 'scale(1.1)';
                comingSoon.style.color = '#ffffff';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const comingSoon = card.querySelector('.coming-soon');
            if (comingSoon) {
                comingSoon.style.transform = 'scale(1)';
                comingSoon.style.color = '#754F3D';
            }
        });
    });

    // Social links hover effects
    document.querySelectorAll('.social-link').forEach(function(link) {
        link.addEventListener('mouseenter', function() {
            link.style.transform = 'translateY(-8px) rotate(5deg)';
            link.style.boxShadow = '0 15px 30px rgba(117, 79, 61, 0.4)';
        });
        
        link.addEventListener('mouseleave', function() {
            link.style.transform = 'translateY(0) rotate(0deg)';
            link.style.boxShadow = '0 10px 20px rgba(117, 79, 61, 0.3)';
        });
    });

    // Contact method hover effects
    document.querySelectorAll('.contact-method').forEach(function(method) {
        method.addEventListener('mouseenter', function() {
            const icon = method.querySelector('.icon');
            if (icon) {
                icon.style.transform = 'rotate(15deg) scale(1.1)';
            }
        });
        
        method.addEventListener('mouseleave', function() {
            const icon = method.querySelector('.icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg) scale(1)';
            }
        });
    });

    // Floating animations
    const floatingElements = document.querySelectorAll('.floating-circle, .gradient-blob, .gradient-circle');
    floatingElements.forEach(function(element, index) {
        const delay = Math.random() * 2;
        const duration = 8 + Math.random() * 4;
        
        element.style.animationDelay = delay + 's';
        element.style.animationDuration = duration + 's';
        
        if (index % 2 === 0) {
            element.style.animationName = 'float';
        } else {
            element.style.animationName = 'pulse';
        }
    });

    // Parallax effect
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-circle, .gradient-blob');
        
        parallaxElements.forEach(function(element, index) {
            const speed = 0.5 + (index * 0.2);
            element.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
        });
    });

    // Form input focus effects
    document.querySelectorAll('.phone-input, .contact-form input, .contact-form textarea').forEach(function(input) {
        input.addEventListener('focus', function() {
            if (input.parentElement) {
                input.parentElement.style.transform = 'scale(1.02)';
            }
        });
        
        input.addEventListener('blur', function() {
            if (input.parentElement) {
                input.parentElement.style.transform = 'scale(1)';
            }
        });
    });

    // Hero entrance animation
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(function() {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Navigation items animation
    const navItems = document.querySelectorAll('.nav-menu a');
    navItems.forEach(function(item, index) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        item.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
        
        setTimeout(function() {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 500 + (index * 100));
    });
    
    console.log('✅ Animations initialized');
}

// Utility functions
function isValidPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    const validPatterns = [
        /^\+966[0-9]{9}$/,
        /^966[0-9]{9}$/,
        /^9665[0-9]{8}$/,
        /^\+9665[0-9]{8}$/,
        /^05[0-9]{8}$/,
        /^5[0-9]{8}$/
    ];
    
    return validPatterns.some(function(pattern) {
        return pattern.test(cleanPhone);
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = [
        'position: fixed',
        'top: 20px',
        'right: 20px',
        'background: linear-gradient(135deg, #754F3D, #ffffff)',
        'color: #000000',
        'padding: 15px 25px',
        'border-radius: 15px',
        'z-index: 1000',
        'font-weight: 600',
        'font-family: IBM Plex Sans Arabic, sans-serif',
        'box-shadow: 0 10px 30px rgba(117, 79, 61, 0.3)',
        'animation: slideIn 0.4s ease'
    ].join(';');
    
    document.body.appendChild(errorDiv);
    
    setTimeout(function() {
        errorDiv.style.animation = 'slideOut 0.4s ease';
        setTimeout(function() {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 400);
    }, 4000);
}

// CSS animations
const style = document.createElement('style');
style.textContent = [
    '@keyframes slideIn {',
    '    from {',
    '        transform: translateX(100%) scale(0.8);',
    '        opacity: 0;',
    '    }',
    '    to {',
    '        transform: translateX(0) scale(1);',
    '        opacity: 1;',
    '    }',
    '}',
    '',
    '@keyframes slideOut {',
    '    from {',
    '        transform: translateX(0) scale(1);',
    '        opacity: 1;',
    '    }',
    '    to {',
    '        transform: translateX(100%) scale(0.8);',
    '        opacity: 0;',
    '    }',
    '}'
].join('\n');
document.head.appendChild(style);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, starting initialization...');
    
    // Hero entrance animation
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(function() {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Navigation items animation
    const navItems = document.querySelectorAll('.nav-menu a');
    navItems.forEach(function(item, index) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        item.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
        
        setTimeout(function() {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 500 + (index * 100));
    });
    
    console.log('✅ DOM initialization complete');
});