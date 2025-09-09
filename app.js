const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'skynest-hotel-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'skynest.sid'
}));

// Flash messages
app.use(flash());

// Global middleware for template variables
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.userType = req.session.userType || null;
    res.locals.currentUrl = req.originalUrl;
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
        warning: req.flash('warning'),
        info: req.flash('info')
    };
    res.locals.year = new Date().getFullYear();
    next();
});

// =============================================
// MOCK DATA FOR FRONTEND DEMO
// =============================================

// Mock users for demo
const mockUsers = {
    guest: {
        id: 'guest_001',
        email: 'guest@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+94771234567',
        type: 'guest',
        loyaltyPoints: 2450,
        membershipLevel: 'Gold'
    },
    admin: {
        id: 'admin_001',
        email: 'admin@skynest.lk',
        firstName: 'Priyanka',
        lastName: 'Silva',
        type: 'admin',
        role: 'Hotel Manager',
        hotel: 'colombo'
    }
};

// Mock bookings for demo
const mockBookings = [
    {
        id: 'BK001',
        guestId: 'guest_001',
        hotel: 'SkyNest Colombo',
        roomType: 'Premium Double Room',
        roomNumber: '205',
        checkIn: '2024-12-15',
        checkOut: '2024-12-18',
        guests: 2,
        nights: 3,
        amount: 42000,
        status: 'confirmed',
        services: ['Airport Transfer', 'Breakfast Included']
    },
    {
        id: 'BK002',
        guestId: 'guest_001',
        hotel: 'SkyNest Kandy',
        roomType: 'Executive Suite',
        checkIn: '2025-01-05',
        checkOut: '2025-01-07',
        guests: 2,
        nights: 2,
        amount: 65000,
        status: 'pending',
        services: ['Spa Package', 'Hill View']
    }
];

// =============================================
// ROUTES
// =============================================

// Home page
app.get('/', (req, res) => {
    res.render('public/index', { 
        title: 'SkyNest Hotels - Luxury Hospitality in Sri Lanka',
        metaDescription: 'Experience luxury hospitality at SkyNest Hotels. Premium accommodations in Colombo, Kandy, and Galle with world-class amenities.',
        keywords: 'hotel, sri lanka, luxury, accommodation, booking'
    });
});

// About page
app.get('/about', (req, res) => {
    res.render('public/about', { 
        title: 'About Us - SkyNest Hotels',
        metaDescription: 'Learn about SkyNest Hotels\' commitment to excellence and luxury hospitality across Sri Lanka.'
    });
});

// Rooms page
app.get('/rooms', (req, res) => {
    res.render('public/rooms', { 
        title: 'Rooms & Suites - SkyNest Hotels',
        metaDescription: 'Discover our luxurious rooms and suites with modern amenities and stunning views.'
    });
});

// Services page
app.get('/services', (req, res) => {
    res.render('public/services', { 
        title: 'Services & Amenities - SkyNest Hotels',
        metaDescription: 'Explore our premium services including spa, dining, and concierge services.'
    });
});

// Contact page
app.get('/contact', (req, res) => {
    res.render('public/contact', { 
        title: 'Contact Us - SkyNest Hotels',
        metaDescription: 'Get in touch with SkyNest Hotels for reservations and inquiries.'
    });
});

// Contact form submission
app.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    console.log('Contact form submission:', { name, email, subject, message });
    
    req.flash('success', 'Thank you for your message. We will get back to you soon!');
    res.redirect('public/contact');
});

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Login page
app.get('/auth/login', (req, res) => {
    if (req.session.user) {
        const redirectUrl = req.session.userType === 'admin' ? '/admin/dashboard' : '/guest/dashboard';
        return res.redirect(redirectUrl);
    }
    
    res.render('auth/login', { 
        title: 'Login - SkyNest Hotels',
        metaDescription: 'Sign in to your SkyNest Hotels account to access bookings and services.'
    });
});

// Register page
app.get('/auth/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/guest/dashboard');
    }
    
    res.render('auth/register', { 
        title: 'Create Account - SkyNest Hotels',
        metaDescription: 'Join SkyNest Hotels and enjoy exclusive benefits and personalized experiences.'
    });
});

// Login form submission
app.post('/auth/login', (req, res) => {
    const { email, password, userType = 'guest' } = req.body;
    
    console.log('Login attempt:', { email, userType });
    
    // Mock authentication - replace with real authentication later
    let user = null;
    
    if (userType === 'guest' && email === 'guest@example.com' && password === 'password123') {
        user = mockUsers.guest;
    } else if (userType === 'admin' && email === 'admin@skynest.lk' && password === 'admin123') {
        user = mockUsers.admin;
    }
    
    if (!user) {
        req.flash('error', 'Invalid credentials. Please try again.');
        return res.redirect('/auth/login');
    }
    
    // Set session
    req.session.user = user;
    req.session.userType = user.type;
    
    req.flash('success', `Welcome back, ${user.firstName}!`);
    
    // Redirect based on user type
    const redirectUrl = user.type === 'admin' ? '/admin/dashboard' : '/guest/dashboard';
    res.redirect(redirectUrl);
});

// Register form submission
app.post('/auth/register', (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;
    
    console.log('Registration attempt:', { firstName, lastName, email, phone });
    
    // Mock registration - replace with real database save later
    req.flash('success', 'Account created successfully! Please sign in with email: guest@example.com and password: password123');
    res.redirect('/auth/login');
});

// Logout
app.get('/auth/logout', (req, res) => {
    const userName = req.session.user?.firstName || 'Guest';
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.clearCookie('skynest.sid');
        req.flash('info', `Goodbye ${userName}! You have been logged out successfully.`);
        res.redirect('/');
    });
});

// =============================================
// GUEST ROUTES
// =============================================

// Guest authentication middleware
const requireGuestAuth = (req, res, next) => {
    if (!req.session.user || req.session.userType !== 'guest') {
        req.flash('error', 'Please sign in to access your account.');
        return res.redirect('/auth/login');
    }
    next();
};

// Guest dashboard
app.get('/guest/dashboard', requireGuestAuth, (req, res) => {
    res.render('guest/dashboard', { 
        title: 'My Dashboard - SkyNest Hotels',
        user: req.session.user,
        bookings: mockBookings
    });
});

// Guest bookings
app.get('/guest/bookings', requireGuestAuth, (req, res) => {
    res.render('guest/bookings', { 
        title: 'My Bookings - SkyNest Hotels',
        user: req.session.user,
        bookings: mockBookings
    });
});

// New booking page
app.get('/guest/new-booking', requireGuestAuth, (req, res) => {
    res.render('guest/new-booking', { 
        title: 'New Booking - SkyNest Hotels',
        user: req.session.user
    });
});

// Services page
app.get('/guest/services', requireGuestAuth, (req, res) => {
    res.render('guest/services', { 
        title: 'Request Services - SkyNest Hotels',
        user: req.session.user
    });
});

// Profile page
app.get('/guest/profile', requireGuestAuth, (req, res) => {
    res.render('guest/profile', { 
        title: 'Profile Settings - SkyNest Hotels',
        user: req.session.user
    });
});

// Billing page
app.get('/guest/billing', requireGuestAuth, (req, res) => {
    res.render('guest/billing', { 
        title: 'Billing & Payments - SkyNest Hotels',
        user: req.session.user
    });
});

// Loyalty program page
app.get('/guest/loyalty', requireGuestAuth, (req, res) => {
    res.render('guest/loyalty', { 
        title: 'Loyalty Program - SkyNest Hotels',
        user: req.session.user
    });
});

// =============================================
// ADMIN ROUTES
// =============================================

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
    if (!req.session.user || req.session.userType !== 'admin') {
        req.flash('error', 'Access denied. Admin credentials required.');
        return res.redirect('/auth/login');
    }
    next();
};

// Admin dashboard
app.get('/admin/dashboard', requireAdminAuth, (req, res) => {
    res.render('admin/dashboard', { 
        title: 'Admin Dashboard - SkyNest Hotels',
        user: req.session.user,
        metrics: {
            occupancy: 87,
            revenue: 2100000,
            guests: 156,
            satisfaction: 4.8
        }
    });
});

// Admin bookings
app.get('/admin/bookings', requireAdminAuth, (req, res) => {
    res.render('admin/bookings', { 
        title: 'Bookings Management - SkyNest Hotels',
        user: req.session.user,
        bookings: mockBookings
    });
});

// Admin rooms
app.get('/admin/rooms', requireAdminAuth, (req, res) => {
    res.render('admin/rooms', { 
        title: 'Room Management - SkyNest Hotels',
        user: req.session.user
    });
});

// Admin guests
app.get('/admin/guests', requireAdminAuth, (req, res) => {
    res.render('admin/guests', { 
        title: 'Guest Management - SkyNest Hotels',
        user: req.session.user
    });
});

// Admin services
app.get('/admin/services', requireAdminAuth, (req, res) => {
    res.render('admin/services', { 
        title: 'Service Requests - SkyNest Hotels',
        user: req.session.user
    });
});

// Admin reports
app.get('/admin/reports', requireAdminAuth, (req, res) => {
    res.render('admin/reports', { 
        title: 'Reports & Analytics - SkyNest Hotels',
        user: req.session.user
    });
});

// =============================================
// API ROUTES (FOR FRONTEND DEMO)
// =============================================

// API status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        message: 'SkyNest Hotels API - Frontend Demo Mode'
    });
});

// API hotels
app.get('/api/hotels', (req, res) => {
    const hotels = [
        { 
            id: 'colombo', 
            name: 'SkyNest Colombo', 
            location: 'Colombo', 
            rooms: 60,
            occupancy: 87,
            revenue: 1200000
        },
        { 
            id: 'kandy', 
            name: 'SkyNest Kandy', 
            location: 'Kandy', 
            rooms: 45,
            occupancy: 72,
            revenue: 800000
        },
        { 
            id: 'galle', 
            name: 'SkyNest Galle', 
            location: 'Galle', 
            rooms: 55,
            occupancy: 91,
            revenue: 1100000
        }
    ];
    
    res.json({ success: true, data: hotels });
});

// API bookings
app.get('/api/bookings', (req, res) => {
    res.json({ success: true, data: mockBookings });
});

// Mock booking creation
app.post('/api/bookings', (req, res) => {
    const newBooking = {
        id: 'BK' + Date.now(),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    console.log('New booking created:', newBooking);
    
    res.json({ 
        success: true, 
        message: 'Booking created successfully',
        data: newBooking 
    });
});

// =============================================
// HEALTH CHECK & ERROR HANDLING
// =============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        mode: 'Frontend Demo'
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        error: {
            status: 404,
            message: 'The page you are looking for could not be found.',
            stack: ''
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(`Error ${err.status || 500}: ${err.message}`);
    
    res.status(err.status || 500);
    res.render('error', {
        title: 'Error',
        error: {
            status: err.status || 500,
            message: err.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : ''
        }
    });
});

// =============================================
// SERVER STARTUP
// =============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('\n🏨 SkyNest Hotels Management System');
    console.log('=====================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log('\n📱 Demo Accounts:');
    console.log('👤 Guest: guest@example.com / password123');
    console.log('👨‍💼 Admin: admin@skynest.lk / admin123');
    console.log('=====================================\n');
});

module.exports = app;