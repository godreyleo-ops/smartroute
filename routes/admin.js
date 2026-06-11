const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const db = require('../config/database');

const router = express.Router();

// Dashboard Statistics
router.get('/dashboard', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const totalParts = await db.query('SELECT COUNT(*) as count FROM spare_parts');
  const lowStockParts = await db.query('SELECT COUNT(*) as count FROM spare_parts WHERE quantity <= minimum_stock_level');
  const totalInventoryValue = await db.query('SELECT SUM(total_value) as total FROM spare_parts');
  const activeAlerts = await db.query('SELECT COUNT(*) as count FROM stock_alerts WHERE is_resolved = false');

  res.status(200).json({
    totalParts: totalParts.rows[0].count,
    lowStockParts: lowStockParts.rows[0].count,
    totalInventoryValue: totalInventoryValue.rows[0].total || 0,
    activeAlerts: activeAlerts.rows[0].count,
    timestamp: new Date()
  });
}));

// Get all users
router.get('/users', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, username, email, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
  );

  res.status(200).json(result.rows);
}));

// Get audit logs
router.get('/audit-logs', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const result = await db.query(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  res.status(200).json(result.rows);
}));

// System Health Check
router.get('/health', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const dbStatus = await db.query('SELECT NOW()');
  
  res.status(200).json({
    status: 'healthy',
    database: 'connected',
    timestamp: dbStatus.rows[0].now
  });
}));

module.exports = router;
