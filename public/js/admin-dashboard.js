// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Set up real-time updates
    setupRealTimeUpdates();
    
    // Initialize charts
    initializeCharts();
    
    // Set up operation view switching
    setupOperationViews();
    
    // Set up hotel selector
    setupHotelSelector();
});

function initializeDashboard() {
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Animate metrics on load
    animateMetrics();
    
    // Set up notification polling
    pollNotifications();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
}

function updateCurrentTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.querySelector('.current-date');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function animateMetrics() {
    const metricNumbers = document.querySelectorAll('.metric-number');
    
    metricNumbers.forEach(element => {
        const finalText = element.textContent;
        element.textContent = '0';
        
        // Extract number and suffix
        const match = finalText.match(/^(\d+(?:\.\d+)?)(.*)/);
        if (!match) return;
        
        const target = parseFloat(match[1]);
        const suffix = match[2];
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = finalText;
                clearInterval(timer);
            } else {
                element.textContent = current.toFixed(1) + suffix;
            }
        }, duration / steps);
    });
}

function setupRealTimeUpdates() {
    // Update metrics every 30 seconds
    setInterval(updateMetrics, 30000);
    
    // Update activity feed every 60 seconds
    setInterval(updateActivityFeed, 60000);
    
    // Update system status every 2 minutes
    setInterval(updateSystemStatus, 120000);
    
    // Update charts every 5 minutes
    setInterval(updateChartData, 300000);
}

function updateMetrics() {
    // Simulate real-time metric updates
    const metrics = [
        { selector: '.occupancy .metric-number', range: [80, 95], suffix: '%' },
        { selector: '.revenue .metric-number', range: [1.8, 2.5], suffix: 'M' },
        { selector: '.guests .metric-number', range: [140, 170], suffix: '' },
        { selector: '.satisfaction .metric-number', range: [4.5, 5.0], suffix: '' }
    ];
    
    metrics.forEach(metric => {
        const element = document.querySelector(metric.selector);
        if (element && Math.random() > 0.7) { // 30% chance to update
            const newValue = (Math.random() * (metric.range[1] - metric.range[0]) + metric.range[0]).toFixed(1);
            element.textContent = newValue + metric.suffix;
            
            // Add pulse animation
            element.style.animation = 'metricPulse 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    });
}

function updateActivityFeed() {
    const activities = [
        {
            time: 'Just now',
            icon: 'fas fa-concierge-bell',
            iconClass: 'bg-info',
            title: 'Room Service Request',
            description: 'Room 234 - Coffee and pastries'
        },
        {
            time: '3 min ago',
            icon: 'fas fa-key',
            iconClass: 'bg-success',
            title: 'Guest Check-in',
            description: 'Room 156 - Maria Rodriguez'
        },
        {
            time: '8 min ago',
            icon: 'fas fa-credit-card',
            iconClass: 'bg-primary',
            title: 'Payment Processed',
            description: 'Booking BK045 - LKR 28,500'
        }
    ];
    
    // Randomly add new activity
    if (Math.random() > 0.8) {
        const newActivity = activities[Math.floor(Math.random() * activities.length)];
        addActivityItem(newActivity);
    }
}

function addActivityItem(activity) {
    const timeline = document.querySelector('.activity-timeline');
    if (!timeline) return;
    
    const activityHtml = `
        <div class="activity-item new-activity">
            <div class="activity-time">${activity.time}</div>
            <div class="activity-content">
                <div class="activity-icon ${activity.iconClass}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <p class="activity-title">${activity.title}</p>
                    <p class="activity-description">${activity.description}</p>
                </div>
            </div>
        </div>
    `;
    
    timeline.insertAdjacentHTML('afterbegin', activityHtml);
    
    // Remove oldest item if more than 5
    const items = timeline.querySelectorAll('.activity-item');
    if (items.length > 5) {
        items[items.length - 1].remove();
    }
    
    // Remove new-activity class after animation
    setTimeout(() => {
        timeline.querySelector('.new-activity')?.classList.remove('new-activity');
    }, 1000);
}

function updateSystemStatus() {
    const statusItems = document.querySelectorAll('.status-indicator');
    
    statusItems.forEach(item => {
        if (Math.random() > 0.95) { // 5% chance of status change
            const currentStatus = item.classList.contains('online') ? 'online' : 
                                 item.classList.contains('warning') ? 'warning' : 'offline';
            
            // Simulate status changes
            if (currentStatus === 'warning' && Math.random() > 0.5) {
                item.className = 'status-indicator online';
                item.querySelector('.status-text').textContent = 'Online';
            }
        }
    });
}

function setupOperationViews() {
    const operationViews = document.querySelectorAll('input[name="operationsView"]');
    
    operationViews.forEach(view => {
        view.addEventListener('change', function() {
            // Hide all content
            document.querySelectorAll('.operations-content').forEach(content => {
                content.classList.add('d-none');
            });
            
            // Show selected content
            const targetContent = this.id.replace('View', 'Content');
            const targetElement = document.getElementById(targetContent);
            if (targetElement) {
                targetElement.classList.remove('d-none');
            }
        });
    });
}

function setupHotelSelector() {
    const hotelSelector = document.getElementById('hotelSelector');
    if (hotelSelector) {
        hotelSelector.addEventListener('change', function() {
            const selectedHotel = this.value;
            
            // Show loading state
            showLoadingOverlay('Switching to ' + this.options[this.selectedIndex].text + '...');
            
            // Simulate data loading
            setTimeout(() => {
                updateDashboardForHotel(selectedHotel);
                hideLoadingOverlay();
                showToast(`Switched to ${this.options[this.selectedIndex].text}`, 'success');
            }, 1500);
        });
    }
}

function updateDashboardForHotel(hotelId) {
    // Simulate updating dashboard data for different hotels
    const hotelData = {
        colombo: { occupancy: '87%', revenue: '2.1M', guests: '156', satisfaction: '4.8' },
        kandy: { occupancy: '72%', revenue: '1.3M', guests: '89', satisfaction: '4.9' },
        galle: { occupancy: '91%', revenue: '1.8M', guests: '134', satisfaction: '4.7' },
        all: { occupancy: '83%', revenue: '5.2M', guests: '379', satisfaction: '4.8' }
    };
    
    const data = hotelData[hotelId] || hotelData.all;
    
    // Update metrics
    document.querySelector('.occupancy .metric-number').textContent = data.occupancy;
    document.querySelector('.revenue .metric-number').textContent = data.revenue;
    document.querySelector('.guests .metric-number').textContent = data.guests;
    document.querySelector('.satisfaction .metric-number').textContent = data.satisfaction;
    
    // Update charts
    updateChartData();
}

function initializeCharts() {
    initializeRevenueChart();
    initializeOccupancyChart();
}

function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
            datasets: [{
                label: 'Revenue (LKR)',
                data: [150000, 280000, 420000, 680000, 890000, 1200000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'LKR ' + (value / 1000) + 'K';
                        }
                    }
                }
            }
        }
    });
    
    window.revenueChart = revenueChart;
}

function initializeOccupancyChart() {
    const ctx = document.getElementById('occupancyChart');
    if (!ctx) return;
    
    const occupancyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Occupied', 'Available', 'Maintenance', 'Cleaning'],
            datasets: [{
                data: [52, 8, 3, 5],
                backgroundColor: ['#ef4444', '#22c55e', '#f59e0b', '#6366f1'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    window.occupancyChart = occupancyChart;
}

function updateChartData() {
    // Update revenue chart with new data
    if (window.revenueChart) {
        const newData = generateRandomRevenueData();
        window.revenueChart.data.datasets[0].data = newData;
        window.revenueChart.update();
    }
    
    // Update occupancy chart
    if (window.occupancyChart) {
        const newOccupancyData = generateRandomOccupancyData();
        window.occupancyChart.data.datasets[0].data = newOccupancyData;
        window.occupancyChart.update();
    }
}

function generateRandomRevenueData() {
    return Array.from({ length: 6 }, (_, i) => {
        const baseValue = 150000 + (i * 200000);
        const variation = baseValue * 0.2;
        return Math.floor(baseValue + (Math.random() - 0.5) * variation);
    });
}

function generateRandomOccupancyData() {
    const total = 68; // Total rooms
    const occupied = Math.floor(Math.random() * 10) + 45; // 45-55
    const maintenance = Math.floor(Math.random() * 3) + 1; // 1-3
    const cleaning = Math.floor(Math.random() * 4) + 3; // 3-6
    const available = total - occupied - maintenance - cleaning;
    
    return [occupied, available, maintenance, cleaning];
}

function pollNotifications() {
    setInterval(() => {
        // Simulate new notifications
        if (Math.random() > 0.9) {
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                const currentCount = parseInt(badge.textContent);
                badge.textContent = currentCount + 1;
                badge.style.animation = 'pulse 0.5s ease';
            }
        }
    }, 30000);
}

function initializeTooltips() {
    // Initialize Bootstrap tooltips for elements with title attribute
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'k':
                    e.preventDefault();
                    document.querySelector('#quickActionsDropdown')?.click();
                    break;
                case 'n':
                    e.preventDefault();
                    quickCheckIn();
                    break;
                case 'r':
                    e.preventDefault();
                    generateReport();
                    break;
            }
        }
        
        // Function keys
        switch(e.key) {
            case 'F5':
                e.preventDefault();
                refreshDashboard();
                break;
        }
    });
}

// Operation functions
function processCheckIn(bookingId) {
    showConfirmModal(
        'Confirm Check-in',
        'Process check-in for this guest? Room keys will be activated and welcome message sent.',
        () => {
            showLoadingToast('Processing check-in...');
            setTimeout(() => {
                showToast('Check-in completed successfully!', 'success');
                // Remove the check-in item or update its status
                updateOperationStatus(bookingId, 'checked-in');
            }, 2000);
        }
    );
}

function vipCheckIn(bookingId) {
    showConfirmModal(
        'VIP Check-in',
        'Process VIP check-in? This will notify the VIP services team and activate premium amenities.',
        () => {
            showLoadingToast('Processing VIP check-in...');
            setTimeout(() => {
                showToast('VIP check-in completed! Guest services notified.', 'success');
                updateOperationStatus(bookingId, 'vip-checked-in');
            }, 2500);
        }
    );
}

function processCheckOut(checkoutId) {
    showConfirmModal(
        'Confirm Check-out',
        'Process check-out for this guest? Final bill will be generated and room marked for cleaning.',
        () => {
            showLoadingToast('Processing check-out...');
            setTimeout(() => {
                showToast('Check-out completed successfully!', 'success');
                updateOperationStatus(checkoutId, 'checked-out');
            }, 2000);
        }
    );
}

function updateMaintenance(maintenanceId) {
    window.location.href = `/admin/maintenance/${maintenanceId}`;
}

function viewGuest(bookingId) {
    window.location.href = `/admin/guest/${bookingId}`;
}

function viewBill(checkoutId) {
    window.open(`/admin/bill/${checkoutId}`, '_blank');
}

function viewMaintenance(maintenanceId) {
    window.location.href = `/admin/maintenance/${maintenanceId}`;
}

function updateOperationStatus(operationId, status) {
    // Update the UI to reflect the new status
    const operationItem = document.querySelector(`[data-operation-id="${operationId}"]`);
    if (operationItem) {
        operationItem.style.opacity = '0.5';
        operationItem.style.pointerEvents = 'none';
    }
}

// Quick action functions
function quickCheckIn() {
    const modalHtml = `
        <div class="modal fade" id="quickCheckInModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Quick Check-in</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="quickCheckInForm">
                            <div class="mb-3">
                                <label class="form-label">Booking Reference</label>
                                <input type="text" class="form-control" placeholder="BK001" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Room Number</label>
                                <select class="form-select" required>
                                    <option value="">Select Room</option>
                                    <option value="101">Room 101</option>
                                    <option value="102">Room 102</option>
                                    <option value="103">Room 103</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="confirmQuickCheckIn()">Check In</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('quickCheckInModal'));
    modal.show();
    
    // Clean up modal when hidden
    document.getElementById('quickCheckInModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function confirmQuickCheckIn() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('quickCheckInModal'));
    modal.hide();
    showLoadingToast('Processing quick check-in...');
    
    setTimeout(() => {
        showToast('Quick check-in completed successfully!', 'success');
    }, 1500);
}

function emergencyAlert() {
    showConfirmModal(
        'Emergency Alert',
        'This will send an emergency notification to all staff members. Continue?',
        () => {
            showToast('Emergency alert sent to all staff!', 'warning');
        }
    );
}

function maintenanceMode() {
    showConfirmModal(
        'Maintenance Mode',
        'This will put the hotel management system in maintenance mode. New bookings will be disabled. Continue?',
        () => {
            showToast('System entered maintenance mode', 'warning');
        }
    );
}

function generateReport() {
    const reportTypes = [
        { id: 'daily', name: 'Daily Operations Report' },
        { id: 'occupancy', name: 'Occupancy Report' },
        { id: 'revenue', name: 'Revenue Report' },
        { id: 'guest', name: 'Guest Satisfaction Report' }
    ];
    
    const modalHtml = `
        <div class="modal fade" id="reportModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Generate Report</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="reportForm">
                            <div class="mb-3">
                                <label class="form-label">Report Type</label>
                                <select class="form-select" required>
                                    ${reportTypes.map(type => `<option value="${type.id}">${type.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Date Range</label>
                                <div class="row">
                                    <div class="col-6">
                                        <input type="date" class="form-control" required>
                                    </div>
                                    <div class="col-6">
                                        <input type="date" class="form-control" required>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="confirmGenerateReport()">Generate</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
    
    document.getElementById('reportModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function confirmGenerateReport() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
    modal.hide();
    showLoadingToast('Generating report...');
    
    setTimeout(() => {
        showToast('Report generated successfully! Check your downloads.', 'success');
    }, 3000);
}

function refreshDashboard() {
    showLoadingOverlay('Refreshing dashboard data...');
    
    setTimeout(() => {
        // Refresh all data
        updateMetrics();
        updateChartData();
        updateActivityFeed();
        updateSystemStatus();
        
        hideLoadingOverlay();
        showToast('Dashboard refreshed successfully!', 'success');
    }, 2000);
}

// Utility functions
function showConfirmModal(title, message, onConfirm) {
    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1">
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
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
    
    document.querySelector('#confirmModal .confirm-btn').addEventListener('click', function() {
        modal.hide();
        onConfirm();
    });
    
    document.getElementById('confirmModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function showLoadingOverlay(message) {
    const overlayHtml = `
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-content">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p class="text-white">${message}</p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', overlayHtml);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function showLoadingToast(message) {
    showToast(message, 'info');
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