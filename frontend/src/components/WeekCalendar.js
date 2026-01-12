import React from 'react';
import { getWeekStartDate, getWeekEndDate, formatDate, isWeekPast, isCurrentWeek } from '../utils/helpers';

const WeekCalendar = ({ payments, onPayClick, currentWeek }) => {
  const getWeekStatus = (weekNo) => {
    const payment = payments.find(p => p.week_no === weekNo);
    if (payment?.status === 'PAID') return 'paid';
    if (isWeekPast(weekNo)) return 'overdue';
    if (isCurrentWeek(weekNo)) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'overdue':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'current':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-gray-300 hover:bg-gray-400 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'overdue':
        return '✗';
      case 'current':
        return '●';
      default:
        return '○';
    }
  };

  const weeks = Array.from({ length: 48 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-christmas-green mb-4 flex items-center gap-2">
        📅 Weekly Payment Calendar
      </h2>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded"></span>
          <span>Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded"></span>
          <span>Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-500 rounded"></span>
          <span>Current Week</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-gray-300 rounded"></span>
          <span>Upcoming</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
        {weeks.map((weekNo) => {
          const status = getWeekStatus(weekNo);
          const payment = payments.find(p => p.week_no === weekNo);
          
          return (
            <div
              key={weekNo}
              className={`relative p-2 rounded-lg text-center cursor-pointer transition-all transform hover:scale-105 ${getStatusColor(status)}`}
              onClick={() => onPayClick(weekNo, payment)}
              title={`Week ${weekNo}: ${formatDate(getWeekStartDate(weekNo))} - ${formatDate(getWeekEndDate(weekNo))}`}
            >
              <div className="text-xs font-semibold">W{weekNo}</div>
              <div className="text-lg">{getStatusIcon(status)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
