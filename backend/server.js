require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize, Admin } = require('./models');
const adminRoutes = require('./routes/admin');
const memberRoutes = require('./routes/members');
const paymentRoutes = require('./routes/payments');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://christmas-chit-fund.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now, tighten later
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Christmas Savings API is running' });
});

// Get UPI ID
app.get('/api/config', (req, res) => {
  res.json({ upiId: process.env.UPI_ID || 'yourupi@bank' });
});

// Connect to MySQL and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized');

    // Create default admin if not exists, or reset password if it exists
    const bcrypt = require('bcryptjs');
    const defaultPassword = 'Christmas2026!';
    
    const [admin, created] = await Admin.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password_hash: defaultPassword  // Hook will hash this
      }
    });
    
    if (created) {
      console.log('Default admin created: username=admin, password=Christmas2026!');
    } else {
      // Always reset password to ensure it works
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      await sequelize.query(
        'UPDATE admins SET password_hash = ? WHERE username = ?',
        { replacements: [hashedPassword, 'admin'] }
      );
      console.log('Admin password reset: username=admin, password=Christmas2026!');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

startServer();
