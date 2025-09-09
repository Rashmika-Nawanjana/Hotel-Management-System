// Registration page functionality
document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 3;

    // Initialize form
    initializeForm();
    
    // Set age restrictions for date of birth
    setDateRestrictions();
    
    // Password strength checker
    initializePasswordStrength();
    
    // Phone number formatting
    initializePhoneFormatting();
    
    // Form validation
    initializeValidation();
});

function initializeForm() {
    // Show first step
    showStep(1);
    
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordField = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // Form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateCurrentStep() && validateAllSteps()) {
                submitRegistration(this);
            }
        });
    }
}

function setDateRestrictions() {
    const dobInput = document.getElementById('dateOfBirth');
    if (dobInput) {
        // Set maximum date to 18 years ago
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        
        dobInput.max = maxDate.toISOString().split('T')[0];
        dobInput.min = minDate.toISOString().split('T')[0];
    }
}

function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            validatePasswordMatch();
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text span');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Set strength level and color
    const strengthLevels = [
        { level: 'Very Weak', color: '#dc3545', width: '20%' },
        { level: 'Weak', color: '#fd7e14', width: '40%' },
        { level: 'Fair', color: '#ffc107', width: '60%' },
        { level: 'Good', color: '#20c997', width: '80%' },
        { level: 'Strong', color: '#198754', width: '100%' },
        { level: 'Very Strong', color: '#0d6efd', width: '100%' }
    ];
    
    const currentStrength = strengthLevels[Math.min(strength, 5)];
    
    strengthBar.style.width = currentStrength.width;
    strengthBar.style.backgroundColor = currentStrength.color;
    strengthText.textContent = currentStrength.level;
    strengthText.style.color = currentStrength.color;
}

function validatePasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (password && confirmPassword && confirmPassword.value) {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Passwords do not match');
            confirmPassword.classList.add('is-invalid');
        } else {
            confirmPassword.setCustomValidity('');
            confirmPassword.classList.remove('is-invalid');
            confirmPassword.classList.add('is-valid');
        }
    }
}

function initializePhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Remove any non-digit characters
            let value = this.value.replace(/\D/g, '');
            
            // Format based on selected country code
            const countryCode = document.getElementById('countryCode').value;
            if (countryCode === '+94') {
                // Sri Lankan format: 771234567
                if (value.length > 9) {
                    value = value.substring(0, 9);
                }
            }
            
            this.value = value;
        });
    }
}

function initializeValidation() {
    // Real-time validation for all inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
    
    // Email uniqueness check (simulated)
    const emailInput = document.getElementById('email');
    if (emailInput) {
        let emailTimeout;
        emailInput.addEventListener('input', function() {
            clearTimeout(emailTimeout);
            emailTimeout = setTimeout(() => {
                checkEmailAvailability(this.value);
            }, 1000);
        });
    }
}

function validateField(field) {
    if (field.checkValidity()) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        return true;
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        return false;
    }
}

function checkEmailAvailability(email) {
    if (!email || !email.includes('@')) return;
    
    // Simulate API call to check email uniqueness
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        const existingEmails = ['test@example.com', 'admin@skynest.lk']; // Mock existing emails
        
        if (existingEmails.includes(email.toLowerCase())) {
            emailInput.setCustomValidity('This email is already registered');
            emailInput.classList.add('is-invalid');
            showToast('Email already exists. Please use a different email or sign in.', 'warning');
        } else {
            emailInput.setCustomValidity('');
            if (emailInput.checkValidity()) {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
            }
        }
    }, 500);
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 3) {
            currentStep++;
            showStep(currentStep);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.registration-step').forEach(stepDiv => {
        stepDiv.classList.remove('active');
    });
    
    // Show current step
    const currentStepDiv = document.querySelector(`[data-step="${step}"]`);
    if (currentStepDiv) {
        currentStepDiv.classList.add('active');
    }
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((stepIndicator, index) => {
        stepIndicator.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepIndicator.classList.add('completed');
        } else if (index + 1 === step) {
            stepIndicator.classList.add('active');
        }
    });
    
    // Focus first input in current step
    setTimeout(() => {
        const firstInput = currentStepDiv.querySelector('input, select');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function validateCurrentStep() {
    const currentStepDiv = document.querySelector(`.registration-step[data-step="${currentStep}"]`);
    const inputs = currentStepDiv.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Additional validation for specific steps
    if (currentStep === 1) {
        // Check age requirement
        const dobInput = document.getElementById('dateOfBirth');
        if (dobInput.value) {
            const birthDate = new Date(dobInput.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (age < 18) {
                dobInput.setCustomValidity('You must be at least 18 years old');
                validateField(dobInput);
                isValid = false;
            } else {
                dobInput.setCustomValidity('');
                validateField(dobInput);
            }
        }
    }
    
    if (currentStep === 2) {
        // Password validation
        const password = document.getElementById('password').value;
        if (password.length < 8) {
            showToast('Password must be at least 8 characters long', 'warning');
            isValid = false;
        }
        
        // Password match validation
        validatePasswordMatch();
        if (document.getElementById('confirmPassword').classList.contains('is-invalid')) {
            isValid = false;
        }
    }
    
    if (!isValid) {
        showToast('Please fill in all required fields correctly', 'warning');
    }
    
    return isValid;
}

function validateAllSteps() {
    let isValid = true;
    
    // Check required checkboxes in step 3
    const requiredCheckboxes = ['agreeTerms', 'ageConfirmation'];
    requiredCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (!checkbox.checked) {
            checkbox.classList.add('is-invalid');
            isValid = false;
        } else {
            checkbox.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

function submitRegistration(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Add additional data
    data.registrationDate = new Date().toISOString();
    data.loyaltyPoints = data.loyaltyProgram ? 1000 : 0; // Welcome bonus
    
    // Simulate API call
    setTimeout(() => {
        // Mock registration success
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Account Created!';
        submitBtn.classList.replace('btn-success', 'btn-primary');
        
        showToast('Welcome to SkyNest Hotels! Your account has been created successfully.', 'success');
        
        // Show success modal
        showSuccessModal(data);
        
    }, 3000);
}

function showSuccessModal(userData) {
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>
                            Welcome to SkyNest Hotels!
                        </h5>
                    </div>
                    <div class="modal-body text-center p-5">
                        <div class="success-icon mb-4">
                            <i class="fas fa-user-check text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="fw-bold mb-3">Account Created Successfully!</h4>
                        <p class="lead mb-4">
                            Welcome, ${userData.firstName}! Your SkyNest Hotels account is now ready.
                        </p>
                        <div class="welcome-benefits bg-light rounded p-4 mb-4">
                            <h6 class="fw-bold mb-3">Your Account Benefits:</h6>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="benefit d-flex align-items-center">
                                        <i class="fas fa-gift text-warning me-2"></i>
                                        <span>1,000 Welcome Points</span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="benefit d-flex align-items-center">
                                        <i class="fas fa-percent text-success me-2"></i>
                                        <span>Member Discounts</span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="benefit d-flex align-items-center">
                                        <i class="fas fa-crown text-primary me-2"></i>
                                        <span>Priority Booking</span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="benefit d-flex align-items-center">
                                        <i class="fas fa-mobile-alt text-info me-2"></i>
                                        <span>Mobile Check-in</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="text-muted">
                            A confirmation email has been sent to <strong>${userData.email}</strong>
                        </p>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-success btn-lg px-4" onclick="redirectToLogin()">
                            <i class="fas fa-sign-in-alt me-2"></i>Sign In Now
                        </button>
                        <button type="button" class="btn btn-outline-primary btn-lg px-4" onclick="exploreRooms()">
                            <i class="fas fa-bed me-2"></i>Explore Rooms
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

function redirectToLogin() {
    window.location.href = '/auth/login';
}

function exploreRooms() {
    window.location.href = '/rooms';
}

// Social registration handlers
document.addEventListener('DOMContentLoaded', function() {
    const socialButtons = document.querySelectorAll('.social-register button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.textContent.trim().toLowerCase();
            handleSocialRegistration(provider);
        });
    });
});

function handleSocialRegistration(provider) {
    showToast(`Redirecting to ${provider} registration...`, 'info');
    
    setTimeout(() => {
        showToast(`${provider} registration is currently unavailable. Please use the standard form.`, 'warning');
    }, 1500);
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

    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        const nextButton = document.querySelector('.registration-step.active .btn-primary');
        if (nextButton) {
            nextButton.click();
        }
    }
});