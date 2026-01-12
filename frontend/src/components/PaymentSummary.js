import React from 'react';
import { TOTAL_WEEKS, WEEKLY_AMOUNT, TOTAL_AMOUNT, getWeekNumber } from '../utils/helpers';

const PaymentSummary = ({ payments }) => {
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const paidAmount = paidPayments.length * WEEKLY_AMOUNT;
  const remainingAmount = TOTAL_AMOUNT - paidAmount;
  const paidWeeks = paidPayments.length;
  const remainingWeeks = TOTAL_WEEKS - paidWeeks;
  const currentWeek = getWeekNumber();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-christmas-green mb-4 flex items-center gap-2">
        📊 Payment Summary
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-christmas-green to-green-700 text-white p-4 rounded-lg text-center">
          <div className="text-3xl font-bold">{TOTAL_WEEKS}</div>
          <div className="text-sm opacity-90">Total Weeks</div>
        </div>
        
        <div className="bg-gradient-to-br from-christmas-red to-red-700 text-white p-4 rounded-lg text-center">
          <div className="text-3xl font-bold">₹{TOTAL_AMOUNT}</div>
          <div className="text-sm opacity-90">Total Amount</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
          <div className="text-3xl font-bold">₹{paidAmount}</div>
          <div className="text-sm opacity-90">Paid Amount</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
          <div className="text-3xl font-bold">₹{remainingAmount}</div>
          <div className="text-sm opacity-90">Remaining Amount</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
          <div className="text-3xl font-bold">{paidWeeks}</div>
          <div className="text-sm opacity-90">Weeks Paid</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
          <div className="text-3xl font-bold">{remainingWeeks}</div>
          <div className="text-sm opacity-90">Weeks Remaining</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{Math.round((paidWeeks / TOTAL_WEEKS) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-christmas-green to-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${(paidWeeks / TOTAL_WEEKS) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 text-center text-gray-600">
        <span className="font-semibold">Current Week:</span> Week {currentWeek} of {TOTAL_WEEKS}
      </div>
    </div>
  );
};

export default PaymentSummary;
