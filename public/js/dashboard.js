// Guest Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Set up quick booking form
    setupQuickBooking();
    
    // Set up notification handling
    setupNotifications();
    
    // Set up mobile responsiveness
    setupMobileFeatures();
});

function initializeDashboard() {
    // Animate stat cards on load
    animateStatCards();
    
    // Set up sidebar navigation
    setupSidebarNavigation();
    
    // Set up real-time updates
    setupRealTimeUpdates();
    
    // Set up date restrictions for quick booking
    setupDateRestrictions();
}

function animateStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 150);
    });

    // Animate numbers
    animateNumbers();
}

function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-number');
    
    numberElements.forEach(element => {
        const target = parseInt(element.textContent.replace(/,/g, ''));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 50);
    });
}

function setupSidebarNavigation() {
    // Mobile sidebar toggle
    const toggleButton = document.querySelector('.navbar-toggler');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Active navigation highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupQuickBooking() {
    const quickBookingForm = document.getElementById('quickBookingForm');
    if (!quickBookingForm) return;

    // Set minimum dates
    const checkinInput = quickBookingForm.querySelector('input[name="checkin"]');
    const checkoutInput = quickBookingForm.querySelector('input[name="checkout"]');
    
    const today = new Date().toISOString().split('T')[0];
    if (checkinInput) {
        checkinInput.min = today;
        checkinInput.addEventListener('change', function() {
            const checkinDate = new Date(this.value);
            checkinDate.setDate(checkinDate.getDate() + 1);
            if (checkoutInput) {
                checkoutInput.min = checkinDate.toISOString().split('T')[0];
            }
        });
    }
}

function processQuickBooking() {
    const form = document.getElementById('quickBookingForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate form
    const requiredFields = ['location', 'roomType', 'checkin', 'checkout', 'adults'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    // Validate dates
    const checkinDate = new Date(data.checkin);
    const checkoutDate = new Date(data.checkout);
    
    if (checkoutDate <= checkinDate) {
        showToast('Check-out date must be after check-in date', 'warning');
        return;
    }
    
    // Show loading
    const submitBtn = event.target;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Searching...';
    submitBtn.disabled = true;
    
    // Simulate search
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Close modal and redirect
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickBookingModal'));
        modal.hide();
        
        // Build search URL
        const params = new URLSearchParams(data);
        window.location.href = `/guest/search-results?${params.toString()}`;
        
        showToast('Searching for available rooms...', 'info');
    }, 2000);
}

function setupNotifications() {
    // Mark notifications as read when dropdown opens
    const notificationDropdown = document.getElementById('notificationDropdown');
    if (notificationDropdown) {
        notificationDropdown.addEventListener('show.bs.dropdown', function() {
            // Simulate marking as read
            setTimeout(() => {
                const badge = this.querySelector('.notification-badge');
                if (badge) {
                    badge.style.opacity = '0.5';
                }
            }, 1000);
        });
    }
    
    // Auto-refresh notifications every 5 minutes
    setInterval(refreshNotifications, 5 * 60 * 1000);
}

function refreshNotifications() {
    // Simulate fetching new notifications
    console.log('Refreshing notifications...');
    
    // In a real app, this would make an API call
    // For demo, we'll just update the badge occasionally
    const badge = document.querySelector('.notification-badge');
    if (badge && Math.random() > 0.7) {
        const currentCount = parseInt(badge.textContent);
        badge.textContent = currentCount + 1;
        badge.style.animation = 'pulse 0.5s ease';
    }
}

function setupRealTimeUpdates() {
    // Simulate real-time updates for bookings
    setInterval(() => {
        updateBookingStatuses();
    }, 30000); // Check every 30 seconds
    
    // Update loyalty points display
    setInterval(() => {
        updateLoyaltyPoints();
    }, 60000); // Check every minute
}

function updateBookingStatuses() {
    // In a real app, this would check for booking updates
    const statusBadges = document.querySelectorAll('.status-badge');
    statusBadges.forEach(badge => {
        // Simulate status changes
        if (Math.random() > 0.95) {
            if (badge.textContent === 'Confirmed') {
                badge.textContent = 'Ready for Check-in';
                badge.className = 'status-badge status-ready';
                showToast('Your room is ready for check-in!', 'success');
            }
        }
    });
}

function updateLoyaltyPoints() {
    // Simulate earning new points
    if (Math.random() > 0.98) {
        const pointsElement = document.querySelector('.stat-card .stat-number');
        if (pointsElement && pointsElement.textContent === '2,450') {
            pointsElement.textContent = '2,470';
            showToast('You earned 20 loyalty points!', 'success');
        }
    }
}

function setupDateRestrictions() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });
}

function setupMobileFeatures() {
    // Mobile bottom navigation highlighting
    const bottomNavLinks = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    const currentPath = window.location.pathname;
    
    bottomNavLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Handle mobile sidebar overlay
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        mainContent.addEventListener('click', function() {
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// Booking action functions
function viewBooking(bookingId) {
    showToast('Opening booking details...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/booking/${bookingId}`;
    }, 1000);
}

function checkIn(bookingId) {
    const confirmModal = createConfirmModal(
        'Mobile Check-in',
        'Are you ready to check in to your room? We\'ll send you digital keys and room details.',
        () => {
            showToast('Check-in initiated! You\'ll receive digital keys shortly.', 'success');
            // Update booking status
            const statusBadge = event.target.closest('.booking-item').querySelector('.status-badge');
            statusBadge.textContent = 'Checked In';
            statusBadge.className = 'status-badge status-checkedin';
        }
    );
    
    document.body.appendChild(confirmModal);
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
}

function modifyBooking(bookingId) {
    showToast('Redirecting to booking modification...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/modify-booking/${bookingId}`;
    }, 1000);
}

// Utility functions
function createConfirmModal(title, message, onConfirm) {
    const modalHtml = `
        <div class="modal fade" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary confirm-btn">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    const modal = modalElement.firstElementChild;
    
    modal.querySelector('.confirm-btn').addEventListener('click', function() {
        onConfirm();
        bootstrap.Modal.getInstance(modal).hide();
    });
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
    
    return modal;
}

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

// Recommendation actions
document.addEventListener('click', function(e) {
    if (e.target.closest('.recommendation-card button')) {
        const button = e.target.closest('button');
        const card = button.closest('.recommendation-card');
        const title = card.querySelector('h6').textContent;
        
        showToast(`Redirecting to ${title}...`, 'info');
        
        // Simulate redirect delay
        setTimeout(() => {
            if (title.includes('Spa')) {
                window.location.href = '/guest/services?category=spa';
            } else if (title.includes('Dinner')) {
                window.location.href = '/guest/services?category=dining';
            } else if (title.includes('Tour')) {
                window.location.href = '/guest/services?category=tours';
            }
        }, 1000);
    }
});

// Auto-save user preferences
window.addEventListener('beforeunload', function() {
    const preferences = {
        sidebarCollapsed: document.querySelector('.sidebar')?.classList.contains('collapsed'),
        lastActivity: new Date().toISOString()
    };
    
    localStorage.setItem('guestDashboardPrefs', JSON.stringify(preferences));
});

// Load user preferences
document.addEventListener('DOMContentLoaded', function() {
    const savedPrefs = localStorage.getItem('guestDashboardPrefs');
    if (savedPrefs) {
        try {
            const preferences = JSON.parse(savedPrefs);
            if (preferences.sidebarCollapsed) {
                document.querySelector('.sidebar')?.classList.add('collapsed');
            }
        } catch (e) {
            console.log('Error loading preferences:', e);
        }
    }
});