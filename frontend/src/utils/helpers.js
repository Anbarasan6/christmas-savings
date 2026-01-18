// Start date: January 3, 2026
export const START_DATE = new Date('2026-01-03');
export const TOTAL_WEEKS = 48;
export const WEEKLY_AMOUNT = 10;
export const TOTAL_AMOUNT = TOTAL_WEEKS * WEEKLY_AMOUNT;

// Get week number from date
export const getWeekNumber = (date = new Date()) => {
  const diffTime = date - START_DATE;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(weekNumber, 1), TOTAL_WEEKS);
};

// Get week start date
export const getWeekStartDate = (weekNo) => {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + (weekNo - 1) * 7);
  return date;
};

// Get week end date
export const getWeekEndDate = (weekNo) => {
  const date = getWeekStartDate(weekNo);
  date.setDate(date.getDate() + 6);
  return date;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Check if week is in the past
export const isWeekPast = (weekNo) => {
  const today = new Date();
  const weekEnd = getWeekEndDate(weekNo);
  return today > weekEnd;
};

// Check if week is current
export const isCurrentWeek = (weekNo) => {
  const today = new Date();
  const weekStart = getWeekStartDate(weekNo);
  const weekEnd = getWeekEndDate(weekNo);
  return today >= weekStart && today <= weekEnd;
};

// Generate UPI deep link
export const generateUPILink = (upiId, memberName, weekNo) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: 'Christmas Savings',
    am: WEEKLY_AMOUNT.toString(),
    cu: 'INR',
    tn: `Week ${weekNo} Payment - ${memberName}`
  });
  return `upi://pay?${params.toString()}`;
};
