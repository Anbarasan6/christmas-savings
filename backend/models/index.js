const sequelize = require('../config/database');
const Admin = require('./Admin');
const Member = require('./Member');
const Payment = require('./Payment');

// Define associations
Member.hasMany(Payment, { foreignKey: 'member_id', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = {
  sequelize,
  Admin,
  Member,
  Payment
};
