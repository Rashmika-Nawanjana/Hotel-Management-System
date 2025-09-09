const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');
const { body, validationResult } = require('express-validator');

// Display service catalog
router.get('/', (req, res) => {
    const query = `
        SELECT 
            sc.*,
            COUNT(su.usage_id) as usage_count,
            SUM(su.total_price) as total_revenue
        FROM ServiceCatalog sc
        LEFT JOIN ServiceUsage su ON sc.service_id = su.service_id
        WHERE sc.is_active = 1
        GROUP BY sc.service_id
        ORDER BY sc.category, sc.service_name
    `;

    db.query(query, (err, services) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch services' 
            });
        }

        res.render('services/index', {
            title: 'Service Management',
            services: services
        });
    });
});

// Add service to booking
router.get('/add/:bookingId', (req, res) => {
    const bookingId = req.params.bookingId;

    // Get booking details
    const bookingQuery = `
        SELECT 
            b.*,
            CONCAT(g.first_name, ' ', g.last_name) as guest_name,
            r.room_number,
            hb.branch_name
        FROM Bookings b
        JOIN Guests g ON b.guest_id = g.guest_id
        JOIN Rooms r ON b.room_id = r.room_id
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        WHERE b.booking_id = ? AND b.status IN ('Booked', 'Checked-In')
    `;

    // Get available services
    const servicesQuery = `
        SELECT * FROM ServiceCatalog 
        WHERE is_active = 1 
        ORDER BY category, service_name
    `;

    db.query(bookingQuery, [bookingId], (err, booking) => {
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
                message: 'The requested booking does not exist or is not active' 
            });
        }

        db.query(servicesQuery, (err, services) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { 
                    title: 'Database Error', 
                    message: 'Unable to fetch services' 
                });
            }

            res.render('services/add', {
                title: 'Add Service to Booking',
                booking: booking[0],
                services: services,
                moment: moment
            });
        });
    });
});

// Process service addition
router.post('/add/:bookingId', [
    body('service_id').notEmpty().withMessage('Service is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('usage_date').isDate().withMessage('Valid usage date is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const bookingId = req.params.bookingId;
    const { service_id, quantity, usage_date, notes } = req.body;

    // Get service price
    const servicePriceQuery = `SELECT base_price FROM ServiceCatalog WHERE service_id = ?`;

    db.query(servicePriceQuery, [service_id], (err, service) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (service.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const unitPrice = service[0].base_price;

        // Insert service usage
        const insertQuery = `
            INSERT INTO ServiceUsage (booking_id, service_id, usage_date, quantity, unit_price, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [bookingId, service_id, usage_date, quantity, unitPrice, notes];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to add service' });
            }

            res.json({ 
                success: true, 
                usage_id: result.insertId,
                message: 'Service added successfully' 
            });
        });
    });
});

// View service usage for a booking
router.get('/booking/:bookingId', (req, res) => {
    const bookingId = req.params.bookingId;

    const query = `
        SELECT 
            su.*,
            sc.service_name,
            sc.category,
            sc.unit
        FROM ServiceUsage su
        JOIN ServiceCatalog sc ON su.service_id = sc.service_id
        WHERE su.booking_id = ?
        ORDER BY su.usage_date DESC
    `;

    db.query(query, [bookingId], (err, services) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Unable to fetch service usage' });
        }

        res.json({ services: services });
    });
});

// Remove service usage
router.delete('/:usageId', (req, res) => {
    const usageId = req.params.usageId;

    const query = `DELETE FROM ServiceUsage WHERE usage_id = ?`;

    db.query(query, [usageId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to remove service' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service usage not found' });
        }

        res.json({ 
            success: true, 
            message: 'Service removed successfully' 
        });
    });
});

module.exports = router;