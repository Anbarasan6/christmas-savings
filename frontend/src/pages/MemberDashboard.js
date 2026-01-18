import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Snowfall from '../components/Snowfall';
import WeekCalendar from '../components/WeekCalendar';
import PaymentSummary from '../components/PaymentSummary';
import { getWeekNumber, getWeekStartDate, getWeekEndDate, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'CASH' or 'UPI'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [memberId]);

  const fetchData = async () => {
    try {
      const [memberRes, paymentsRes, configRes] = await Promise.all([
        api.get(`/members/${memberId}`),
        api.get(`/payments/member/${memberId}`),
        api.get('/config')
      ]);
      setMember(memberRes.data);
      setPayments(paymentsRes.data);
      setUpiId(configRes.data.upiId);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (weekNo, payment) => {
    if (payment?.status === 'PAID') {
      toast.success(`Week ${weekNo} is already paid! ✓`);
      return;
    }
    setSelectedWeek(weekNo);
    setPaymentMethod(null);
    setCopied(false);
    setShowPaymentModal(true);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    try {
      await api.post('/payments', {
        member_id: memberId,
        week_no: selectedWeek,
        payment_mode: paymentMethod
      });
      toast.success('Payment submitted for verification!');
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    }
  };

  const currentWeek = getWeekNumber();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-christmas-green to-christmas-darkRed flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-green via-green-800 to-christmas-darkRed relative">
      <Snowfall />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="font-christmas text-3xl md:text-4xl text-white drop-shadow-lg">
              🎄 Christmas Savings Group
            </h1>
            <p className="text-christmas-gold">Weekly Plan</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
          >
            ← Back to Home
          </button>
        </div>

        {/* Member Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-christmas-green rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {member?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{member?.name}</h2>
              <p className="text-gray-600">Member since {formatDate(member?.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-6">
          <PaymentSummary payments={payments} />
        </div>

        {/* Week Calendar */}
        <div className="mb-6">
          <WeekCalendar 
            payments={payments} 
            onPayClick={handlePayClick}
            currentWeek={currentWeek}
          />
        </div>

        {/* Quick Pay Button */}
        {payments.find(p => p.week_no === currentWeek)?.status !== 'PAID' && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => handlePayClick(currentWeek, payments.find(p => p.week_no === currentWeek))}
              className="bg-gradient-to-r from-christmas-red to-red-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-2 text-lg font-semibold"
            >
              💳 Pay Week {currentWeek}
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>

            <div className="text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Pay for Week {selectedWeek}
              </h3>
              <p className="text-gray-600 mb-6">
                {formatDate(getWeekStartDate(selectedWeek))} - {formatDate(getWeekEndDate(selectedWeek))}
              </p>

              {/* Payment Method Selection */}
              {!paymentMethod ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-2xl">💵</span>
                    <span>Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-2xl">📱</span>
                    <span>Pay via UPI</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Method Info */}
                  <div className={`border rounded-xl p-4 ${paymentMethod === 'CASH' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
                    <div className={`text-lg font-semibold ${paymentMethod === 'CASH' ? 'text-green-600' : 'text-purple-600'}`}>
                      {paymentMethod === 'CASH' ? '💵 Cash Payment' : '📱 UPI Payment'}
                    </div>
                  </div>

                  {/* UPI ID with Copy - Only for UPI */}
                  {paymentMethod === 'UPI' && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-2">Send payment to this UPI ID:</p>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                        <span className="font-mono text-lg font-semibold text-gray-800 break-all">{upiId}</span>
                        <button
                          onClick={copyUpiId}
                          className={`ml-2 px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                            copied 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                          }`}
                        >
                          {copied ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Open GPay/PhonePe/Paytm, send money to this UPI ID
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitPayment}
                    className="w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-christmas-green to-green-600 text-white hover:from-green-700 hover:to-green-800"
                  >
                    <span>Submit Payment</span>
                    <span className="text-xl">✓</span>
                  </button>

                  {/* Change Method */}
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="w-full text-gray-500 text-sm hover:text-gray-700"
                  >
                    ← Change payment method
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Admin will verify your payment and update the status
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
