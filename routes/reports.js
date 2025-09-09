const express = require('express');
const router = express.Router();
const db = require('../config/database');
const moment = require('moment');

// Reports dashboard
router.get('/', (req, res) => {
    res.render('reports/index', {
        title: 'Reports Dashboard'
    });
});

// Room Occupancy Report
router.get('/occupancy', (req, res) => {
    const reportDate = req.query.date || moment().format('YYYY-MM-DD');
    const branchId = req.query.branch_id || null;

    // Get branches for filter dropdown
    const branchesQuery = `SELECT * FROM HotelBranches ORDER BY branch_name`;

    db.query(branchesQuery, (err, branches) => {
        if (err) {
            console.error('Database error:', err);
            branches = [];
        }

        // Call stored procedure for occupancy report
        const reportQuery = `CALL GetRoomOccupancyReport(?, ?)`;

        db.query(reportQuery, [reportDate, branchId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { 
                    title: 'Database Error', 
                    message: 'Unable to generate occupancy report' 
                });
            }

            const occupancyData = results[0] || [];

            res.render('reports/occupancy', {
                title: 'Room Occupancy Report',
                occupancyData: occupancyData,
                branches: branches,
                selectedDate: reportDate,
                selectedBranch: branchId,
                moment: moment
            });
        });
    });
});

// Guest Billing Summary Report
router.get('/billing', (req, res) => {
    // Call stored procedure for billing summary
    const query = `CALL GetGuestBillingSummary()`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to generate billing report' 
            });
        }

        const billingData = results[0] || [];

        res.render('reports/billing', {
            title: 'Guest Billing Summary',
            billingData: billingData,
            moment: moment
        });
    });
});

// Service Usage Breakdown Report
router.get('/services', (req, res) => {
    const startDate = req.query.start_date || moment().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');

    // Call stored procedure for service usage breakdown
    const query = `CALL GetServiceUsageBreakdown(?, ?)`;

    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to generate service usage report' 
            });
        }

        const serviceData = results[0] || [];

        res.render('reports/services', {
            title: 'Service Usage Breakdown',
            serviceData: serviceData,
            startDate: startDate,
            endDate: endDate,
            moment: moment
        });
    });
});

// Monthly Revenue Report
router.get('/revenue', (req, res) => {
    const reportYear = parseInt(req.query.year) || moment().year();
    const reportMonth = parseInt(req.query.month) || moment().month() + 1;

    // Call stored procedure for monthly revenue
    const query = `CALL GetMonthlyRevenueReport(?, ?)`;

    db.query(query, [reportYear, reportMonth], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to generate revenue report' 
            });
        }

        const revenueData = results[0] || [];

        res.render('reports/revenue', {
            title: 'Monthly Revenue Report',
            revenueData: revenueData,
            reportYear: reportYear,
            reportMonth: reportMonth,
            monthName: moment().month(reportMonth - 1).format('MMMM'),
            moment: moment
        });
    });
});

// Top Services Report
router.get('/top-services', (req, res) => {
    const startDate = req.query.start_date || moment().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = req.query.end_date || moment().format('YYYY-MM-DD');

    // Call stored procedure for top services
    const query = `CALL GetTopServicesReport(?, ?)`;

    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('error', { 
                title: 'Database Error', 
                message: 'Unable to generate top services report' 
            });
        }

        const topServicesData = results[0] || [];

        res.render('reports/top-services', {
            title: 'Top Services Report',
            topServicesData: topServicesData,
            startDate: startDate,
            endDate: endDate,
            moment: moment
        });
    });
});

// Export reports to CSV (API endpoint)
router.get('/export/:reportType', (req, res) => {
    const reportType = req.params.reportType;
    const { start_date, end_date, date, branch_id, year, month } = req.query;

    let query = '';
    let params = [];
    let filename = '';

    switch (reportType) {
        case 'occupancy':
            query = `CALL GetRoomOccupancyReport(?, ?)`;
            params = [date, branch_id];
            filename = `occupancy_report_${date}.csv`;
            break;
        case 'billing':
            query = `CALL GetGuestBillingSummary()`;
            filename = `billing_summary_${moment().format('YYYY-MM-DD')}.csv`;
            break;
        case 'services':
            query = `CALL GetServiceUsageBreakdown(?, ?)`;
            params = [start_date, end_date];
            filename = `service_usage_${start_date}_to_${end_date}.csv`;
            break;
        case 'revenue':
            query = `CALL GetMonthlyRevenueReport(?, ?)`;
            params = [year, month];
            filename = `revenue_report_${year}_${month}.csv`;
            break;
        case 'top-services':
            query = `CALL GetTopServicesReport(?, ?)`;
            params = [start_date, end_date];
            filename = `top_services_${start_date}_to_${end_date}.csv`;
            break;
        default:
            return res.status(400).json({ error: 'Invalid report type' });
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Unable to generate report' });
        }

        const data = results[0] || [];
        
        if (data.length === 0) {
            return res.status(404).json({ error: 'No data found for the specified criteria' });
        }

        // Convert to CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    });
});

module.exports = router;