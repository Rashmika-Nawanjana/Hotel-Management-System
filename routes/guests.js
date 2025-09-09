const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');
const { body, validationResult } = require('express-validator');

// Display all guests
router.get('/', (req, res) => {
    const query = `
        SELECT 
            g.*,
            COUNT(b.booking_id) as total_bookings,
            MAX(b.booking_date) as last_booking_date
        FROM Guests g
        LEFT JOIN Bookings b ON g.guest_id = b.guest_id
        GROUP BY g.guest_id
        ORDER BY g.created_at DESC
    `;

    db.query(query, (err, guests) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch guests' 
            });
        }

        res.render('guests/index', {
            title: 'Guest Management',
            guests: guests,
            moment: moment
        });
    });
});

// Show new guest form
router.get('/new', (req, res) => {
    res.render('guests/new', {
        title: 'Add New Guest'
    });
});

// Create new guest
router.post('/', [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        date_of_birth,
        id_number,
        nationality
    } = req.body;

    const query = `
        INSERT INTO Guests (
            first_name, last_name, email, phone, address, 
            date_of_birth, id_number, nationality
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        first_name, last_name, email, phone, address,
        date_of_birth || null, id_number, nationality
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: 'Failed to create guest' });
        }

        res.json({ 
            success: true, 
            guest_id: result.insertId,
            message: 'Guest created successfully' 
        });
    });
});

// View guest details
router.get('/:id', (req, res) => {
    const guestId = req.params.id;

    const guestQuery = `SELECT * FROM Guests WHERE guest_id = ?`;
    
    const bookingsQuery = `
        SELECT 
            b.*,
            hb.branch_name,
            r.room_number,
            rt.type_name
        FROM Bookings b
        JOIN Rooms r ON b.room_id = r.room_id
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        WHERE b.guest_id = ?
        ORDER BY b.booking_date DESC
    `;

    db.query(guestQuery, [guestId], (err, guest) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch guest details' 
            });
        }

        if (guest.length === 0) {
            return res.status(404).render('error', { 
                title: 'Guest Not Found', 
                message: 'The requested guest does not exist' 
            });
        }

        db.query(bookingsQuery, [guestId], (err, bookings) => {
            if (err) {
                console.error('Database error:', err);
                bookings = [];
            }

            res.render('guests/show', {
                title: `${guest[0].first_name} ${guest[0].last_name}`,
                guest: guest[0],
                bookings: bookings,
                moment: moment
            });
        });
    });
});

// Show edit guest form
router.get('/:id/edit', (req, res) => {
    const guestId = req.params.id;

    const query = `SELECT * FROM Guests WHERE guest_id = ?`;

    db.query(query, [guestId], (err, guest) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch guest details' 
            });
        }

        if (guest.length === 0) {
            return res.status(404).render('error', { 
                title: 'Guest Not Found', 
                message: 'The requested guest does not exist' 
            });
        }

        res.render('guests/edit', {
            title: 'Edit Guest',
            guest: guest[0],
            moment: moment
        });
    });
});

// Update guest
router.put('/:id', [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const guestId = req.params.id;
    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        date_of_birth,
        id_number,
        nationality
    } = req.body;

    const query = `
        UPDATE Guests SET
            first_name = ?, last_name = ?, email = ?, phone = ?,
            address = ?, date_of_birth = ?, id_number = ?, nationality = ?
        WHERE guest_id = ?
    `;

    const values = [
        first_name, last_name, email, phone, address,
        date_of_birth || null, id_number, nationality, guestId
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: 'Failed to update guest' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.json({ 
            success: true, 
            message: 'Guest updated successfully' 
        });
    });
});

module.exports = router;