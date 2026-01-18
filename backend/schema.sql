-- Christmas Savings Group Database Schema
-- Run this SQL to create the database and tables manually (optional - Sequelize auto-creates tables)

-- Create database
CREATE DATABASE IF NOT EXISTS christmas_savings;
USE christmas_savings;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  week_no INT NOT NULL CHECK (week_no >= 1 AND week_no <= 48),
  week_start_date DATE NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 10.00,
  payment_mode ENUM('UPI', 'CASH') DEFAULT 'UPI',
  utr_no VARCHAR(100),
  status ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
  paid_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_week (member_id, week_no)
);

-- Indexes for better performance
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_week ON payments(week_no);

-- Note: The default admin will be created automatically by the application
-- Username: admin
-- Password: Christmas2026!
