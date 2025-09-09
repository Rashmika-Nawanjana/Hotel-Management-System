// Services page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryFilters = document.querySelectorAll('.category-filter');
    const serviceItems = document.querySelectorAll('.service-item');
    const serviceCards = document.querySelectorAll('.service-card');

    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Update active button
            categoryFilters.forEach(f => {
                f.classList.remove('active', 'btn-primary');
                f.classList.add('btn-outline-primary');
            });
            
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary', 'active');

            // Filter services
            const category = this.dataset.category;
            filterServices(category);
        });
    });

    function filterServices(category) {
        serviceItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                item.classList.add('fade-in-up');
            } else {
                item.style.display = 'none';
            }
        });

        serviceCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                card.classList.add('fade-in-up');
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Service request form
    const serviceRequestForm = document.getElementById('serviceRequestForm');
    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                showToast('Service request submitted successfully!', 'success');
                this.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Set minimum date to today for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.min = today;
        if (!input.value) {
            input.value = today;
        }
    });
});

// Service interaction functions
function requestService(serviceType) {
    // Check if user is logged in
    const isLoggedIn = false; // This would come from server-side data
    
    if (!isLoggedIn) {
        showToast('Please login to request services', 'warning');
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 1500);
    } else {
        showServiceModal(serviceType);
    }
}

function requestPackage(packageType) {
    // Check if user is logged in
    const isLoggedIn = false; // This would come from server-side data
    
    if (!isLoggedIn) {
        showToast('Please login to select packages', 'warning');
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 1500);
    } else {
        showPackageModal(packageType);
    }
}

function showServiceModal(serviceType) {
    // Create and show service booking modal
    const modalHtml = `
        <div class="modal fade" id="serviceModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Book ${serviceType} Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="quickServiceForm">
                            <div class="mb-3">
                                <label class="form-label">Preferred Date</label>
                                <input type="date" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Preferred Time</label>
                                <input type="time" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Special Requests</label>
                                <textarea class="form-control" rows="3" placeholder="Any special requirements..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="confirmServiceBooking()">Confirm Booking</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page and show
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();

    // Remove modal when hidden
    document.getElementById('serviceModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function showPackageModal(packageType) {
    // Create and show package booking modal
    const packages = {
        business: {
            title: 'Business Traveler Package',
            price: 'LKR 15,000',
            description: 'Complete business travel solution'
        },
        wellness: {
            title: 'Wellness Retreat Package',
            price: 'LKR 25,000',
            description: 'Total wellness and relaxation experience'
        },
        family: {
            title: 'Family Fun Package',
            price: 'LKR 20,000',
            description: 'Entertainment and activities for the whole family'
        }
    };

    const pkg = packages[packageType];
    
    const modalHtml = `
        <div class="modal fade" id="packageModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${pkg.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <div class="h4 text-primary">${pkg.price}</div>
                            <p class="text-muted">${pkg.description}</p>
                        </div>
                        <form id="packageBookingForm">
                            <div class="mb-3">
                                <label class="form-label">Start Date</label>
                                <input type="date" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Number of Days</label>
                                <select class="form-select" required>
                                    <option value="">Select Duration</option>
                                    <option value="1">1 Day</option>
                                    <option value="2">2 Days</option>
                                    <option value="3">3 Days</option>
                                    <option value="7">1 Week</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Additional Notes</label>
                                <textarea class="form-control" rows="3" placeholder="Any special requirements..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="confirmPackageBooking()">Book Package</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page and show
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('packageModal'));
    modal.show();

    // Set minimum date
    const dateInput = document.querySelector('#packageModal input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Remove modal when hidden
    document.getElementById('packageModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function confirmServiceBooking() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
    modal.hide();
    showToast('Service booking confirmed! We will contact you shortly.', 'success');
}

function confirmPackageBooking() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('packageModal'));
    modal.hide();
    showToast('Package booking confirmed! Check your email for details.', 'success');
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