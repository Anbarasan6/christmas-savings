import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Snowfall from '../components/Snowfall';

const LandingPage = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMember) {
      navigate(`/dashboard/${selectedMember}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-green via-green-800 to-christmas-darkRed relative overflow-hidden">
      <Snowfall />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl md:text-8xl mb-4">🎄</div>
          <h1 className="font-christmas text-4xl md:text-6xl text-white mb-4 drop-shadow-lg">
            Christmas Savings Group
          </h1>
          <p className="text-xl md:text-2xl text-christmas-gold font-semibold">
            Weekly Plan 🎁
          </p>
          <p className="text-white/80 mt-2">
            48 Weeks • 3rd January 2026 - December 2026
          </p>
        </div>

        {/* Selection Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👤</div>
              <h2 className="text-2xl font-bold text-christmas-green">
                Welcome, Member!
              </h2>
              <p className="text-gray-600 mt-2">
                Select your name to view your savings dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Your Name
                </label>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-christmas-green border-t-transparent"></div>
                  </div>
                ) : members.length > 0 ? (
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-christmas-green focus:outline-none text-lg"
                    required
                  >
                    <option value="">-- Choose your name --</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No members found. Contact admin to get added.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedMember}
                className="w-full bg-gradient-to-r from-christmas-green to-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-christmas-green transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                View My Dashboard 🎄
              </button>
            </form>
          </div>

          {/* Admin Link */}
          <div className="text-center mt-8">
            <a
              href="/admin/login"
              className="text-white/70 hover:text-white text-sm underline"
            >
              Admin Login →
            </a>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed bottom-0 left-0 text-6xl opacity-50">🎅</div>
        <div className="fixed bottom-0 right-0 text-6xl opacity-50">🎁</div>
      </div>
    </div>
  );
};

export default LandingPage;
