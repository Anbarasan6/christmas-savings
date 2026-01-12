const express = require('express');
const { Op } = require('sequelize');
const { Member, Payment } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get payments for a member (public)
router.get('/member/:memberId', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { member_id: req.params.memberId },
      order: [['week_no', 'ASC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payments (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Member,
        as: 'member',
        attributes: ['id', 'name', 'phone']
      }],
      order: [['week_no', 'ASC']]
    });
    
    // Transform to match frontend expectations
    const transformedPayments = payments.map(p => ({
      ...p.toJSON(),
      member_id: p.member
    }));
    
    res.json(transformedPayments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalMembers = await Member.count();
    
    const paidPayments = await Payment.findAll({ where: { status: 'PAID' } });
    const totalCollected = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const upiPayments = paidPayments.filter(p => p.payment_mode === 'UPI');
    const upiTotal = upiPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const cashPayments = paidPayments.filter(p => p.payment_mode === 'CASH');
    const cashTotal = cashPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const totalExpected = totalMembers * 48 * 10;
    const pendingAmount = totalExpected - totalCollected;

    res.json({
      totalMembers,
      totalCollected,
      upiTotal,
      cashTotal,
      pendingAmount,
      totalExpected
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment request (public - for UPI payment initiation)
router.post('/', async (req, res) => {
  try {
    const { member_id, week_no } = req.body;

    // Check if payment already exists
    let payment = await Payment.findOne({ 
      where: { member_id, week_no } 
    });
    
    if (payment && payment.status === 'PAID') {
      return res.status(400).json({ message: 'Payment already completed for this week' });
    }

    if (!payment) {
      const startDate = new Date('2026-01-01');
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (week_no - 1) * 7);

      payment = await Payment.create({
        member_id,
        week_no,
        week_start_date: weekStartDate,
        amount: 10,
        status: 'PENDING',
        payment_mode: 'UPI'
      });
    }

    res.json({ message: 'Payment initiated', payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, payment_mode, utr_no } = req.body;

    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: Member,
        as: 'member',
        attributes: ['id', 'name']
      }]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updateData = {
      status,
      payment_mode,
      utr_no
    };

    if (status === 'PAID') {
      updateData.paid_date = new Date();
    }

    await payment.update(updateData);

    // Transform response
    const response = {
      ...payment.toJSON(),
      member_id: payment.member
    };

    res.json({ message: 'Payment updated successfully', payment: response });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update payments for a member (admin only)
router.put('/bulk/:memberId', authMiddleware, async (req, res) => {
  try {
    const { weeks, status, payment_mode } = req.body;

    const updateData = {
      status,
      payment_mode
    };

    if (status === 'PAID') {
      updateData.paid_date = new Date();
    }

    await Payment.update(updateData, {
      where: {
        member_id: req.params.memberId,
        week_no: { [Op.in]: weeks }
      }
    });

    res.json({ message: 'Payments updated successfully' });
  } catch (error) {
    console.error('Error bulk updating payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
