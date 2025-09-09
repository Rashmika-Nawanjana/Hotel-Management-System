// Room filtering and interaction functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    const roomCards = document.querySelectorAll('.room-card');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            categoryButtons.forEach(b => b.classList.remove('active', 'btn-primary'));
            categoryButtons.forEach(b => b.classList.add('btn-outline-primary'));
            
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary', 'active');

            // Filter rooms
            const category = this.dataset.category;
            filterRooms(category);
        });
    });

    function filterRooms(category) {
        roomCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                card.classList.add('fade-in-up');
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Heart/Favorite functionality
    const heartButtons = document.querySelectorAll('.fa-heart');
    heartButtons.forEach(heart => {
        heart.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            heart.classList.toggle('text-danger');
            heart.classList.toggle('text-muted');
            
            // Show feedback
            const feedback = heart.classList.contains('text-danger') ? 'Added to favorites' : 'Removed from favorites';
            showToast(feedback);
        });
    });

    // Load more functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more rooms
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check me-2"></i>All Rooms Loaded';
                this.disabled = true;
                this.classList.replace('btn-outline-primary', 'btn-success');
            }, 1500);
        });
    }
});

// Room interaction functions
function viewRoomDetails(roomId) {
    // Simulate viewing room details
    showToast('Opening room details...');
    setTimeout(() => {
        window.location.href = `/rooms/${roomId}`;
    }, 1000);
}

function bookRoom(roomId) {
    // Check if user is logged in
    const isLoggedIn = false; // This would come from server-side data
    
    if (!isLoggedIn) {
        showToast('Please login to book a room');
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 1500);
    } else {
        showToast('Redirecting to booking...');
        setTimeout(() => {
            window.location.href = `/book?room=${roomId}`;
        }, 1000);
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
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

// Date validation for availability modal
const availabilityModal = document.getElementById('availabilityModal');
if (availabilityModal) {
    availabilityModal.addEventListener('shown.bs.modal', function() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const checkinInput = this.querySelector('input[type="date"]');
        if (checkinInput) {
            checkinInput.min = today;
            checkinInput.value = today;
        }
        
        // Set checkout minimum to tomorrow
        const checkoutInput = this.querySelectorAll('input[type="date"]')[1];
        if (checkoutInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            checkoutInput.min = tomorrow.toISOString().split('T')[0];
            checkoutInput.value = tomorrow.toISOString().split('T')[0];
        }
    });
}