// Authentication page functionality
document.addEventListener('DOMContentLoaded', function() {
    // User type toggle functionality
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const guestForm = document.getElementById('guestLoginForm');
    const adminForm = document.getElementById('adminLoginForm');

    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'guest') {
                guestForm.classList.remove('d-none');
                adminForm.classList.add('d-none');
            } else {
                guestForm.classList.add('d-none');
                adminForm.classList.remove('d-none');
            }
        });
    });

    // Password toggle functionality
    const toggleButtons = document.querySelectorAll('[id^="toggle"][id$="Password"]');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.id.replace('toggle', '').replace('Password', 'Password').toLowerCase();
            const passwordField = document.getElementById(targetId === 'guestpassword' ? 'guestPassword' : 'adminPassword');
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Form validation and submission
    const guestFormElement = document.getElementById('guestForm');
    const adminFormElement = document.getElementById('adminForm');

    if (guestFormElement) {
        guestFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            if (this.checkValidity()) {
                submitLoginForm(this, 'guest');
            } else {
                this.classList.add('was-validated');
            }
        });
    }

    if (adminFormElement) {
        adminFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            if (this.checkValidity()) {
                submitLoginForm(this, 'admin');
            } else {
                this.classList.add('was-validated');
            }
        });
    }

    // Real-time validation
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });

    // Email/Phone validation for guest login
    const guestEmailInput = document.getElementById('guestEmail');
    if (guestEmailInput) {
        guestEmailInput.addEventListener('input', function() {
            const value = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+94\d{9}$/;
            
            if (emailRegex.test(value) || phoneRegex.test(value)) {
                this.setCustomValidity('');
            } else {
                this.setCustomValidity('Please enter a valid email address or phone number in format +94XXXXXXXXX');
            }
        });
    }

    // Staff ID formatting
    const staffIdInput = document.getElementById('staffId');
    if (staffIdInput) {
        staffIdInput.addEventListener('input', function() {
            let value = this.value.toUpperCase();
            // Remove any non-alphanumeric characters
            value = value.replace(/[^A-Z0-9]/g, '');
            this.value = value;
        });
    }

    // Social login handlers
    const socialButtons = document.querySelectorAll('.social-login button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.textContent.trim().toLowerCase();
            handleSocialLogin(provider);
        });
    });

    // Auto-focus first input
    setTimeout(() => {
        const firstInput = document.querySelector('.login-form:not(.d-none) input:first-of-type');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
});

// Submit login form
function submitLoginForm(form, userType) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.userType = userType;
    
    // Simulate API call
    setTimeout(() => {
        // Mock authentication logic
        const isValid = validateCredentials(data, userType);
        
        if (isValid) {
            // Success
            submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Success!';
            submitBtn.classList.replace('btn-primary', 'btn-success');
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (userType === 'guest') {
                    window.location.href = '/guest/dashboard';
                } else {
                    window.location.href = '/admin/dashboard';
                }
            }, 1500);
        } else {
            // Error
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            showToast('Invalid credentials. Please try again.', 'error');
            
            // Shake animation
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }
    }, 2000);
}

// Mock credential validation
function validateCredentials(data, userType) {
    if (userType === 'guest') {
        // Mock guest credentials
        const validGuests = [
            { email: 'guest@example.com', password: 'password123' },
            { email: '+94771234567', password: 'password123' }
        ];
        return validGuests.some(guest => 
            guest.email === data.email && guest.password === data.password
        );
    } else {
        // Mock admin credentials
        const validStaff = [
            { staffId: 'SKY001', password: 'admin123', department: 'management' },
            { staffId: 'SKY002', password: 'front123', department: 'front-desk' }
        ];
        return validStaff.some(staff => 
            staff.staffId === data.staffId && 
            staff.password === data.password && 
            staff.department === data.department
        );
    }
}

// Handle social login
function handleSocialLogin(provider) {
    showToast(`Redirecting to ${provider} login...`, 'info');
    
    // Simulate social login redirect
    setTimeout(() => {
        // In real implementation, this would redirect to OAuth provider
        console.log(`Social login with ${provider}`);
        showToast(`${provider} login is currently unavailable. Please use email/password.`, 'warning');
    }, 1000);
}

// Send password reset link
function sendResetLink() {
    const resetForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('resetEmail');
    const userTypeInput = document.getElementById('userTypeReset');
    
    if (!emailInput.value || !userTypeInput.value) {
        showToast('Please fill in all required fields.', 'warning');
        return;
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
    const button = event.target;
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        modal.hide();
        
        showToast('Password reset link sent to your email address.', 'success');
        resetForm.reset();
    }, 2000);
}

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
    const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
    bsToast.show();
    
    // Remove after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + G for guest login
    if (e.altKey && e.key === 'g') {
        e.preventDefault();
        document.getElementById('guestLogin').click();
    }
    
    // Alt + A for admin login
    if (e.altKey && e.key === 'a') {
        e.preventDefault();
        document.getElementById('adminLogin').click();
    }
    
    // Ctrl + Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const visibleForm = document.querySelector('.login-form:not(.d-none) form');
        if (visibleForm) {
            visibleForm.querySelector('button[type="submit"]').click();
        }
    }
});

// Security features
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Start idle timer when tab becomes hidden
        startIdleTimer();
    } else {
        // Clear idle timer when tab becomes visible
        clearIdleTimer();
    }
});

let idleTimer;

function startIdleTimer() {
    idleTimer = setTimeout(() => {
        showToast('Session will expire soon due to inactivity.', 'warning');
    }, 25 * 60 * 1000); // 25 minutes
}

function clearIdleTimer() {
    if (idleTimer) {
        clearTimeout(idleTimer);
    }
}

// Prevent form resubmission on page refresh
window.addEventListener('beforeunload', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
});