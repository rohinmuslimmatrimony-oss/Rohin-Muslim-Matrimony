import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaUsers, FaChartPie, FaExclamationTriangle, FaTrash, 
  FaCheckCircle, FaEdit, FaCrown, FaStar, FaCog, FaRupeeSign
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('metrics');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState({ premiumPrice: 999, elitePrice: 1999, paymentGatewayMode: 'mock' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Unauthorized access.');
      navigate('/dashboard');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, navigate, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'metrics') {
        const res = await api.get('/admin/metrics');
        setMetrics(res.data.metrics);
      } else if (activeTab === 'users' || activeTab === 'approvals') {
        const res = await api.get('/admin/users');
        setUsers(res.data.data);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        setReports(res.data.data);
      } else if (activeTab === 'settings') {
        const res = await api.get('/admin/settings');
        if (res.data.data) {
          setSettings(res.data.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user and their profile? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleVerifyUser = async (id) => {
    try {
      const res = await api.put(`/admin/verify/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleChangePlan = async (id, currentPlan) => {
    const newPlan = window.prompt(`Enter new plan for user (free, premium, elite):`, currentPlan);
    if (!newPlan || !['free', 'premium', 'elite'].includes(newPlan.toLowerCase())) {
      if (newPlan) toast.error('Invalid plan tier');
      return;
    }
    
    try {
      const res = await api.put(`/admin/users/plan/${id}`, { plan: newPlan.toLowerCase() });
      if (res.data.success) {
        toast.success(`User plan updated to ${newPlan}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleUpdateLimit = async (id, currentLimit) => {
    const newLimit = window.prompt('Enter new daily view limit (number):', currentLimit);
    if (newLimit === null || isNaN(newLimit)) return;

    try {
      const res = await api.put(`/admin/users/limit/${id}`, { viewLimit: parseInt(newLimit) });
      if (res.data.success) {
        toast.success(`View limit updated to ${newLimit}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update view limit');
    }
  };

  const saveSettings = async () => {
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data.success) {
        toast.success('Pricing & Settings updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-slate-900 text-slate-200">
      
      {/* SIDEBAR PANEL */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-serif font-bold text-white mb-1">Command Center</h2>
          <p className="text-xs text-crimson-500 font-bold tracking-widest uppercase">Admin</p>
        </div>
        
        <div className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'metrics' ? 'bg-crimson-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaChartPie className="text-lg" /> Metrics
          </button>
          
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'approvals' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaCheckCircle className="text-lg" /> Pending Approvals
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-crimson-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaUsers className="text-lg" /> User Database
          </button>
          
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaExclamationTriangle className="text-lg" /> Moderation Queue
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaCog className="text-lg" /> Pricing & Settings
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR (Horizontal scroller for very small screens if needed) */}
      <div className="md:hidden flex overflow-x-auto bg-slate-950 border-b border-slate-800 p-2 gap-2 whitespace-nowrap">
          <button onClick={() => setActiveTab('metrics')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'metrics' ? 'bg-crimson-600 text-white' : 'text-slate-400'}`}><FaChartPie /> Metrics</button>
          <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}><FaCheckCircle /> Approvals</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'users' ? 'bg-crimson-600 text-white' : 'text-slate-400'}`}><FaUsers /> Users</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-slate-400'}`}><FaExclamationTriangle /> Reports</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><FaCog /> Settings</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="w-10 h-10 border-4 border-crimson-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <div className="animate-fadeIn max-w-6xl mx-auto">
            
            {/* METRICS TAB */}
            {activeTab === 'metrics' && metrics && (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-8">Platform Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-4xl font-bold text-white">{metrics.totalUsers}</p>
                    <p className="text-xs text-slate-500 mt-2">Registered Accounts</p>
                  </div>
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Active Profiles</h3>
                    <p className="text-4xl font-bold text-white">{metrics.totalProfiles}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-crimson-400">{metrics.genderSplit.male} Males</span>
                      <span className="text-purple-400">{metrics.genderSplit.female} Females</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Subscriptions</h3>
                    <p className="text-4xl font-bold text-white">{metrics.planBreakdown.premium + metrics.planBreakdown.elite}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-crimson-400">{metrics.planBreakdown.premium} Premium</span>
                      <span className="text-gold-400">{metrics.planBreakdown.elite} Elite</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Engagement</h3>
                    <p className="text-4xl font-bold text-white">{metrics.messagesCount}</p>
                    <p className="text-xs text-slate-500 mt-2">Total Messages Exchanged</p>
                  </div>
                  <div className="lg:col-span-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Network Connections</h3>
                      <p className="text-xs text-slate-500">Total connection requests across the platform.</p>
                    </div>
                    <div className="flex gap-8 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{metrics.requests.total}</p>
                        <p className="text-xs text-slate-400">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-crimson-400">{metrics.requests.accepted}</p>
                        <p className="text-xs text-slate-400">Accepted</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">{metrics.requests.pending}</p>
                        <p className="text-xs text-slate-400">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Pending Approvals</h1>
                <p className="text-slate-400 mb-8">Review new profiles before they go live on the platform.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => !(u.profile?.user?.isManuallyVerified || u.isManuallyVerified)).length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">
                      <FaCheckCircle className="text-4xl text-crimson-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white mb-1">Queue is empty</h3>
                      <p>All profiles have been manually verified.</p>
                    </div>
                  ) : (
                    users.filter(u => !(u.profile?.user?.isManuallyVerified || u.isManuallyVerified)).map(u => (
                      <div key={u._id} className="bg-slate-800 p-6 rounded-2xl border border-amber-900/30 relative shadow-lg">
                        <div className="absolute top-4 right-4 text-xs font-bold text-amber-500 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50">Pending Verification</div>
                        <h4 className="text-lg font-serif font-bold text-white mb-1">{u.profile ? u.profile.name : 'No Profile Yet'}</h4>
                        <p className="text-xs text-slate-400 mb-4">{u.email}</p>
                        
                        {u.profile && (
                          <div className="space-y-2 mb-6 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex justify-between"><span className="text-slate-500">Age/Gender</span><span className="text-slate-300">{u.profile.age} • {u.profile.gender}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">City</span><span className="text-slate-300">{u.profile.city}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Sect</span><span className="text-slate-300">{u.profile.sect}</span></div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => handleVerifyUser(u._id)} className="flex-1 bg-crimson-600 hover:bg-crimson-700 text-white font-bold py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1">
                            <FaCheckCircle /> Approve
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)} className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 font-bold py-2 rounded-lg transition-colors text-xs border border-red-900/50">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-8">User Database</h1>
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 uppercase font-bold text-xs">
                        <tr>
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Plan & Limits</th>
                          <th className="px-6 py-4">Verification</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-slate-750 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-crimson-900 flex items-center justify-center font-bold text-crimson-400">
                                  {u.profile ? u.profile.name[0] : u.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-white">{u.profile ? u.profile.name : 'No Profile Setup'}</p>
                                  <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-1">
                                {u.plan === 'elite' ? <FaCrown className="text-gold-500" /> : u.plan === 'premium' ? <FaStar className="text-crimson-500" /> : null}
                                <span className={`font-bold capitalize ${u.plan === 'elite' ? 'text-gold-500' : u.plan === 'premium' ? 'text-crimson-500' : 'text-slate-400'}`}>
                                  {u.plan}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">Views: {u.viewedCount} / {u.viewLimit > 9000 ? 'Unlimited' : u.viewLimit}</p>
                            </td>
                            <td className="px-6 py-4">
                              {u.profile?.user?.isManuallyVerified || u.isManuallyVerified ? (
                                <span className="bg-crimson-900/30 text-crimson-400 px-3 py-1 rounded-full text-xs font-bold border border-crimson-800">Verified ✓</span>
                              ) : (
                                <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-600">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleVerifyUser(u._id)} className="p-2 bg-slate-700 hover:bg-slate-600 text-crimson-400 rounded transition-colors" title="Toggle Verification">
                                  <FaCheckCircle />
                                </button>
                                <button onClick={() => handleChangePlan(u._id, u.plan)} className="p-2 bg-slate-700 hover:bg-slate-600 text-gold-400 rounded transition-colors" title="Change Plan">
                                  <FaCrown />
                                </button>
                                <button onClick={() => handleUpdateLimit(u._id, u.viewLimit)} className="p-2 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded transition-colors" title="Edit View Limit">
                                  <FaEdit />
                                </button>
                                <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors" title="Delete User">
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && <div className="p-8 text-center text-slate-500">No users found.</div>}
                  </div>
                </div>
              </>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Moderation Queue</h1>
                <p className="text-slate-400 mb-8">Review reports submitted by users against policy violators.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">
                      <FaCheckCircle className="text-4xl text-crimson-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white mb-1">Queue is empty</h3>
                      <p>No moderation reports pending at this time.</p>
                    </div>
                  ) : (
                    reports.map(r => (
                      <div key={r._id} className="bg-slate-800 p-6 rounded-2xl border border-red-900/30 relative shadow-lg">
                        <div className="absolute top-4 right-4 text-xs font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded">Reported</div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Case #{r._id.slice(-6)}</h4>
                        
                        <div className="space-y-3 mb-6 text-sm">
                          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <span className="block text-xs text-slate-500 mb-1">Reported By:</span>
                            <span className="font-bold text-white">{r.reporter?.email || 'Unknown User'}</span>
                          </div>
                          <div className="bg-red-900/10 p-3 rounded-lg border border-red-900/30">
                            <span className="block text-xs text-red-500 mb-1">Against User:</span>
                            <span className="font-bold text-white">{r.reportedUser?.email || 'Deleted User'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 mb-1">Reason:</span>
                            <p className="text-slate-300 italic">"{r.reason}"</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleDeleteUser(r.reportedUser?._id)} disabled={!r.reportedUser} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors text-xs disabled:opacity-50">
                            Delete Offender
                          </button>
                          <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-colors text-xs">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Platform Pricing & Settings</h1>
                <p className="text-slate-400 mb-8">Manage the pricing that is displayed to users on the Plans page.</p>
                
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg space-y-6">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-crimson-400 uppercase tracking-wider flex items-center gap-2"><FaStar /> Premium Plan Price (₹/month)</label>
                    <div className="relative">
                      <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={settings.premiumPrice} 
                        onChange={(e) => setSettings({...settings, premiumPrice: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-crimson-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2"><FaCrown /> Elite Plan Price (₹/month)</label>
                    <div className="relative">
                      <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={settings.elitePrice} 
                        onChange={(e) => setSettings({...settings, elitePrice: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-blue-400 uppercase tracking-wider">Payment Mode</label>
                    <select 
                      value={settings.paymentGatewayMode}
                      onChange={(e) => setSettings({...settings, paymentGatewayMode: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="mock">Mock Gateway (Test Mode)</option>
                      <option value="live">Live Gateway (Razorpay/Stripe)</option>
                    </select>
                    <p className="text-xs text-slate-500">Live gateway will be functional when Razorpay keys are added to .env.</p>
                  </div>

                  <button 
                    onClick={saveSettings}
                    className="w-full bg-crimson-600 hover:bg-crimson-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg mt-4"
                  >
                    Save All Settings
                  </button>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
