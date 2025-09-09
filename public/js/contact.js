// Contact page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (this.checkValidity()) {
                submitContactForm(this);
            } else {
                this.classList.add('was-validated');
            }
        });

        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('94')) {
                value = '+' + value;
            } else if (value.startsWith('0')) {
                value = '+94 ' + value.substring(1);
            } else if (value.length > 0) {
                value = '+94 ' + value;
            }
            e.target.value = value;
        });
    }

    // Auto-resize textarea
    const textarea = document.getElementById('message');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    // Quick contact card animations
    const quickContactCards = document.querySelectorAll('.quick-contact-card');
    quickContactCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Location card interactions
    const locationCards = document.querySelectorAll('.location-card');
    locationCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Submit contact form
function submitContactForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Simulate API call
    setTimeout(() => {
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showToast('Thank you! Your message has been sent successfully. We\'ll get back to you within 2 hours.', 'success');
        
        // Reset validation classes
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
    }, 2000);
}

// Location-specific functions
function getDirections(location) {
    const addresses = {
        colombo: '123 Galle Road, Colombo 03, Sri Lanka',
        kandy: '456 Peradeniya Road, Kandy, Sri Lanka',
        galle: '789 Matara Road, Galle, Sri Lanka'
    };
    
    const address = addresses[location];
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    
    window.open(mapsUrl, '_blank');
    showToast(`Opening directions to SkyNest ${location.charAt(0).toUpperCase() + location.slice(1)}`, 'info');
}

function callLocation(location) {
    const phones = {
        colombo: '+94111234567',
        kandy: '+94811234567',
        galle: '+94911234567'
    };
    
    const phone = phones[location];
    window.location.href = `tel:${phone}`;
    showToast(`Calling SkyNest ${location.charAt(0).toUpperCase() + location.slice(1)}`, 'info');
}

// Newsletter subscription
function subscribeNewsletter() {
    const emailInput = document.querySelector('footer input[type="email"]');
    const subscribeBtn = document.querySelector('footer button');
    
    if (emailInput && emailInput.value) {
        const originalText = subscribeBtn.innerHTML;
        subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        subscribeBtn.disabled = true;
        
        setTimeout(() => {
            subscribeBtn.innerHTML = originalText;
            subscribeBtn.disabled = false;
            emailInput.value = '';
            showToast('Successfully subscribed to our newsletter!', 'success');
        }, 1500);
    } else {
        showToast('Please enter a valid email address', 'warning');
    }
}

// Add newsletter subscription functionality
document.addEventListener('DOMContentLoaded', function() {
    const newsletterBtn = document.querySelector('footer button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', subscribeNewsletter);
    }
    
    const newsletterInput = document.querySelector('footer input[type="email"]');
    if (newsletterInput) {
        newsletterInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeNewsletter();
            }
        });
    }
});

// Toast notification function
function showToast(message, type = 'info') {
    const toastTypes = {
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-danger',
        info: 'bg-primary'
    };

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${toastTypes[type]} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times' : 'info'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    // Add to page
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

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

// Contact form character counter for message
document.addEventListener('DOMContentLoaded', function() {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const maxLength = 1000;
        
        // Create character counter
        const counter = document.createElement('small');
        counter.className = 'text-muted';
        counter.style.float = 'right';
        messageTextarea.parentNode.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - messageTextarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 50) {
                counter.className = 'text-warning';
            } else if (remaining < 0) {
                counter.className = 'text-danger';
            } else {
                counter.className = 'text-muted';
            }
        }
        
        messageTextarea.addEventListener('input', updateCounter);
        messageTextarea.setAttribute('maxlength', maxLength);
        updateCounter();
    }
});