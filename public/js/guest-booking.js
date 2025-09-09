// Guest Bookings functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize bookings page
    initializeBookingsPage();
    
    // Set up tab functionality
    setupTabFiltering();
    
    // Set up real-time updates
    setupRealTimeUpdates();
    
    // Set up mobile features
    setupMobileFeatures();
});

function initializeBookingsPage() {
    // Animate summary cards
    animateSummaryCards();
    
    // Set up booking interactions
    setupBookingInteractions();
    
    // Initialize countdown timers
    initializeCountdowns();
    
    // Set up filter functionality
    setupFilterFunctionality();
}

function animateSummaryCards() {
    const summaryCards = document.querySelectorAll('.summary-card');
    summaryCards.forEach((card, index) => {
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

    // Animate numbers in summary cards
    animateSummaryNumbers();
}

function animateSummaryNumbers() {
    const numberElements = document.querySelectorAll('.summary-number');
    
    numberElements.forEach(element => {
        const text = element.textContent;
        const target = parseInt(text.replace(/[^0-9]/g, '')) || 0;
        let current = 0;
        const increment = target / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = text;
                clearInterval(timer);
            } else {
                const value = Math.floor(current);
                if (text.includes('K')) {
                    element.textContent = value + 'K';
                } else {
                    element.textContent = value.toString();
                }
            }
        }, 50);
    });
}

function setupTabFiltering() {
    const tabs = document.querySelectorAll('#bookingTabs .nav-link');
    const bookingCards = document.querySelectorAll('.booking-card');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-bs-target');
            filterBookingsByTab(targetTab);
        });
    });
}

function filterBookingsByTab(tabId) {
    const bookingCards = document.querySelectorAll('.booking-card');
    
    // Hide all cards first
    bookingCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Show relevant cards based on tab
    setTimeout(() => {
        switch(tabId) {
            case '#all-bookings':
                bookingCards.forEach(card => {
                    card.style.display = 'block';
                });
                break;
            case '#upcoming-bookings':
                document.querySelectorAll('.upcoming-booking').forEach(card => {
                    card.style.display = 'block';
                });
                break;
            case '#current-bookings':
                document.querySelectorAll('.current-booking').forEach(card => {
                    card.style.display = 'block';
                });
                break;
            case '#completed-bookings':
                document.querySelectorAll('.past-booking').forEach(card => {
                    card.style.display = 'block';
                });
                break;
        }
    }, 150);
}

function setupBookingInteractions() {
    // Set up booking card hover effects
    const bookingCards = document.querySelectorAll('.booking-card');
    bookingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        });
    });
}

function initializeCountdowns() {
    // Initialize countdown timers for upcoming bookings
    const countdownElements = document.querySelectorAll('.countdown-text');
    
    countdownElements.forEach(element => {
        // This would normally calculate from actual dates
        // For demo, we're showing static text
        updateCountdown(element);
    });
}

function updateCountdown(element) {
    // Mock countdown logic
    // In real implementation, calculate from booking date
    const messages = [
        'Check-in in 5 days',
        'Check-in in 4 days, 12 hours',
        'Check-in tomorrow',
        'Check-in today'
    ];
    
    // Simulate countdown update
    setInterval(() => {
        if (Math.random() > 0.98) {
            const currentText = element.textContent;
            const currentIndex = messages.indexOf(currentText);
            if (currentIndex < messages.length - 1) {
                element.textContent = messages[currentIndex + 1];
                element.style.color = '#28a745';
                element.style.fontWeight = 'bold';
            }
        }
    }, 5000);
}

function setupRealTimeUpdates() {
    // Simulate real-time booking status updates
    setInterval(() => {
        updateBookingStatuses();
    }, 30000);
    
    // Check for new notifications
    setInterval(() => {
        checkForUpdates();
    }, 60000);
}

function updateBookingStatuses() {
    const statusBadges = document.querySelectorAll('.booking-status-badge');
    
    statusBadges.forEach(badge => {
        if (Math.random() > 0.95) {
            if (badge.textContent.includes('Pending')) {
                badge.innerHTML = '<i class="fas fa-check-circle me-1"></i>Confirmed';
                badge.className = 'booking-status-badge status-confirmed';
                showToast('Booking confirmed! Check your email for details.', 'success');
            }
        }
    });
}

function checkForUpdates() {
    // Simulate checking for booking updates
    if (Math.random() > 0.97) {
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            const currentCount = parseInt(notificationBadge.textContent);
            notificationBadge.textContent = currentCount + 1;
            showToast('You have a new booking update!', 'info');
        }
    }
}

function setupFilterFunctionality() {
    // Set date restrictions for filter
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('#filterForm input[type="date"]');
    
    dateInputs.forEach(input => {
        input.max = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    });
}

function setupMobileFeatures() {
    // Mobile swipe gestures for booking cards
    let startX = 0;
    let currentX = 0;
    
    const bookingCards = document.querySelectorAll('.booking-card');
    
    bookingCards.forEach(card => {
        card.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        card.addEventListener('touchmove', function(e) {
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            if (Math.abs(diffX) > 10) {
                e.preventDefault();
            }
        });
        
        card.addEventListener('touchend', function(e) {
            const diffX = currentX - startX;
            
            if (diffX > 100) {
                // Swipe right - show quick actions
                showQuickActions(this);
            } else if (diffX < -100) {
                // Swipe left - show booking details
                const bookingId = this.getAttribute('data-booking-id');
                viewBookingDetails(bookingId);
            }
        });
    });
}

// Booking action functions
function checkIn(bookingId) {
    const confirmModal = createConfirmModal(
        'Mobile Check-in',
        'Ready to check in? We\'ll send your digital room key and check-in details.',
        () => {
            showToast('Check-in successful! Digital key sent to your phone.', 'success');
            updateBookingStatus(bookingId, 'current', 'Current Stay');
        }
    );
    
    document.body.appendChild(confirmModal);
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
}

function checkOut(bookingId) {
    const confirmModal = createConfirmModal(
        'Check Out',
        'Are you ready to check out? We\'ll prepare your final bill and arrange any needed assistance.',
        () => {
            showToast('Check-out initiated! Thank you for staying with us.', 'success');
            updateBookingStatus(bookingId, 'completed', 'Completed');
        }
    );
    
    document.body.appendChild(confirmModal);
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
}

function extendStay(bookingId) {
    showToast('Redirecting to extend your stay...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/extend-booking/${bookingId}`;
    }, 1000);
}

function modifyBooking(bookingId) {
    showToast('Opening booking modification...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/modify-booking/${bookingId}`;
    }, 1000);
}

function cancelBooking(bookingId) {
    const confirmModal = createConfirmModal(
        'Cancel Booking',
        'Are you sure you want to cancel this booking? Cancellation fees may apply.',
        () => {
            showToast('Booking cancellation initiated. You\'ll receive confirmation shortly.', 'warning');
            updateBookingStatus(bookingId, 'cancelled', 'Cancelled');
        }
    );
    
    document.body.appendChild(confirmModal);
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
}

function makePayment(bookingId) {
    showToast('Redirecting to secure payment...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/payment/${bookingId}`;
    }, 1000);
}

function requestService(bookingId) {
    showToast('Opening service request for your current stay...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/services?booking=${bookingId}`;
    }, 1000);
}

function viewBookingDetails(bookingId) {
    showToast('Loading booking details...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/booking/${bookingId}`;
    }, 1000);
}

function viewReceipt(bookingId) {
    showToast('Generating receipt...', 'info');
    setTimeout(() => {
        // Simulate opening receipt
        window.open(`/guest/receipt/${bookingId}`, '_blank');
    }, 1000);
}

function downloadInvoice(bookingId) {
    showToast('Downloading invoice...', 'info');
    setTimeout(() => {
        // Simulate download
        const link = document.createElement('a');
        link.href = `/guest/invoice/${bookingId}`;
        link.download = `SkyNest-Invoice-${bookingId}.pdf`;
        link.click();
    }, 1000);
}

function bookAgain(bookingId) {
    showToast('Creating new booking based on your previous stay...', 'info');
    setTimeout(() => {
        window.location.href = `/guest/book-again/${bookingId}`;
    }, 1000);
}

function contactSupport(bookingId) {
    showToast('Connecting you with customer support...', 'info');
    setTimeout(() => {
        window.location.href = `/contact?booking=${bookingId}`;
    }, 1000);
}

// Filter functions
function applyFilters() {
    const form = document.getElementById('filterForm');
    const formData = new FormData(form);
    const filters = Object.fromEntries(formData);
    
    // Apply filters to visible bookings
    const bookingCards = document.querySelectorAll('.booking-card');
    let visibleCount = 0;
    
    bookingCards.forEach(card => {
        let shouldShow = true;
        
        // Apply location filter
        if (filters.location) {
            const hotelName = card.querySelector('.hotel-name').textContent.toLowerCase();
            if (!hotelName.includes(filters.location)) {
                shouldShow = false;
            }
        }
        
        // Apply status filter
        if (filters.status) {
            const statusBadge = card.querySelector('.booking-status-badge').textContent.toLowerCase();
            if (!statusBadge.includes(filters.status)) {
                shouldShow = false;
            }
        }
        
        // Apply price filter
        if (filters.minPrice || filters.maxPrice) {
            const amount = parseInt(card.querySelector('.amount').textContent.replace(/[^\d]/g, ''));
            if (filters.minPrice && amount < parseInt(filters.minPrice)) {
                shouldShow = false;
            }
            if (filters.maxPrice && amount > parseInt(filters.maxPrice)) {
                shouldShow = false;
            }
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    modal.hide();
    
    showToast(`Showing ${visibleCount} booking(s) matching your filters`, 'info');
}

function clearFilters() {
    const form = document.getElementById('filterForm');
    form.reset();
    
    // Show all bookings
    const bookingCards = document.querySelectorAll('.booking-card');
    bookingCards.forEach(card => {
        card.style.display = 'block';
    });
    
    showToast('Filters cleared', 'info');
}

// Utility functions
function updateBookingStatus(bookingId, newStatus, statusText) {
    const bookingCard = document.querySelector(`[data-booking-id="${bookingId}"]`);
    if (bookingCard) {
        const statusBadge = bookingCard.querySelector('.booking-status-badge');
        statusBadge.textContent = statusText;
        statusBadge.className = `booking-status-badge status-${newStatus}`;
        
        // Update booking actions based on new status
        updateBookingActions(bookingCard, newStatus);
    }
}

function updateBookingActions(bookingCard, status) {
    const actionsHeader = bookingCard.querySelector('.booking-actions-header');
    
    switch(status) {
        case 'current':
            actionsHeader.innerHTML = `
                <button class="btn btn-sm btn-success" onclick="extendStay('${bookingCard.dataset.bookingId}')">
                    <i class="fas fa-plus me-1"></i>Extend
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="checkOut('${bookingCard.dataset.bookingId}')">
                    <i class="fas fa-sign-out-alt me-1"></i>Check Out
                </button>
            `;
            break;
        case 'completed':
            actionsHeader.innerHTML = `
                <div class="rating-display">
                    <span class="rating-stars">★★★★★</span>
                    <span class="rating-text">Rate Stay</span>
                </div>
            `;
            break;
    }
}

function showQuickActions(bookingCard) {
    const bookingId = bookingCard.getAttribute('data-booking-id');
    const quickActionsHtml = `
        <div class="quick-actions-overlay">
            <button class="btn btn-primary" onclick="viewBookingDetails('${bookingId}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-success" onclick="requestService('${bookingId}')">
                <i class="fas fa-concierge-bell"></i>
            </button>
            <button class="btn btn-warning" onclick="modifyBooking('${bookingId}')">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `;
    
    bookingCard.insertAdjacentHTML('beforeend', quickActionsHtml);
    
    setTimeout(() => {
        const overlay = bookingCard.querySelector('.quick-actions-overlay');
        if (overlay) {
            overlay.remove();
        }
    }, 3000);
}

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