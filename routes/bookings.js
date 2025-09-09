const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');
const { body, validationResult } = require('express-validator');

// Display all bookings
router.get('/', (req, res) => {
    const query = `
        SELECT 
            b.booking_id,
            CONCAT(g.first_name, ' ', g.last_name) as guest_name,
            g.email,
            g.phone,
            hb.branch_name,
            r.room_number,
            rt.type_name,
            b.check_in_date,
            b.check_out_date,
            b.total_nights,
            b.adults,
            b.children,
            b.total_amount,
            b.paid_amount,
            b.outstanding_amount,
            b.status,
            b.booking_date
        FROM Bookings b
        JOIN Guests g ON b.guest_id = g.guest_id
        JOIN Rooms r ON b.room_id = r.room_id
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        ORDER BY b.booking_date DESC
    `;

    db.query(query, (err, bookings) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch bookings' 
            });
        }

        res.render('bookings/index', {
            title: 'All Bookings',
            bookings: bookings,
            moment: moment
        });
    });
});

// Show new booking form
router.get('/new', (req, res) => {
    // Get available rooms and guests for the form
    const roomsQuery = `
        SELECT 
            r.room_id,
            r.room_number,
            hb.branch_name,
            rt.type_name,
            rt.capacity,
            rt.daily_rate
        FROM Rooms r
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        WHERE r.status = 'Available'
        ORDER BY hb.branch_name, r.room_number
    `;

    const guestsQuery = `
        SELECT guest_id, CONCAT(first_name, ' ', last_name) as full_name, email
        FROM Guests
        ORDER BY first_name, last_name
    `;

    db.query(roomsQuery, (err, rooms) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch rooms' 
            });
        }

        db.query(guestsQuery, (err, guests) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { 
                    title: 'Database Error', 
                    message: 'Unable to fetch guests' 
                });
            }

            res.render('bookings/new', {
                title: 'New Booking',
                rooms: rooms,
                guests: guests,
                moment: moment
            });
        });
    });
});

// Create new booking
router.post('/', [
    body('guest_id').notEmpty().withMessage('Guest is required'),
    body('room_id').notEmpty().withMessage('Room is required'),
    body('check_in_date').isDate().withMessage('Valid check-in date is required'),
    body('check_out_date').isDate().withMessage('Valid check-out date is required'),
    body('adults').isInt({ min: 1 }).withMessage('At least 1 adult is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        guest_id,
        room_id,
        check_in_date,
        check_out_date,
        adults,
        children,
        payment_method,
        special_requests
    } = req.body;

    // Validate dates
    if (moment(check_out_date).isSameOrBefore(moment(check_in_date))) {
        return res.status(400).json({ 
            error: 'Check-out date must be after check-in date' 
        });
    }

    // Check room availability
    const availabilityQuery = `
        SELECT COUNT(*) as conflicting_bookings
        FROM Bookings 
        WHERE room_id = ? 
        AND status IN ('Booked', 'Checked-In')
        AND NOT (? <= check_in_date OR ? >= check_out_date)
    `;

    db.query(availabilityQuery, [room_id, check_out_date, check_in_date], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error checking availability' });
        }

        if (result[0].conflicting_bookings > 0) {
            return res.status(400).json({ 
                error: 'Room is not available for the selected dates' 
            });
        }

        // Create booking
        const insertQuery = `
            INSERT INTO Bookings (
                guest_id, room_id, check_in_date, check_out_date, 
                adults, children, payment_method, special_requests
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            guest_id, room_id, check_in_date, check_out_date,
            adults, children || 0, payment_method, special_requests
        ];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to create booking' });
            }

            res.json({ 
                success: true, 
                booking_id: result.insertId,
                message: 'Booking created successfully' 
            });
        });
    });
});

// View booking details
router.get('/:id', (req, res) => {
    const bookingId = req.params.id;

    const query = `
        SELECT 
            b.*,
            CONCAT(g.first_name, ' ', g.last_name) as guest_name,
            g.email,
            g.phone,
            g.address,
            hb.branch_name,
            hb.address as branch_address,
            r.room_number,
            rt.type_name,
            rt.daily_rate,
            rt.amenities
        FROM Bookings b
        JOIN Guests g ON b.guest_id = g.guest_id
        JOIN Rooms r ON b.room_id = r.room_id
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        WHERE b.booking_id = ?
    `;

    db.query(query, [bookingId], (err, booking) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch booking details' 
            });
        }

        if (booking.length === 0) {
            return res.status(404).render('error', { 
                title: 'Booking Not Found', 
                message: 'The requested booking does not exist' 
            });
        }

        // Get service usage for this booking
        const servicesQuery = `
            SELECT 
                su.*,
                sc.service_name,
                sc.category
            FROM ServiceUsage su
            JOIN ServiceCatalog sc ON su.service_id = sc.service_id
            WHERE su.booking_id = ?
            ORDER BY su.usage_date DESC
        `;

        db.query(servicesQuery, [bookingId], (err, services) => {
            if (err) {
                console.error('Database error:', err);
                services = [];
            }

            // Get payment history
            const paymentsQuery = `
                SELECT * FROM Payments 
                WHERE booking_id = ? 
                ORDER BY payment_date DESC
            `;

            db.query(paymentsQuery, [bookingId], (err, payments) => {
                if (err) {
                    console.error('Database error:', err);
                    payments = [];
                }

                res.render('bookings/show', {
                    title: `Booking #${bookingId}`,
                    booking: booking[0],
                    services: services,
                    payments: payments,
                    moment: moment
                });
            });
        });
    });
});

// Check-in booking
router.post('/:id/checkin', (req, res) => {
    const bookingId = req.params.id;

    const query = `
        UPDATE Bookings 
        SET status = 'Checked-In', updated_at = CURRENT_TIMESTAMP
        WHERE booking_id = ? AND status = 'Booked'
    `;

    db.query(query, [bookingId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to check-in' });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Booking not found or already checked-in' });
        }

        res.json({ success: true, message: 'Guest checked-in successfully' });
    });
});

// Check-out booking
router.post('/:id/checkout', (req, res) => {
    const bookingId = req.params.id;

    // First check if booking is fully paid
    const checkPaymentQuery = `
        SELECT outstanding_amount 
        FROM Bookings 
        WHERE booking_id = ? AND status = 'Checked-In'
    `;

    db.query(checkPaymentQuery, [bookingId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(400).json({ error: 'Booking not found or not checked-in' });
        }

        if (result[0].outstanding_amount > 0) {
            return res.status(400).json({ 
                error: 'Cannot check-out with outstanding balance' 
            });
        }

        // Update booking status to checked-out
        const updateQuery = `
            UPDATE Bookings 
            SET status = 'Checked-Out', updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        db.query(updateQuery, [bookingId], (err, updateResult) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to check-out' });
            }

            res.json({ success: true, message: 'Guest checked-out successfully' });
        });
    });
});

module.exports = router;