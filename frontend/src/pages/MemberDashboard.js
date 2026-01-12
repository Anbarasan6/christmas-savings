import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Snowfall from '../components/Snowfall';
import WeekCalendar from '../components/WeekCalendar';
import PaymentSummary from '../components/PaymentSummary';
import { generateUPILink, getWeekNumber, getWeekStartDate, getWeekEndDate, formatDate, isWeekPast } from '../utils/helpers';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(10);
  const [screenshotFile, setScreenshotFile] = useState(null);

  // Get UPI ID from environment variable
  const upiId = process.env.REACT_APP_UPI_ID || '';

  useEffect(() => {
    fetchData();
  }, [memberId]);

  const fetchData = async () => {
    try {
      const [memberRes, paymentsRes] = await Promise.all([
        api.get(`/members/${memberId}`),
        api.get(`/payments/member/${memberId}`)
      ]);
      setMember(memberRes.data);
      setPayments(paymentsRes.data);
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
    setPaymentInitiated(false);
    setPaymentAmount(10);
    setScreenshotFile(null);
    setShowPaymentModal(true);
  };

  const initiatePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Construct UPI link with custom amount
      const upiLink = generateUPILink(upiId, paymentAmount, 'Christmas Chit Week Payment');
      
      // Create/update payment record
      await api.post('/payments', {
        member_id: memberId,
        week_no: selectedWeek,
        amount: paymentAmount
      });

      // Open UPI app via deep link
      window.location.href = upiLink;
      setPaymentInitiated(true);
      
      toast.success('UPI app opened. Complete the payment.');
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    }
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      toast.success('Screenshot selected!');
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshotFile) {
      toast.error('Please upload payment screenshot');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      formData.append('member_id', memberId);
      formData.append('week_no', selectedWeek);
      formData.append('amount', paymentAmount);

      await api.post('/payments/upload-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
            <p className="text-christmas-gold">Weekly ₹10 Plan</p>
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
              💳 Pay Week {currentWeek} - ₹10
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
              <p className="text-gray-600 mb-4">
                {formatDate(getWeekStartDate(selectedWeek))} - {formatDate(getWeekEndDate(selectedWeek))}
              </p>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Enter Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold focus:border-christmas-green focus:outline-none"
                  min="1"
                  placeholder="Enter amount"
                />
              </div>

              {!paymentInitiated ? (
                <>
                  <button
                    onClick={initiatePayment}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all mb-4 flex items-center justify-center gap-2"
                  >
                    <span>Pay Now ₹{paymentAmount} via UPI</span>
                    <span className="text-2xl">📱</span>
                  </button>
                  
                  {/* Optional UPI App Buttons */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Or pay directly with:</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          const link = generateUPILink(upiId, paymentAmount, 'Christmas Chit Week Payment');
                          window.location.href = link.replace('upi://', 'gpay://upi/');
                        }}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-all"
                        title="Google Pay"
                      >
                        <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-lg">💳</div>
                        <span className="text-xs text-gray-600 mt-1">GPay</span>
                      </button>
                      <button
                        onClick={() => {
                          const link = generateUPILink(upiId, paymentAmount, 'Christmas Chit Week Payment');
                          window.location.href = link.replace('upi://', 'phonepe://');
                        }}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-all"
                        title="PhonePe"
                      >
                        <div className="w-10 h-10 bg-purple-600 rounded-full shadow-md flex items-center justify-center text-white text-lg">₹</div>
                        <span className="text-xs text-gray-600 mt-1">PhonePe</span>
                      </button>
                      <button
                        onClick={() => {
                          const link = generateUPILink(upiId, paymentAmount, 'Christmas Chit Week Payment');
                          window.location.href = link.replace('upi://', 'paytmmp://');
                        }}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-all"
                        title="Paytm"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-full shadow-md flex items-center justify-center text-white text-lg">P</div>
                        <span className="text-xs text-gray-600 mt-1">Paytm</span>
                      </button>
                      <button
                        onClick={() => {
                          const link = generateUPILink(upiId, paymentAmount, 'Christmas Chit Week Payment');
                          window.location.href = link;
                        }}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-all"
                        title="BHIM UPI"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-full shadow-md flex items-center justify-center text-white text-lg">B</div>
                        <span className="text-xs text-gray-600 mt-1">BHIM</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Android only • Opens your UPI app
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-blue-600 text-lg font-semibold mb-2">
                      📱 UPI App Opened
                    </div>
                    <p className="text-gray-600 text-sm">
                      After completing payment in your UPI app, please upload the screenshot below.
                    </p>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Upload Payment Screenshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-christmas-green file:text-white hover:file:bg-green-700"
                    />
                    {screenshotFile && (
                      <p className="text-green-600 text-sm mt-2">✓ {screenshotFile.name}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitPayment}
                    disabled={!screenshotFile}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                      screenshotFile
                        ? 'bg-gradient-to-r from-christmas-green to-green-600 text-white hover:from-green-700 hover:to-green-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Submit Payment</span>
                    <span className="text-xl">✓</span>
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
