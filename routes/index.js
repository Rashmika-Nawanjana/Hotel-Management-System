const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');

// Home page
router.get('/', async (req, res) => {
    try {
        // Get dashboard statistics
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM Bookings WHERE status = 'Checked-In') as occupiedRooms,
                (SELECT COUNT(*) FROM Bookings WHERE status = 'Booked') as upcomingBookings,
                (SELECT COUNT(*) FROM Rooms WHERE status = 'Available') as availableRooms,
                (SELECT SUM(total_amount) FROM Bookings WHERE DATE(booking_date) = CURDATE()) as todayRevenue
        `;
        
        db.query(statsQuery, (err, stats) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { 
                    title: 'Database Error', 
                    message: 'Unable to fetch dashboard data' 
                });
            }

            // Get recent bookings
            const recentBookingsQuery = `
                SELECT 
                    b.booking_id,
                    CONCAT(g.first_name, ' ', g.last_name) as guest_name,
                    hb.branch_name,
                    r.room_number,
                    b.check_in_date,
                    b.check_out_date,
                    b.status,
                    b.total_amount
                FROM Bookings b
                JOIN Guests g ON b.guest_id = g.guest_id
                JOIN Rooms r ON b.room_id = r.room_id
                JOIN HotelBranches hb ON r.branch_id = hb.branch_id
                ORDER BY b.booking_date DESC
                LIMIT 5
            `;

            db.query(recentBookingsQuery, (err, recentBookings) => {
                if (err) {
                    console.error('Database error:', err);
                    recentBookings = [];
                }

                res.render('index', {
                    title: 'SkyNest Hotels - Dashboard',
                    stats: stats[0] || {},
                    recentBookings: recentBookings || [],
                    moment: moment
                });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            title: 'Error', 
            message: 'Something went wrong' 
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { title: 'About SkyNest Hotels' });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
});

module.exports = router;