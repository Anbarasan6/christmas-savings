const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  week_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 48
    }
  },
  week_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10
  },
  payment_mode: {
    type: DataTypes.ENUM('UPI', 'CASH'),
    defaultValue: 'UPI'
  },
  utr_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PAID', 'PENDING', 'SUBMITTED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paid_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['member_id', 'week_no']
    }
  ]
});

module.exports = Payment;
