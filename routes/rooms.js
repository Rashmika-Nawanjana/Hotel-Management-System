const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');

// Display all rooms
router.get('/', (req, res) => {
    const query = `
        SELECT 
            r.*,
            hb.branch_name,
            rt.type_name,
            rt.capacity,
            rt.daily_rate,
            rt.amenities,
            CASE 
                WHEN b.booking_id IS NOT NULL THEN CONCAT(g.first_name, ' ', g.last_name)
                ELSE NULL
            END as current_guest,
            b.check_out_date
        FROM Rooms r
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN Bookings b ON r.room_id = b.room_id AND b.status = 'Checked-In'
        LEFT JOIN Guests g ON b.guest_id = g.guest_id
        ORDER BY hb.branch_name, r.room_number
    `;

    db.query(query, (err, rooms) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch rooms' 
            });
        }

        res.render('rooms/index', {
            title: 'Room Management',
            rooms: rooms,
            moment: moment
        });
    });
});

// Room availability calendar
router.get('/availability', (req, res) => {
    const startDate = req.query.start || moment().format('YYYY-MM-DD');
    const endDate = req.query.end || moment().add(30, 'days').format('YYYY-MM-DD');

    const query = `
        SELECT 
            r.room_id,
            r.room_number,
            hb.branch_name,
            rt.type_name,
            ra.date,
            ra.status,
            CASE 
                WHEN b.booking_id IS NOT NULL THEN CONCAT(g.first_name, ' ', g.last_name)
                ELSE NULL
            END as guest_name
        FROM Rooms r
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN RoomAvailability ra ON r.room_id = ra.room_id 
            AND ra.date BETWEEN ? AND ?
        LEFT JOIN Bookings b ON ra.booking_id = b.booking_id
        LEFT JOIN Guests g ON b.guest_id = g.guest_id
        ORDER BY hb.branch_name, r.room_number, ra.date
    `;

    db.query(query, [startDate, endDate], (err, availability) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch room availability' 
            });
        }

        // Group availability by room
        const roomAvailability = {};
        availability.forEach(record => {
            const roomKey = `${record.branch_name} - ${record.room_number}`;
            if (!roomAvailability[roomKey]) {
                roomAvailability[roomKey] = {
                    room_id: record.room_id,
                    room_number: record.room_number,
                    branch_name: record.branch_name,
                    type_name: record.type_name,
                    dates: []
                };
            }
            if (record.date) {
                roomAvailability[roomKey].dates.push({
                    date: record.date,
                    status: record.status,
                    guest_name: record.guest_name
                });
            }
        });

        res.render('rooms/availability', {
            title: 'Room Availability',
            roomAvailability: roomAvailability,
            startDate: startDate,
            endDate: endDate,
            moment: moment
        });
    });
});

// View room details
router.get('/:id', (req, res) => {
    const roomId = req.params.id;

    const query = `
        SELECT 
            r.*,
            hb.branch_name,
            hb.address as branch_address,
            rt.type_name,
            rt.capacity,
            rt.daily_rate,
            rt.amenities,
            rt.description
        FROM Rooms r
        JOIN HotelBranches hb ON r.branch_id = hb.branch_id
        JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
        WHERE r.room_id = ?
    `;

    db.query(query, [roomId], (err, room) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to fetch room details' 
            });
        }

        if (room.length === 0) {
            return res.status(404).render('error', { 
                title: 'Room Not Found', 
                message: 'The requested room does not exist' 
            });
        }

        // Get booking history for this room
        const bookingsQuery = `
            SELECT 
                b.*,
                CONCAT(g.first_name, ' ', g.last_name) as guest_name,
                g.email,
                g.phone
            FROM Bookings b
            JOIN Guests g ON b.guest_id = g.guest_id
            WHERE b.room_id = ?
            ORDER BY b.check_in_date DESC
            LIMIT 10
        `;

        db.query(bookingsQuery, [roomId], (err, bookings) => {
            if (err) {
                console.error('Database error:', err);
                bookings = [];
            }

            res.render('rooms/show', {
                title: `Room ${room[0].room_number} - ${room[0].branch_name}`,
                room: room[0],
                bookings: bookings,
                moment: moment
            });
        });
    });
});

module.exports = router;