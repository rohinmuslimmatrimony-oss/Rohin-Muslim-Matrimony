import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaUsers, FaChartPie, FaExclamationTriangle, FaTrash, 
  FaCheckCircle, FaEdit, FaCrown, FaStar, FaCog, FaRupeeSign,
  FaHeart, FaPlus, FaMoneyBillWave, FaIdCard, FaHandshake
} from 'react-icons/fa';
import LogoLoader from '../components/LogoLoader';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('metrics');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [freeTierInterests, setFreeTierInterests] = useState([]);
  const [settings, setSettings] = useState({
    premiumPrice: 999,
    elitePrice: 1999,
    paymentGatewayMode: 'mock',
    freePlanFeatures: { viewFullBio: false, viewContactDetails: false, chat: false, shortlist: false, dailyViewLimit: 5 },
    premiumPlanFeatures: { viewFullBio: true, viewContactDetails: true, chat: true, shortlist: true, dailyViewLimit: 30 },
    elitePlanFeatures: { viewFullBio: true, viewContactDetails: true, chat: true, shortlist: true, dailyViewLimit: 99999 },
    supportPhone: '+91 99999 99999',
    supportWhatsApp: '+919999999999',
    supportEmail: 'support@rohinmatrimony.com',
    eliteManagerName: 'Rohin Support Team',
    eliteManagerPhone: '+91 99999 99999',
  });
  const [successStories, setSuccessStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // KYC States
  const [kycRequests, setKycRequests] = useState([]);
  const [kycFilter, setKycFilter] = useState('pending');
  const [kycSearch, setKycSearch] = useState('');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycAdminNote, setKycAdminNote] = useState('');

  // Match Suggestion States
  const [matchUserA, setMatchUserA] = useState('');
  const [matchUserB, setMatchUserB] = useState('');
  const [matchMessage, setMatchMessage] = useState('');
  const [matchSearchA, setMatchSearchA] = useState('');
  const [matchSearchB, setMatchSearchB] = useState('');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [editingLimitValue, setEditingLimitValue] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [approvalPage, setApprovalPage] = useState(1);
  const [paySearch, setPaySearch] = useState('');
  const USERS_PER_PAGE = 10;
  const PAY_PER_PAGE = 10;
  const APPROVAL_PER_PAGE = 6;

  // Success Story Modals / Forms state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImagesList, setExistingImagesList] = useState([]);
  const [storyForm, setStoryForm] = useState({
    _id: '',
    partnerOne: '',
    partnerTwo: '',
    story: '',
    location: '',
    marriageDate: '',
    isPublished: true
  });

  // Offline Registration Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    email: '',
    password: '',
    plan: 'free',
    name: '',
    age: '',
    gender: 'male',
    sect: 'Sunni',
    city: '',
    profession: '',
    education: '',
    about: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Unauthorized access.');
      navigate('/dashboard');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, navigate, activeTab, kycFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'metrics') {
        const res = await api.get('/admin/metrics');
        setMetrics(res.data.metrics);
      } else if (activeTab === 'users' || activeTab === 'approvals' || activeTab === 'suggest-match') {
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
      } else if (activeTab === 'success-stories') {
        const res = await api.get('/admin/success-stories');
        setSuccessStories(res.data.data);
      } else if (activeTab === 'payments') {
        const [metricsRes, usersRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/users'),
        ]);
        setMetrics(metricsRes.data.metrics);
        setUsers(usersRes.data.data);
      } else if (activeTab === 'free-interests') {
        const res = await api.get('/admin/free-interests');
        setFreeTierInterests(res.data.data || []);
      } else if (activeTab === 'kyc-verification') {
        const res = await api.get(`/admin/kyc?status=${kycFilter}`);
        setKycRequests(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStoryAdd = () => {
    setStoryForm({
      _id: '',
      partnerOne: '',
      partnerTwo: '',
      story: '',
      location: '',
      marriageDate: '',
      isPublished: true
    });
    setExistingImagesList([]);
    setSelectedFiles([]);
    setIsStoryModalOpen(true);
  };

  const handleOpenStoryEdit = (story) => {
    setStoryForm({
      _id: story._id,
      partnerOne: story.partnerOne,
      partnerTwo: story.partnerTwo,
      story: story.story,
      location: story.location,
      marriageDate: story.marriageDate || '',
      isPublished: story.isPublished
    });
    setExistingImagesList(story.images || (story.image ? [story.image] : []));
    setSelectedFiles([]);
    setIsStoryModalOpen(true);
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('partnerOne', storyForm.partnerOne);
      formData.append('partnerTwo', storyForm.partnerTwo);
      formData.append('story', storyForm.story);
      formData.append('location', storyForm.location);
      formData.append('marriageDate', storyForm.marriageDate || '');
      formData.append('isPublished', storyForm.isPublished);
      formData.append('existingImages', JSON.stringify(existingImagesList));

      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (storyForm._id) {
        await api.put(`/admin/success-stories/${storyForm._id}`, formData, config);
        toast.success('Success story updated successfully');
      } else {
        await api.post('/admin/success-stories', formData, config);
        toast.success('Success story created successfully');
      }
      setIsStoryModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save success story');
    }
  };

  const handleRemoveExistingImage = (idxToRemove) => {
    setExistingImagesList(existingImagesList.filter((_, idx) => idx !== idxToRemove));
  };

  const handleRemoveSelectedFile = (idxToRemove) => {
    setSelectedFiles(selectedFiles.filter((_, idx) => idx !== idxToRemove));
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this success story?')) return;
    try {
      await api.delete(`/admin/success-stories/${id}`);
      toast.success('Success story deleted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleCreateOfflineUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: offlineForm.email,
        password: offlineForm.password,
        plan: offlineForm.plan,
        profile: {
          name: offlineForm.name,
          age: parseInt(offlineForm.age) || 25,
          gender: offlineForm.gender,
          sect: offlineForm.sect,
          city: offlineForm.city,
          profession: offlineForm.profession,
          education: offlineForm.education,
          about: offlineForm.about,
          phoneNumber: offlineForm.phoneNumber
        }
      };

      const res = await api.post('/admin/users/create', payload);
      if (res.data.success) {
        toast.success('Offline User & Profile registered successfully!');
        setIsOfflineModalOpen(false);
        setOfflineForm({
          email: '',
          password: '',
          plan: 'free',
          name: '',
          age: '',
          gender: 'male',
          sect: 'Sunni',
          city: '',
          profession: '',
          education: '',
          about: '',
          phoneNumber: ''
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create offline user');
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

  const handleReviewKyc = async (action) => {
    if (!selectedKyc) return;
    try {
      const res = await api.put(`/admin/kyc/${selectedKyc._id}`, {
        action,
        adminNote: kycAdminNote
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedKyc(null);
        setKycAdminNote('');
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review KYC request');
    }
  };

  const handleSuggestMatchSubmit = async (e) => {
    e.preventDefault();
    if (!matchUserA || !matchUserB) {
      toast.error('Please select both users for match suggestion');
      return;
    }
    if (matchUserA === matchUserB) {
      toast.error('Cannot match a user with themselves');
      return;
    }
    try {
      const res = await api.post('/admin/suggest-match', {
        userAId: matchUserA,
        userBId: matchUserB,
        message: matchMessage
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setMatchUserA('');
        setMatchUserB('');
        setMatchMessage('');
        setMatchSearchA('');
        setMatchSearchB('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to suggest match');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-slate-900 text-slate-200">
      
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
            onClick={() => setActiveTab('kyc-verification')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'kyc-verification' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaIdCard className="text-lg" /> KYC Verification
          </button>

          <button 
            onClick={() => setActiveTab('suggest-match')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'suggest-match' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaHandshake className="text-lg" /> Suggest Match
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
            onClick={() => setActiveTab('success-stories')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'success-stories' ? 'bg-pink-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaHeart className="text-lg" /> Success Stories
          </button>

          <button 
            onClick={() => setActiveTab('free-interests')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'free-interests' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaHeart className="text-lg" /> Free-Tier Interests
            {freeTierInterests.length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {freeTierInterests.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'payments' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FaMoneyBillWave className="text-lg" /> Payments & Revenue
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
          <button onClick={() => setActiveTab('kyc-verification')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'kyc-verification' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}><FaIdCard /> KYC</button>
          <button onClick={() => setActiveTab('suggest-match')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'suggest-match' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><FaHandshake /> Match</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'users' ? 'bg-crimson-600 text-white' : 'text-slate-400'}`}><FaUsers /> Users</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-slate-400'}`}><FaExclamationTriangle /> Reports</button>
          <button onClick={() => setActiveTab('success-stories')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'success-stories' ? 'bg-pink-700 text-white' : 'text-slate-400'}`}><FaHeart /> Stories</button>
          <button onClick={() => setActiveTab('free-interests')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'free-interests' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}><FaHeart /> Free Interests {freeTierInterests.length > 0 && <span className="bg-orange-500 text-white text-[9px] px-1 rounded-full">{freeTierInterests.length}</span>}</button>
          <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'payments' ? 'bg-emerald-700 text-white' : 'text-slate-400'}`}><FaMoneyBillWave /> Revenue</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><FaCog /> Settings</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {loading ? (
          <LogoLoader text="Loading Admin Controls..." />
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
                  {/* Revenue Summary Card */}
                  {metrics.revenue && (
                    <div className="lg:col-span-4 bg-gradient-to-br from-emerald-950/60 to-slate-800 p-6 rounded-2xl border border-emerald-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><FaMoneyBillWave /> Estimated Monthly Revenue</h3>
                        <p className="text-xs text-slate-500">Based on current active subscriptions × plan prices.</p>
                      </div>
                      <div className="flex gap-8 text-center flex-wrap">
                        <div>
                          <p className="text-2xl font-bold text-crimson-400">₹{metrics.revenue.premiumRevenue.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-slate-400">{metrics.planBreakdown.premium} Premium × ₹{metrics.revenue.premiumPrice}</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gold-400">₹{metrics.revenue.eliteRevenue.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-slate-400">{metrics.planBreakdown.elite} Elite × ₹{metrics.revenue.elitePrice}</p>
                        </div>
                        <div className="border-l border-slate-700 pl-8">
                          <p className="text-3xl font-bold text-emerald-400">₹{metrics.revenue.totalRevenue.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Total / Month</p>
                        </div>
                      </div>
                    </div>
                  )}

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

            {/* FREE-TIER INTERESTS TAB */}
            {activeTab === 'free-interests' && (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Free-Tier Interests</h1>
                <p className="text-slate-400 text-sm mb-8">Interest requests sent by free-plan members — not visible to the recipient until they upgrade.</p>

                {freeTierInterests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                      <FaHeart className="text-2xl text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 mb-2">No Pending Free-Tier Interests</h3>
                    <p className="text-sm text-slate-500">All free-tier interest requests have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {freeTierInterests.map((item) => (
                      <div key={item._id} className="bg-slate-800 border border-orange-900/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Sender */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-bold text-white text-lg">
                            {item.sender?.profile?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{item.sender?.profile?.name || 'Unknown'}</span>
                              <span className="text-[10px] bg-orange-900/60 text-orange-400 border border-orange-700/40 px-2 py-0.5 rounded-full font-bold">FREE PLAN</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{item.sender?.email}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.sender?.profile?.profession || ''}{item.sender?.profile?.profession && item.sender?.profile?.city ? ' • ' : ''}{item.sender?.profile?.city || ''}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-slate-500 text-xs">→ Interested in:</span>
                              <span className="font-bold text-slate-300 text-xs">{item.receiver?.profile?.name || 'Unknown'}</span>
                              <span className="text-slate-500 text-xs">{item.receiver?.email}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1">
                              Sent: {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/admin/users/plan/${item.sender._id}`, { plan: 'premium' });
                                toast.success(`${item.sender?.profile?.name || 'User'} upgraded to Premium!`);
                                // Refresh list
                                const res = await api.get('/admin/free-interests');
                                setFreeTierInterests(res.data.data || []);
                              } catch (err) {
                                toast.error('Failed to upgrade user');
                              }
                            }}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <FaCrown className="text-[10px]" /> Upgrade to Premium
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.delete(`/admin/free-interests/${item._id}`);
                                toast.success('Interest request dismissed');
                                setFreeTierInterests(prev => prev.filter(i => i._id !== item._id));
                              } catch (err) {
                                toast.error('Failed to dismiss request');
                              }
                            }}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <FaTrash className="text-[10px]" /> Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* PAYMENTS & REVENUE TAB */}
            {activeTab === 'payments' && metrics && (

              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Payments & Revenue</h1>
                    <p className="text-slate-400 text-sm">Estimated monthly revenue from active subscriptions.</p>
                  </div>
                </div>

                {/* Revenue KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Total Monthly Revenue</p>
                    <p className="text-4xl font-serif font-bold text-emerald-400">₹{(metrics.revenue?.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 mt-2">{(metrics.planBreakdown.premium + metrics.planBreakdown.elite)} paid subscribers</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-crimson-900/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-crimson-500/5 rounded-full blur-xl"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Premium Revenue</p>
                    <p className="text-4xl font-serif font-bold text-crimson-400">₹{(metrics.revenue?.premiumRevenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 mt-2">{metrics.planBreakdown.premium} users × ₹{metrics.revenue?.premiumPrice || 999}/mo</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-gold-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Elite Revenue</p>
                    <p className="text-4xl font-serif font-bold text-gold-400">₹{(metrics.revenue?.eliteRevenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 mt-2">{metrics.planBreakdown.elite} users × ₹{metrics.revenue?.elitePrice || 1999}/mo</p>
                  </div>
                </div>

                {/* Plan Breakdown Table */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-8">
                  <div className="px-6 py-4 border-b border-slate-700">
                    <h3 className="text-white font-bold text-lg">Plan-wise Subscription Breakdown</h3>
                    <p className="text-slate-500 text-xs mt-1">Revenue contribution by each subscription tier</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Plan Tier</th>
                        <th className="px-6 py-4 text-center">Active Users</th>
                        <th className="px-6 py-4 text-center">Price / Month</th>
                        <th className="px-6 py-4 text-center">% of Paid</th>
                        <th className="px-6 py-4 text-right">Monthly Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {/* Free */}
                      <tr className="hover:bg-slate-750 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-slate-300 font-bold">🆓 Free</span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-300 font-bold">{metrics.planBreakdown.free}</td>
                        <td className="px-6 py-4 text-center text-slate-500">—</td>
                        <td className="px-6 py-4 text-center text-slate-500">—</td>
                        <td className="px-6 py-4 text-right text-slate-500 font-bold">₹0</td>
                      </tr>
                      {/* Premium */}
                      <tr className="hover:bg-slate-750 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-crimson-400 font-bold flex items-center gap-2"><FaStar /> Premium</span>
                        </td>
                        <td className="px-6 py-4 text-center text-white font-bold">{metrics.planBreakdown.premium}</td>
                        <td className="px-6 py-4 text-center text-slate-300">₹{metrics.revenue?.premiumPrice || 999}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-crimson-500 rounded-full"
                                style={{ width: `${metrics.planBreakdown.premium + metrics.planBreakdown.elite > 0 ? Math.round((metrics.planBreakdown.premium / (metrics.planBreakdown.premium + metrics.planBreakdown.elite)) * 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-crimson-400 text-xs font-bold">
                              {metrics.planBreakdown.premium + metrics.planBreakdown.elite > 0
                                ? Math.round((metrics.planBreakdown.premium / (metrics.planBreakdown.premium + metrics.planBreakdown.elite)) * 100)
                                : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-crimson-400 font-bold text-lg">₹{(metrics.revenue?.premiumRevenue || 0).toLocaleString('en-IN')}</td>
                      </tr>
                      {/* Elite */}
                      <tr className="hover:bg-slate-750 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-gold-400 font-bold flex items-center gap-2"><FaCrown /> Elite</span>
                        </td>
                        <td className="px-6 py-4 text-center text-white font-bold">{metrics.planBreakdown.elite}</td>
                        <td className="px-6 py-4 text-center text-slate-300">₹{metrics.revenue?.elitePrice || 1999}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold-500 rounded-full"
                                style={{ width: `${metrics.planBreakdown.premium + metrics.planBreakdown.elite > 0 ? Math.round((metrics.planBreakdown.elite / (metrics.planBreakdown.premium + metrics.planBreakdown.elite)) * 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-gold-400 text-xs font-bold">
                              {metrics.planBreakdown.premium + metrics.planBreakdown.elite > 0
                                ? Math.round((metrics.planBreakdown.elite / (metrics.planBreakdown.premium + metrics.planBreakdown.elite)) * 100)
                                : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gold-400 font-bold text-lg">₹{(metrics.revenue?.eliteRevenue || 0).toLocaleString('en-IN')}</td>
                      </tr>
                      {/* Total Row */}
                      <tr className="bg-emerald-950/20 border-t-2 border-emerald-900/40">
                        <td className="px-6 py-4 text-emerald-400 font-bold uppercase tracking-wider text-xs" colSpan={4}>Total Monthly Revenue</td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-bold text-xl">₹{(metrics.revenue?.totalRevenue || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Info Note */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-xs text-slate-500 flex items-start gap-3 mb-8">
                  <FaMoneyBillWave className="text-emerald-600 text-xl flex-shrink-0 mt-0.5" />
                  <span>Revenue figures are <strong className="text-slate-400">estimated</strong> based on current active plan counts and prices set in Pricing & Settings.</span>
                </div>

                {/* Paid Subscribers Table */}
                {(() => {
                  const paidUsers = users
                    .filter(u => u.plan !== 'free')
                    .filter(u => {
                      const q = paySearch.toLowerCase();
                      return !q || u.profile?.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                    });
                  const payTotalPages = Math.max(1, Math.ceil(paidUsers.length / PAY_PER_PAGE));
                  const safePay = Math.min(payPage, payTotalPages);
                  const pagedPay = paidUsers.slice((safePay - 1) * PAY_PER_PAGE, safePay * PAY_PER_PAGE);
                  return (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-white font-bold text-lg">Paid Subscribers</h3>
                          <p className="text-slate-500 text-xs mt-0.5">{paidUsers.length} active paid users</p>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                          <input
                            type="text"
                            value={paySearch}
                            onChange={e => { setPaySearch(e.target.value); setPayPage(1); }}
                            placeholder="Search subscriber..."
                            className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-600 placeholder:text-slate-500 w-56"
                          />
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
                            <tr>
                              <th className="px-4 py-4 text-left">#</th>
                              <th className="px-4 py-4 text-left">Subscriber</th>
                              <th className="px-4 py-4 text-center">Plan</th>
                              <th className="px-4 py-4 text-center">Amount / Month</th>
                              <th className="px-4 py-4 text-center">Joined</th>
                              <th className="px-4 py-4 text-center">Views Used</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {pagedPay.length === 0 ? (
                              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No paid subscribers found.</td></tr>
                            ) : pagedPay.map((u, idx) => (
                              <tr key={u._id} className="hover:bg-slate-750 transition-colors">
                                <td className="px-4 py-4 text-slate-600 text-xs font-bold">{(safePay - 1) * PAY_PER_PAGE + idx + 1}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-crimson-900 flex items-center justify-center font-bold text-crimson-400 text-sm flex-shrink-0">
                                      {u.profile ? u.profile.name[0] : u.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-white text-sm">{u.profile?.name || 'No Profile'}</p>
                                      <p className="text-xs text-slate-400">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-flex items-center gap-1.5 font-bold capitalize text-xs px-3 py-1 rounded-full ${u.plan === 'elite' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30' : 'bg-crimson-500/10 text-crimson-400 border border-crimson-500/30'}`}>
                                    {u.plan === 'elite' ? <FaCrown className="text-xs" /> : <FaStar className="text-xs" />}
                                    {u.plan}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center font-bold">
                                  <span className={u.plan === 'elite' ? 'text-gold-400' : 'text-crimson-400'}>
                                    ₹{u.plan === 'elite'
                                      ? (metrics.revenue?.elitePrice || 1999).toLocaleString('en-IN')
                                      : (metrics.revenue?.premiumPrice || 999).toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center text-slate-400 text-xs">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="px-4 py-4 text-center text-slate-300">
                                  {u.viewedCount} / {u.viewLimit > 9000 ? '∞' : u.viewLimit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {payTotalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                          <p className="text-xs text-slate-500">Showing {(safePay - 1) * PAY_PER_PAGE + 1}–{Math.min(safePay * PAY_PER_PAGE, paidUsers.length)} of {paidUsers.length}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={safePay === 1} className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40">← Prev</button>
                            {Array.from({ length: payTotalPages }, (_, i) => i + 1).map(pg => (
                              <button key={pg} onClick={() => setPayPage(pg)} className={`w-8 h-8 text-xs font-bold rounded-lg ${pg === safePay ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>{pg}</button>
                            ))}
                            <button onClick={() => setPayPage(p => Math.min(payTotalPages, p + 1))} disabled={safePay === payTotalPages} className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40">Next →</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}


            {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (() => {
              const q = userSearch.toLowerCase();
              const unverified = users.filter(u =>
                !(u.profile?.user?.isManuallyVerified || u.isManuallyVerified) &&
                (!q || u.profile?.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
              );
              const appTotalPages = Math.max(1, Math.ceil(unverified.length / APPROVAL_PER_PAGE));
              const safeApp = Math.min(approvalPage, appTotalPages);
              const pagedApp = unverified.slice((safeApp - 1) * APPROVAL_PER_PAGE, safeApp * APPROVAL_PER_PAGE);
              return (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Pending Approvals</h1>
                <p className="text-slate-400 mb-4">Review new profiles before they go live on the platform.</p>
                <div className="relative mb-6">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setApprovalPage(1); }}
                    placeholder="Search by name or email..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-600 placeholder:text-slate-500 max-w-md"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unverified.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">
                      <FaCheckCircle className="text-4xl text-crimson-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white mb-1">Queue is empty</h3>
                      <p>All profiles have been manually verified.</p>
                    </div>
                  ) : (
                    pagedApp.map(u => (
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
                {/* Pagination */}
                {appTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-xs text-slate-500">Showing {(safeApp - 1) * APPROVAL_PER_PAGE + 1}–{Math.min(safeApp * APPROVAL_PER_PAGE, unverified.length)} of {unverified.length} pending</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setApprovalPage(p => Math.max(1, p - 1))} disabled={safeApp === 1} className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                      {Array.from({ length: appTotalPages }, (_, i) => i + 1).map(pg => (
                        <button key={pg} onClick={() => setApprovalPage(pg)} className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${pg === safeApp ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>{pg}</button>
                      ))}
                      <button onClick={() => setApprovalPage(p => Math.min(appTotalPages, p + 1))} disabled={safeApp === appTotalPages} className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                    </div>
                  </div>
                )}
              </>
              );
            })()}

            {/* USERS TAB */}
            {activeTab === 'users' && (() => {
              const filteredUsers = users.filter(u => {
                const q = userSearch.toLowerCase();
                const nameMatch = u.profile?.name?.toLowerCase().includes(q);
                const emailMatch = u.email?.toLowerCase().includes(q);
                const planMatch = planFilter === 'all' || u.plan === planFilter;
                return (nameMatch || emailMatch) && planMatch;
              });
              const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
              const safePage = Math.min(userPage, totalPages);
              const pagedUsers = filteredUsers.slice((safePage - 1) * USERS_PER_PAGE, safePage * USERS_PER_PAGE);
              return (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <h1 className="text-3xl font-serif font-bold text-white">User Database</h1>
                  <button 
                    onClick={() => setIsOfflineModalOpen(true)}
                    className="bg-gold-gradient text-crimson-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:scale-[1.02] transition-all self-start md:self-auto"
                  >
                    <FaPlus /> Add Offline User
                  </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                      placeholder="Search by name or email..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-crimson-600 placeholder:text-slate-500"
                    />
                  </div>
                  <select
                    value={planFilter}
                    onChange={e => { setPlanFilter(e.target.value); setUserPage(1); }}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-crimson-600"
                  >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Elite</option>
                  </select>
                  <span className="text-xs text-slate-500 self-center whitespace-nowrap">{filteredUsers.length} / {users.length} users</span>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 uppercase font-bold text-xs">
                        <tr>
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Plan</th>
                          <th className="px-6 py-4">View Limit</th>
                          <th className="px-6 py-4">Verification</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {pagedUsers.map(u => (
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
                              <div className="flex items-center gap-2">
                                {u.plan === 'elite' ? <FaCrown className="text-gold-500" /> : u.plan === 'premium' ? <FaStar className="text-crimson-500" /> : null}
                                <span className={`font-bold capitalize ${u.plan === 'elite' ? 'text-gold-500' : u.plan === 'premium' ? 'text-crimson-500' : 'text-slate-400'}`}>
                                  {u.plan}
                                </span>
                              </div>
                            </td>
                            {/* Inline View Limit Editor */}
                            <td className="px-6 py-4">
                              {editingLimitId === u._id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editingLimitValue}
                                    onChange={e => setEditingLimitValue(e.target.value)}
                                    className="w-20 bg-slate-900 border border-blue-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={async () => {
                                      await handleUpdateLimit(u._id, editingLimitValue);
                                      setEditingLimitId(null);
                                    }}
                                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg"
                                  >✓</button>
                                  <button
                                    onClick={() => setEditingLimitId(null)}
                                    className="text-xs text-slate-500 hover:text-white px-1"
                                  >✕</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setEditingLimitId(u._id); setEditingLimitValue(u.viewLimit); }}
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 group"
                                >
                                  <span className="font-bold">{u.viewLimit > 9000 ? '∞ Unlimited' : u.viewLimit}</span>
                                  <span className="text-slate-600 group-hover:text-blue-400"><FaEdit /></span>
                                </button>
                              )}
                              <p className="text-xs text-slate-600 mt-0.5">Used: {u.viewedCount}</p>
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
                                <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors" title="Delete User">
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && <div className="p-8 text-center text-slate-500">No users match your search.</div>}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                      <p className="text-xs text-slate-500">
                        Showing {(safePage - 1) * USERS_PER_PAGE + 1}–{Math.min(safePage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setUserPage(p => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                          className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                          <button
                            key={pg}
                            onClick={() => setUserPage(pg)}
                            className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                              pg === safePage
                                ? 'bg-crimson-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                          >
                            {pg}
                          </button>
                        ))}
                        <button
                          onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
                          disabled={safePage === totalPages}
                          className="px-3 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
              );
            })()}

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
              <div className="max-w-4xl">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Platform Pricing & Settings</h1>
                <p className="text-slate-400 mb-8">Manage pricing tiers and dynamically control features for each subscription tier.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  
                  {/* Left Column: Price, Mode & Support Contacts */}
                  <div className="space-y-8">
                    {/* Price & Mode Card */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg space-y-6">
                      <h2 className="text-xl font-serif font-bold text-white border-b border-slate-700 pb-3">Plan Prices & Gateways</h2>
                      
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
                    </div>

                    {/* Support Config Card */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg space-y-6">
                      <h2 className="text-xl font-serif font-bold text-white border-b border-slate-700 pb-3">Support Contacts Config</h2>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Direct Call Phone Number</label>
                        <input 
                          type="text" 
                          value={settings.supportPhone || ''} 
                          onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                          placeholder="+91 73860 83446"
                          className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-400 uppercase tracking-wider">WhatsApp Contact (with country code)</label>
                        <input 
                          type="text" 
                          value={settings.supportWhatsApp || ''} 
                          onChange={(e) => setSettings({...settings, supportWhatsApp: e.target.value})}
                          placeholder="+917386083446"
                          className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-crimson-400 uppercase tracking-wider">Support Email Address</label>
                        <input 
                          type="email" 
                          value={settings.supportEmail || ''} 
                          onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                          placeholder="shaikhabeebiti@gmail.com"
                          className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-crimson-500 transition-colors"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-700 space-y-4">
                        <h3 className="text-md font-bold text-white">Elite Dedicated Manager Settings</h3>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gold-400 uppercase tracking-wider">Manager Name</label>
                          <input 
                            type="text" 
                            value={settings.eliteManagerName || ''} 
                            onChange={(e) => setSettings({...settings, eliteManagerName: e.target.value})}
                            placeholder="Shaik Habib"
                            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gold-400 uppercase tracking-wider">Manager Phone/WhatsApp</label>
                          <input 
                            type="text" 
                            value={settings.eliteManagerPhone || ''} 
                            onChange={(e) => setSettings({...settings, eliteManagerPhone: e.target.value})}
                            placeholder="+91 70759 00448"
                            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Privilege Matrix */}
                  <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg space-y-6">
                    <h2 className="text-xl font-serif font-bold text-white border-b border-slate-700 pb-3">Dynamic Plan Controls</h2>

                    {/* Free Plan */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Free Tier Privileges</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.freePlanFeatures?.viewFullBio || false} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, viewFullBio: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          View Full Bio
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.freePlanFeatures?.viewContactDetails || false} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, viewContactDetails: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          View Contacts
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.freePlanFeatures?.chat || false} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, chat: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Halal Chat
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.freePlanFeatures?.shortlist || false} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, shortlist: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Shortlisting
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.freePlanFeatures?.advancedFilters || false} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, advancedFilters: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Advanced Filters
                        </label>
                      </div>
                      <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Daily Profile Views:</label>
                          <input type="number" value={settings.freePlanFeatures?.dailyViewLimit ?? 0} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, dailyViewLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Daily Interests:</label>
                          <input type="number" value={settings.freePlanFeatures?.dailyInterestLimit ?? 0} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, dailyInterestLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Contact Views Limit:</label>
                          <input type="number" value={settings.freePlanFeatures?.contactViewLimit ?? 0} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, contactViewLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Profile Boost Level:</label>
                          <input type="number" value={settings.freePlanFeatures?.profileBoost ?? 0} onChange={(e) => setSettings({ ...settings, freePlanFeatures: { ...settings.freePlanFeatures, profileBoost: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
                      <span className="text-xs font-bold text-crimson-400 uppercase tracking-widest block">Premium Tier Privileges</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.premiumPlanFeatures?.viewFullBio || false} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, viewFullBio: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          View Full Bio
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.premiumPlanFeatures?.viewContactDetails || false} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, viewContactDetails: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          View Contacts
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.premiumPlanFeatures?.chat || false} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, chat: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Halal Chat
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.premiumPlanFeatures?.shortlist || false} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, shortlist: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Shortlisting
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.premiumPlanFeatures?.advancedFilters || false} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, advancedFilters: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Advanced Filters
                        </label>
                      </div>
                      <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Daily Profile Views:</label>
                          <input type="number" value={settings.premiumPlanFeatures?.dailyViewLimit ?? 0} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, dailyViewLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Daily Interests:</label>
                          <input type="number" value={settings.premiumPlanFeatures?.dailyInterestLimit ?? 0} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, dailyInterestLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Contact Views Limit:</label>
                          <input type="number" value={settings.premiumPlanFeatures?.contactViewLimit ?? 0} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, contactViewLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Profile Boost Level:</label>
                          <input type="number" value={settings.premiumPlanFeatures?.profileBoost ?? 0} onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: { ...settings.premiumPlanFeatures, profileBoost: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Elite Plan */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
                      <span className="text-xs font-bold text-gold-400 uppercase tracking-widest block">Elite Tier Privileges</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.elitePlanFeatures?.viewFullBio || false} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, viewFullBio: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          View Full Bio
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.elitePlanFeatures?.viewContactDetails || false} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, viewContactDetails: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          View Contacts
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.elitePlanFeatures?.chat || false} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, chat: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Halal Chat
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.elitePlanFeatures?.shortlist || false} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, shortlist: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Shortlisting
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="checkbox" checked={settings.elitePlanFeatures?.advancedFilters || false} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, advancedFilters: e.target.checked } })} className="rounded bg-slate-800 border-slate-600 text-crimson-600 focus:ring-0" />
                          Advanced Filters
                        </label>
                      </div>
                      <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Daily Profile Views:</label>
                          <input type="number" value={settings.elitePlanFeatures?.dailyViewLimit ?? 0} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, dailyViewLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Daily Interests:</label>
                          <input type="number" value={settings.elitePlanFeatures?.dailyInterestLimit ?? 0} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, dailyInterestLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Contact Views Limit:</label>
                          <input type="number" value={settings.elitePlanFeatures?.contactViewLimit ?? 0} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, contactViewLimit: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-400">Profile Boost Level:</label>
                          <input type="number" value={settings.elitePlanFeatures?.profileBoost ?? 0} onChange={(e) => setSettings({ ...settings, elitePlanFeatures: { ...settings.elitePlanFeatures, profileBoost: parseInt(e.target.value) || 0 } })} className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs text-center focus:outline-none" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={saveSettings}
                    className="bg-gold-gradient hover:scale-[1.01] transition-transform text-crimson-950 font-bold px-8 py-4 rounded-xl shadow-lg mt-4"
                  >
                    Save All Settings & Controls
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS STORIES TAB */}
            {activeTab === 'success-stories' && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Success Stories</h1>
                    <p className="text-slate-400 text-sm">Add and publish verified Muslim union stories onto the homepage plaque.</p>
                  </div>
                  <button 
                    onClick={handleOpenStoryAdd}
                    className="bg-gold-gradient text-crimson-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <FaPlus /> Add New Story
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {successStories.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 bg-slate-800 rounded-2xl border border-slate-700">
                      <FaHeart className="text-4xl text-crimson-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white mb-1">No success stories yet</h3>
                      <p>Add couples' matches to display on the landing page.</p>
                    </div>
                  ) : (
                    successStories.map(story => (
                      <div key={story._id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between shadow-lg relative">
                        <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded border ${story.isPublished ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/50' : 'text-slate-400 bg-slate-900/20 border-slate-800'}`}>
                          {story.isPublished ? 'Published' : 'Hidden'}
                        </span>

                        <div>
                          {/* Image previews inside card */}
                          {story.images && story.images.length > 0 ? (
                            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 max-w-[calc(100%-80px)]">
                              {story.images.map((imgUrl, i) => (
                                <img 
                                  key={i} 
                                  src={`${SOCKET_BASE_URL}${imgUrl}`} 
                                  alt="Couple" 
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-700 hover:scale-105 transition-transform" 
                                />
                              ))}
                            </div>
                          ) : story.image ? (
                            <div className="mb-4">
                              <img 
                                src={`${SOCKET_BASE_URL}${story.image}`} 
                                alt="Couple" 
                                className="w-12 h-12 object-cover rounded-lg border border-slate-700" 
                              />
                            </div>
                          ) : null}

                          <h4 className="text-lg font-serif font-bold text-white mb-1">{story.partnerOne} & {story.partnerTwo}</h4>
                          <span className="text-xs text-slate-500 font-medium tracking-wide block mb-4">{story.location} • {story.marriageDate ? new Date(story.marriageDate).toLocaleDateString() : 'N/A'}</span>
                          <p className="text-sm text-slate-300 italic mb-6 leading-relaxed">"{story.story}"</p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-700">
                          <button onClick={() => handleOpenStoryEdit(story)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5">
                            <FaEdit /> Edit Details
                          </button>
                          <button onClick={() => handleDeleteStory(story._id)} className="p-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg transition-colors">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* KYC VERIFICATION TAB */}
            {activeTab === 'kyc-verification' && (
              <>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">KYC Verification Queue</h1>
                <p className="text-slate-400 mb-6">Review government ID uploads and verify user identity manually.</p>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
                  <div className="relative flex-1 w-full md:w-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                    <input
                      type="text"
                      value={kycSearch}
                      onChange={e => setKycSearch(e.target.value)}
                      placeholder="Search by user name, email or ID name..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-600 placeholder:text-slate-500"
                    />
                  </div>
                  <select
                    value={kycFilter}
                    onChange={e => setKycFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-600 w-full md:w-auto"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All Statuses</option>
                  </select>
                </div>

                {/* Table */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-slate-400 uppercase font-bold text-xs">
                        <tr>
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">ID Details</th>
                          <th className="px-6 py-4">Submitted Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {kycRequests
                          .filter(req => {
                            const q = kycSearch.toLowerCase();
                            const nameMatch = req.profile?.name?.toLowerCase().includes(q);
                            const emailMatch = req.user?.email?.toLowerCase().includes(q);
                            const idNameMatch = req.fullNameOnId?.toLowerCase().includes(q);
                            return !q || nameMatch || emailMatch || idNameMatch;
                          })
                          .map(req => (
                            <tr key={req._id} className="hover:bg-slate-750 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center font-bold text-emerald-400">
                                    {req.profile?.name ? req.profile.name[0] : req.user?.email ? req.user.email[0].toUpperCase() : '?'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">{req.profile?.name || 'No Profile'}</p>
                                    <p className="text-xs text-slate-400">{req.user?.email}</p>
                                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                                      req.user?.plan === 'elite' 
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
                                        : req.user?.plan === 'premium' 
                                          ? 'bg-crimson-500/10 text-crimson-400 border border-crimson-500/20' 
                                          : 'bg-slate-700/30 text-slate-400 border border-slate-650'
                                    }`}>
                                      {req.user?.plan?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-white capitalize">{req.idType}</p>
                                <p className="text-xs text-slate-300 font-semibold">{req.fullNameOnId}</p>
                                {req.idNumber && <p className="text-xs text-slate-400 font-mono">No: {req.idNumber}</p>}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-400">
                                {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                  req.status === 'approved' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35' 
                                    : req.status === 'rejected' 
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/35' 
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/35'
                                }`}>
                                  {req.status === 'approved' ? 'Approved ✓' : req.status === 'rejected' ? 'Rejected ✕' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedKyc(req);
                                    setKycAdminNote(req.adminNote || '');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {kycRequests.length === 0 && (
                      <div className="p-8 text-center text-slate-500">No KYC requests found matching current filter.</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* SUGGEST MATCH TAB */}
            {activeTab === 'suggest-match' && (
              <div className="max-w-4xl">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Manual Match Recommendation</h1>
                <p className="text-slate-400 mb-8">Select two users to recommend as mutual matches. Both will receive real-time notifications linking to each other's profiles.</p>

                <form onSubmit={handleSuggestMatchSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* User A Selection */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 relative">
                      <h3 className="text-lg font-bold text-crimson-400 border-b border-slate-700 pb-2 flex items-center justify-between">
                        <span>User A (First Match Partner)</span>
                        {matchUserA && (
                          <button 
                            type="button" 
                            onClick={() => { setMatchUserA(''); setMatchSearchA(''); }} 
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Reset
                          </button>
                        )}
                      </h3>

                      {!matchUserA ? (
                        <div className="space-y-2 relative">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search & Select Member</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                            <input
                              type="text"
                              value={matchSearchA}
                              onChange={e => setMatchSearchA(e.target.value)}
                              placeholder="Type name or email..."
                              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-crimson-500"
                            />
                          </div>

                          {/* Search Results A */}
                          {matchSearchA && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-slate-800">
                              {users
                                .filter(u => u.profile && u._id !== matchUserB && (
                                  u.profile.name.toLowerCase().includes(matchSearchA.toLowerCase()) || 
                                  u.email.toLowerCase().includes(matchSearchA.toLowerCase())
                                ))
                                .slice(0, 5)
                                .map(u => (
                                  <button
                                    key={u._id}
                                    type="button"
                                    onClick={() => {
                                      setMatchUserA(u._id);
                                      setMatchSearchA('');
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-xs flex items-center justify-between transition-colors"
                                  >
                                    <div>
                                      <p className="font-bold text-white">{u.profile.name}</p>
                                      <p className="text-slate-400">{u.email} ({u.profile.gender})</p>
                                    </div>
                                    <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded uppercase font-bold">
                                      {u.plan}
                                    </span>
                                  </button>
                                ))}
                              {users.filter(u => u.profile && u._id !== matchUserB && (
                                u.profile.name.toLowerCase().includes(matchSearchA.toLowerCase()) || 
                                u.email.toLowerCase().includes(matchSearchA.toLowerCase())
                              )).length === 0 && (
                                <div className="p-3 text-slate-500 text-xs text-center">No profiles found</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        (() => {
                          const u = users.find(usr => usr._id === matchUserA);
                          if (!u) return null;
                          return (
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-750 flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-crimson-900 flex items-center justify-center font-bold text-crimson-400 text-lg flex-shrink-0">
                                {u.profile.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{u.profile.name}</p>
                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                  <div><span className="text-slate-500">Gender: </span><span className="text-slate-300 font-bold capitalize">{u.profile.gender}</span></div>
                                  <div><span className="text-slate-500">Age: </span><span className="text-slate-300 font-bold">{u.profile.age} yrs</span></div>
                                  <div><span className="text-slate-500">City: </span><span className="text-slate-300 font-bold">{u.profile.city}</span></div>
                                  <div><span className="text-slate-500">Sect: </span><span className="text-slate-300 font-bold">{u.profile.sect}</span></div>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>

                    {/* User B Selection */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 relative">
                      <h3 className="text-lg font-bold text-indigo-400 border-b border-slate-700 pb-2 flex items-center justify-between">
                        <span>User B (Second Match Partner)</span>
                        {matchUserB && (
                          <button 
                            type="button" 
                            onClick={() => { setMatchUserB(''); setMatchSearchB(''); }} 
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Reset
                          </button>
                        )}
                      </h3>

                      {!matchUserB ? (
                        <div className="space-y-2 relative">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search & Select Member</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                            <input
                              type="text"
                              value={matchSearchB}
                              onChange={e => setMatchSearchB(e.target.value)}
                              placeholder="Type name or email..."
                              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Search Results B */}
                          {matchSearchB && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-slate-800">
                              {users
                                .filter(u => u.profile && u._id !== matchUserA && (
                                  u.profile.name.toLowerCase().includes(matchSearchB.toLowerCase()) || 
                                  u.email.toLowerCase().includes(matchSearchB.toLowerCase())
                                ))
                                .slice(0, 5)
                                .map(u => (
                                  <button
                                    key={u._id}
                                    type="button"
                                    onClick={() => {
                                      setMatchUserB(u._id);
                                      setMatchSearchB('');
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-xs flex items-center justify-between transition-colors"
                                  >
                                    <div>
                                      <p className="font-bold text-white">{u.profile.name}</p>
                                      <p className="text-slate-400">{u.email} ({u.profile.gender})</p>
                                    </div>
                                    <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded uppercase font-bold">
                                      {u.plan}
                                    </span>
                                  </button>
                                ))}
                              {users.filter(u => u.profile && u._id !== matchUserA && (
                                u.profile.name.toLowerCase().includes(matchSearchB.toLowerCase()) || 
                                u.email.toLowerCase().includes(matchSearchB.toLowerCase())
                              )).length === 0 && (
                                <div className="p-3 text-slate-500 text-xs text-center">No profiles found</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        (() => {
                          const u = users.find(usr => usr._id === matchUserB);
                          if (!u) return null;
                          return (
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-750 flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-indigo-400 text-lg flex-shrink-0">
                                {u.profile.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{u.profile.name}</p>
                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                  <div><span className="text-slate-500">Gender: </span><span className="text-slate-300 font-bold capitalize">{u.profile.gender}</span></div>
                                  <div><span className="text-slate-500">Age: </span><span className="text-slate-300 font-bold">{u.profile.age} yrs</span></div>
                                  <div><span className="text-slate-500">City: </span><span className="text-slate-300 font-bold">{u.profile.city}</span></div>
                                  <div><span className="text-slate-500">Sect: </span><span className="text-slate-300 font-bold">{u.profile.sect}</span></div>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  {/* Recommendation message note */}
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-2">
                    <label className="text-sm font-bold text-white uppercase tracking-wider block">Recommendation Message (Sent to both)</label>
                    <textarea
                      rows={4}
                      value={matchMessage}
                      onChange={e => setMatchMessage(e.target.value)}
                      placeholder="Write a custom recommendation message. E.g. 'Both of you are Software Engineers based out of Hyderabad with identical religious preferences. We highly suggest initiating a chat!'"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!matchUserA || !matchUserB}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Send Match Suggestion
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}
      </div>

      {/* SUCCESS STORY MODAL */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fadeIn text-slate-200">
            <h3 className="text-xl font-serif font-bold text-white mb-2">{storyForm._id ? 'Edit Success Story' : 'Add Success Story'}</h3>
            <p className="text-xs text-slate-400 mb-6">Describe the couples' journey. This will be formatted on the home plaque.</p>
            
            <form onSubmit={handleSaveStory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner One Name</label>
                  <input required type="text" value={storyForm.partnerOne} onChange={(e) => setStoryForm({...storyForm, partnerOne: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Two Name</label>
                  <input required type="text" value={storyForm.partnerTwo} onChange={(e) => setStoryForm({...storyForm, partnerTwo: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location / City</label>
                  <input required type="text" value={storyForm.location} onChange={(e) => setStoryForm({...storyForm, location: e.target.value})} placeholder="e.g. Lucknow" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marriage Date (Optional)</label>
                  <input type="date" value={storyForm.marriageDate ? storyForm.marriageDate.split('T')[0] : ''} onChange={(e) => setStoryForm({...storyForm, marriageDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Couples' Testimonial Story</label>
                <textarea required rows={4} value={storyForm.story} onChange={(e) => setStoryForm({...storyForm, story: e.target.value})} placeholder="Write a short summary of their matrimony journey..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-gold-500 resize-none" />
              </div>

              {/* Couple Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Couple Images (Single or Multiple)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-750 cursor-pointer focus:outline-none"
                />

                {(existingImagesList.length > 0 || selectedFiles.length > 0) && (
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {/* Existing Images */}
                    {existingImagesList.map((imgUrl, idx) => (
                      <div key={`exist-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                        <img src={`${SOCKET_BASE_URL}${imgUrl}`} className="w-full h-full object-cover" alt="Existing Couple" />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute inset-0 bg-red-950/85 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-[10px] font-bold transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {/* New Uploads Previews */}
                    {selectedFiles.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                          <img src={objectUrl} className="w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSelectedFile(idx)}
                            className="absolute inset-0 bg-red-950/85 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-[10px] font-bold transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2 text-sm">
                <input type="checkbox" checked={storyForm.isPublished} onChange={(e) => setStoryForm({...storyForm, isPublished: e.target.checked})} className="rounded bg-slate-800 border-slate-700 text-crimson-600 focus:ring-0" />
                <span>Publish instantly on Landing Page</span>
              </label>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsStoryModalOpen(false)} className="px-4 py-2 text-slate-400 font-bold hover:bg-slate-800 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-crimson-600 hover:bg-crimson-500 text-white font-bold rounded-lg text-sm transition-colors">Save Story</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFLINE USER REGISTRATION MODAL */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8 text-slate-200">
            <h3 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2"><FaPlus /> Offline User Registration</h3>
            <p className="text-xs text-slate-400 mb-6">Manually setup a walking or phone-in customer profile. This automatically verifies their account.</p>
            
            <form onSubmit={handleCreateOfflineUser} className="space-y-4">
              
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-850 pb-1">1. Credentials & Plan Settings</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input required type="email" value={offlineForm.email} onChange={(e) => setOfflineForm({...offlineForm, email: e.target.value})} placeholder="user@gmail.com" className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temporary Password</label>
                    <input required type="text" value={offlineForm.password} onChange={(e) => setOfflineForm({...offlineForm, password: e.target.value})} placeholder="Pass1234" className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Tier Selection</label>
                    <select value={offlineForm.plan} onChange={(e) => setOfflineForm({...offlineForm, plan: e.target.value})} className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                      <option value="free">Free Tier</option>
                      <option value="premium">Premium Tier</option>
                      <option value="elite">Elite Tier</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-850 pb-1">2. Biodata & Personal Profile Details</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input required type="text" value={offlineForm.name} onChange={(e) => setOfflineForm({...offlineForm, name: e.target.value})} placeholder="Member Name" className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
                    <input required type="number" value={offlineForm.age} onChange={(e) => setOfflineForm({...offlineForm, age: e.target.value})} placeholder="25" className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                    <select value={offlineForm.gender} onChange={(e) => setOfflineForm({...offlineForm, gender: e.target.value})} className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sect</label>
                    <select value={offlineForm.sect} onChange={(e) => setOfflineForm({...offlineForm, sect: e.target.value})} className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                      <option value="Sunni">Sunni</option>
                      <option value="Shia">Shia</option>
                      <option value="Other">Other / Any</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City Location</label>
                    <input required type="text" value={offlineForm.city} onChange={(e) => setOfflineForm({...offlineForm, city: e.target.value})} placeholder="e.g. Hyderabad" className="w-full bg-slate-855 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profession</label>
                    <input required type="text" value={offlineForm.profession} onChange={(e) => setOfflineForm({...offlineForm, profession: e.target.value})} placeholder="Software Engineer" className="w-full bg-slate-855 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Education</label>
                    <input required type="text" value={offlineForm.education} onChange={(e) => setOfflineForm({...offlineForm, education: e.target.value})} placeholder="B.Tech" className="w-full bg-slate-855 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone / Wali Contact</label>
                    <input required type="text" value={offlineForm.phoneNumber} onChange={(e) => setOfflineForm({...offlineForm, phoneNumber: e.target.value})} placeholder="+91 90000 00000" className="w-full bg-slate-855 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Short description (About profile)</label>
                  <textarea rows={2} value={offlineForm.about} onChange={(e) => setOfflineForm({...offlineForm, about: e.target.value})} placeholder="Write details about physical build, deen level, and background..." className="w-full bg-slate-850 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none resize-none" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 animate-fadeIn">
                <button type="button" onClick={() => setIsOfflineModalOpen(false)} className="px-4 py-2 text-slate-400 font-bold hover:bg-slate-800 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-crimson-600 hover:bg-crimson-500 text-white font-bold rounded-lg text-sm transition-colors">Register User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
