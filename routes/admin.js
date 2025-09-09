const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');

// Admin dashboard
router.get('/', (req, res) => {
    // Get system statistics
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM HotelBranches) as total_branches,
            (SELECT COUNT(*) FROM Rooms) as total_rooms,
            (SELECT COUNT(*) FROM Guests) as total_guests,
            (SELECT COUNT(*) FROM Bookings) as total_bookings,
            (SELECT COUNT(*) FROM ServiceCatalog WHERE is_active = 1) as active_services,
            (SELECT SUM(total_amount) FROM Bookings WHERE status = 'Checked-Out') as total_revenue
    `;

    db.query(statsQuery, (err, stats) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch system statistics' 
            });
        }

        res.render('admin/dashboard', {
            title: 'System Administration',
            stats: stats[0] || {},
            moment: moment
        });
    });
});

// Manage hotel branches
router.get('/branches', (req, res) => {
    const query = `
        SELECT 
            hb.*,
            COUNT(r.room_id) as room_count,
            COUNT(CASE WHEN r.status = 'Available' THEN 1 END) as available_rooms,
            COUNT(CASE WHEN r.status = 'Occupied' THEN 1 END) as occupied_rooms
        FROM HotelBranches hb
        LEFT JOIN Rooms r ON hb.branch_id = r.branch_id
        GROUP BY hb.branch_id
        ORDER BY hb.branch_name
    `;

    db.query(query, (err, branches) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch branches' 
            });
        }

        res.render('admin/branches', {
            title: 'Manage Hotel Branches',
            branches: branches
        });
    });
});

// Manage room types
router.get('/room-types', (req, res) => {
    const query = `
        SELECT 
            rt.*,
            COUNT(r.room_id) as room_count
        FROM RoomTypes rt
        LEFT JOIN Rooms r ON rt.room_type_id = r.room_type_id
        GROUP BY rt.room_type_id
        ORDER BY rt.type_name
    `;

    db.query(query, (err, roomTypes) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch room types' 
            });
        }

        res.render('admin/room-types', {
            title: 'Manage Room Types',
            roomTypes: roomTypes
        });
    });
});

// System maintenance
router.get('/maintenance', (req, res) => {
    res.render('admin/maintenance', {
        title: 'System Maintenance'
    });
});

// Database backup
router.post('/backup', (req, res) => {
    // This would typically create a database backup
    // For demonstration purposes, we'll just return a success message
    res.json({ 
        success: true, 
        message: 'Database backup initiated. You will be notified when complete.' 
    });
});

// Clear old data
router.post('/cleanup', (req, res) => {
    const daysOld = parseInt(req.body.days) || 365;

    const cleanupQuery = `
        DELETE FROM Bookings 
        WHERE status = 'Cancelled' 
        AND booking_date < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    db.query(cleanupQuery, [daysOld], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to cleanup old data' });
        }

        res.json({ 
            success: true, 
            message: `Cleaned up ${result.affectedRows} old booking records`,
            affected_rows: result.affectedRows
        });
    });
});

module.exports = router;