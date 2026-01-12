const express = require('express');
const { Member, Payment } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all members (public)
router.get('/', async (req, res) => {
  try {
    const members = await Member.findAll({ order: [['name', 'ASC']] });
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single member (public)
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const member = await Member.create({ name, phone });

    // Initialize 48 weekly payments for the new member
    const startDate = new Date('2026-01-01');
    const payments = [];

    for (let week = 1; week <= 48; week++) {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (week - 1) * 7);

      payments.push({
        member_id: member.id,
        week_no: week,
        week_start_date: weekStartDate,
        amount: 10,
        status: 'PENDING'
      });
    }

    await Payment.bulkCreate(payments);

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.update({ name, phone });

    res.json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete member (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Delete all payments for this member
    await Payment.destroy({ where: { member_id: req.params.id } });
    
    // Delete the member
    await member.destroy();

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
