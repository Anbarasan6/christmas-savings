import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getWeekStartDate, getWeekEndDate, TOTAL_WEEKS, WEEKLY_AMOUNT } from '../utils/helpers';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Form states
  const [memberForm, setMemberForm] = useState({ name: '', phone: '' });
  const [paymentForm, setPaymentForm] = useState({ status: '', payment_mode: '', utr_no: '' });
  
  // Filter states
  const [filterMember, setFilterMember] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, membersRes, paymentsRes, notificationsRes] = await Promise.all([
        api.get('/payments/stats'),
        api.get('/members'),
        api.get('/payments'),
        api.get('/payments/notifications')
      ]);
      setStats(statsRes.data);
      setMembers(membersRes.data);
      setPayments(paymentsRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Member functions
  const openMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({ name: member.name, phone: member.phone || '' });
    } else {
      setEditingMember(null);
      setMemberForm({ name: '', phone: '' });
    }
    setShowMemberModal(true);
  };

  const saveMember = async () => {
    try {
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, memberForm);
        toast.success('Member updated successfully');
      } else {
        await api.post('/members', memberForm);
        toast.success('Member added successfully');
      }
      setShowMemberModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save member');
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm('Are you sure? This will delete all payment records for this member.')) {
      return;
    }
    try {
      await api.delete(`/members/${memberId}`);
      toast.success('Member deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  // Payment functions
  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      status: payment.status,
      payment_mode: payment.payment_mode || 'UPI',
      utr_no: payment.utr_no || ''
    });
    setShowPaymentModal(true);
  };

  const savePayment = async () => {
    try {
      await api.put(`/payments/${selectedPayment.id}`, paymentForm);
      toast.success('Payment updated successfully');
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  // Approve/Reject payment functions
  const approvePayment = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}`, { status: 'PAID' });
      toast.success('Payment approved! ✓');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const rejectPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) {
      return;
    }
    try {
      await api.put(`/payments/${paymentId}`, { status: 'REJECTED' });
      toast.success('Payment rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (filterMember && String(p.member_id?.id) !== filterMember) return false;
    if (filterWeek && p.week_no !== parseInt(filterWeek)) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-christmas-green border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-christmas-green text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎄 Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            {['dashboard', 'notifications', 'members', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-semibold capitalize transition-all border-b-2 relative ${
                  activeTab === tab
                    ? 'border-christmas-green text-christmas-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'notifications' && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-3xl font-bold text-gray-800">{stats.totalMembers}</div>
                <div className="text-gray-600">Total Members</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-3xl font-bold text-green-600">₹{stats.totalCollected}</div>
                <div className="text-gray-600">Total Collected</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-2">📱</div>
                <div className="text-3xl font-bold text-purple-600">₹{stats.upiTotal}</div>
                <div className="text-gray-600">UPI Total</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-2">💵</div>
                <div className="text-3xl font-bold text-blue-600">₹{stats.cashTotal}</div>
                <div className="text-gray-600">Cash Total</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-2">⏳</div>
                <div className="text-3xl font-bold text-orange-600">₹{stats.pendingAmount}</div>
                <div className="text-gray-600">Pending Amount</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-2">🔔</div>
                <div className="text-3xl font-bold text-red-600">{stats.pendingApproval || 0}</div>
                <div className="text-gray-600">Awaiting Approval</div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Collection Progress</h3>
              <div className="mb-2 flex justify-between">
                <span>Collected: ₹{stats.totalCollected}</span>
                <span>Expected: ₹{stats.totalExpected}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div 
                  className="bg-gradient-to-r from-christmas-green to-green-500 h-6 rounded-full transition-all flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${stats.totalExpected > 0 ? (stats.totalCollected / stats.totalExpected) * 100 : 0}%` }}
                >
                  {stats.totalExpected > 0 ? Math.round((stats.totalCollected / stats.totalExpected) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              🔔 Payment Notifications ({notifications.length})
            </h2>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-700">No pending approvals</h3>
                <p className="text-gray-500 mt-2">All payment submissions have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-christmas-green rounded-full flex items-center justify-center text-white font-bold">
                            {notification.member_id?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{notification.member_id?.name}</h3>
                            <p className="text-sm text-gray-500">{notification.member_id?.phone || 'No phone'}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Week {notification.week_no}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ₹{notification.amount}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            notification.payment_mode === 'UPI' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.payment_mode === 'UPI' ? '📱 UPI' : '💵 Cash'}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ⏳ Submitted {notification.submitted_at ? new Date(notification.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => approvePayment(notification.id)}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => rejectPayment(notification.id)}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Members ({members.length})</h2>
              <button
                onClick={() => openMemberModal()}
                className="bg-christmas-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                + Add Member
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Payments</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const memberPayments = payments.filter(p => p.member_id?.id === member.id);
                    const paidCount = memberPayments.filter(p => p.status === 'PAID').length;
                    return (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-semibold">{member.name}</td>
                        <td className="p-4">{member.phone || '-'}</td>
                        <td className="p-4">{formatDate(member.created_at)}</td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {paidCount}/{TOTAL_WEEKS} weeks
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => openMemberModal(member)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMember(member.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Payment Management</h2>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Filter by Member</label>
                  <select
                    value={filterMember}
                    onChange={(e) => setFilterMember(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">All Members</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Filter by Week</label>
                  <select
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">All Weeks</option>
                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterMember('');
                      setFilterWeek('');
                      setFilterStatus('');
                    }}
                    className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4">Member</th>
                      <th className="text-left p-4">Week</th>
                      <th className="text-left p-4">Period</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Mode</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">UTR</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.slice(0, 100).map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-semibold">{payment.member_id?.name || 'Unknown'}</td>
                        <td className="p-4">Week {payment.week_no}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatDate(getWeekStartDate(payment.week_no))} - {formatDate(getWeekEndDate(payment.week_no))}
                        </td>
                        <td className="p-4">₹{payment.amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            payment.payment_mode === 'UPI' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {payment.payment_mode || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            payment.status === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'SUBMITTED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{payment.utr_no || '-'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => openPaymentModal(payment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPayments.length > 100 && (
                <div className="p-4 text-center text-gray-600">
                  Showing first 100 of {filteredPayments.length} records. Use filters to narrow down.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Name *</label>
              <input
                type="text"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter member name"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveMember}
                className="flex-1 px-4 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              Update Payment
            </h3>
            
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <div className="font-semibold">{selectedPayment.member_id?.name}</div>
              <div className="text-sm text-gray-600">Week {selectedPayment.week_no} - ₹{selectedPayment.amount}</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={paymentForm.status}
                onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Payment Mode</label>
              <select
                value={paymentForm.payment_mode}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-1">UTR Number (optional)</label>
              <input
                type="text"
                value={paymentForm.utr_no}
                onChange={(e) => setPaymentForm({ ...paymentForm, utr_no: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter UTR number"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={savePayment}
                className="flex-1 px-4 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
