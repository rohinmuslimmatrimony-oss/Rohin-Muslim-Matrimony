import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';
import { FaFilter, FaSearch, FaTimes, FaCrown, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LogoLoader from '../components/LogoLoader';
import MobileSearchPage from '../components/MobileSearchPage';

const PremiumWarningModal = ({ isOpen, onClose, featureName, navigate }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl text-center transform scale-100 animate-zoomIn border border-slate-100" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f8e9de] to-[#e8d2c0] flex items-center justify-center mx-auto mb-5 shadow-inner">
          <FaCrown className="text-3xl text-[#c28b1e]" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 mb-2">Premium Feature</h3>
        <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
          <span className="text-[#e61a52] font-bold">{featureName}</span> is locked. Upgrade your membership plan to unlock advanced filters and find your perfect match faster!
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { onClose(); navigate('/plans'); }} 
            className="w-full bg-gradient-to-r from-[#9b664d] to-[#80503a] text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Upgrade Now
          </button>
          <button 
            onClick={onClose} 
            className="w-full text-slate-500 font-semibold py-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchProfiles = () => {
  const { user, profile, getCompleteness } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [premiumModalFeature, setPremiumModalFeature] = useState(null);

  const isPremium = user?.plan === 'premium' || user?.plan === 'elite';

  const handlePremiumClick = (e, featureName) => {
    if (!isPremium) {
      e.preventDefault();
      setPremiumModalFeature(featureName);
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);

  // Filters State
  const [filters, setFilters] = useState({
    gender: '', // Empty means backend will use default opposite gender
    ageMin: 18,
    ageMax: 60,
    sect: 'All',
    maritalStatus: '',
    profession: '',
    city: ''
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchProfiles(filters, 1);
    fetchMyRequests();
  }, []);

  const fetchProfiles = async (currentFilters = filters, page = 1) => {
    try {
      setLoading(true);
      // Clean empty filters
      const queryParams = Object.keys(currentFilters).reduce((acc, key) => {
        if (currentFilters[key] !== '' && currentFilters[key] !== 'All') {
          acc[key] = currentFilters[key];
        }
        return acc;
      }, {});

      queryParams.page = page;
      queryParams.limit = 6;

      const res = await api.get('/profiles', { params: queryParams });
      if (res.data.success) {
        setProfiles(res.data.data);
        setCurrentPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalProfiles(res.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      // Assuming GET /requests returns sent & received requests
      const res = await api.get('/requests');
      if (res.data.success) {
        const sent = res.data.sent.map(r => r.receiver?._id || r.receiver);
        const received = res.data.received.map(r => r.sender?._id || r.sender);
        setSentRequests(sent);
        setReceivedRequests(received);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      setCurrentPage(1);
      fetchProfiles(filters, 1);
      setIsFilterOpen(false);
    } else if (e && typeof e === 'object') {
      // Called from mobile with local filters object - normalize all keys
      const fullFilters = {
        gender: e.gender || '',
        ageMin: e.ageMin || 18,
        ageMax: e.ageMax || 60,
        sect: e.sect || 'All',
        maritalStatus: e.maritalStatus || '',
        profession: e.profession || '',
        city: e.city || ''
      };
      setFilters(fullFilters);
      setCurrentPage(1);
      fetchProfiles(fullFilters, 1);
    } else {
      setCurrentPage(1);
      fetchProfiles(filters, 1);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      gender: '',
      ageMin: 18,
      ageMax: 60,
      sect: 'All',
      maritalStatus: '',
      profession: '',
      city: ''
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    fetchProfiles(defaultFilters, 1);
  };

  const handleSendInterest = async (receiverId) => {
    if (user?.role !== 'admin') {
      const completeness = getCompleteness().score;
      if (completeness < 100) {
        toast.error('Please complete your profile details to 100% on the Dashboard before sending interest requests!', {
          duration: 5000,
          icon: '🔒',
        });
        return;
      }
    }

    try {
      const res = await api.post(`/requests/send/${receiverId}`);
      if (res.data.success) {
        toast.success('Interest sent successfully!');
        setSentRequests([...sentRequests, receiverId]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    }
  };

  const handleCancelInterest = async (receiverId) => {
    try {
      const res = await api.delete(`/requests/cancel/${receiverId}`);
      if (res.data.success) {
        toast.success("Interest request withdrawn successfully.");
        setSentRequests(sentRequests.filter(id => id !== receiverId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw interest');
    }
  };

  return (
    <>
      {/* MOBILE VIEW (Search Filters as per image-2) */}
      <div className="block lg:hidden">
        <MobileSearchPage 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onApplyFilters={applyFilters} 
        />
      </div>

      {/* DESKTOP VIEW (Standard Search Grid) */}
      <div className="hidden lg:block min-h-screen bg-cream-50 pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:hidden w-full bg-crimson-950 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 mb-4"
        >
          <FaFilter /> {isFilterOpen ? 'Close Filters' : 'Advanced Search Filters'}
        </button>

        {/* Filters Sidebar */}
        <div className={`md:w-1/4 ${isFilterOpen ? 'block' : 'hidden'} md:block transition-all duration-300`}>
          <div className="glass-card p-6 rounded-3xl sticky top-24 border border-crimson-900/10 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-crimson-950 flex items-center gap-2">
                <FaFilter className="text-gold-500 text-sm" /> Filters
              </h2>
              <button 
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-crimson-800 hover:text-gold-600 transition-colors uppercase tracking-wider"
              >
                Reset
              </button>
              {isFilterOpen && <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-slate-500 ml-2"><FaTimes /></button>}
            </div>

            <form onSubmit={applyFilters} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age Range</label>
                <div className="flex gap-2 items-center">
                  <input type="number" name="ageMin" value={filters.ageMin} onChange={handleFilterChange} min={18} max={80} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm" />
                  <span className="text-slate-400">to</span>
                  <input type="number" name="ageMax" value={filters.ageMax} onChange={handleFilterChange} min={18} max={80} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  Sect {!isPremium && <FaLock className="text-[#e61a52] text-[10px]" />}
                </label>
                <div className="relative">
                  <select disabled={!isPremium} name="sect" value={filters.sect} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm disabled:opacity-50">
                    <option value="All">All Sects</option>
                    <option value="Sunni">Sunni</option>
                    <option value="Shia">Shia</option>
                    <option value="Sufi">Sufi</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                  {!isPremium && <div className="absolute inset-0 cursor-pointer" onClick={(e) => handlePremiumClick(e, 'Sect Filter')}></div>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marital Status</label>
                <select name="maritalStatus" value={filters.maritalStatus} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm">
                  <option value="">Any Status</option>
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  City {!isPremium && <FaLock className="text-[#e61a52] text-[10px]" />}
                </label>
                <div className="relative">
                  <input disabled={!isPremium} type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g. Hyderabad" className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm disabled:opacity-50" />
                  {!isPremium && <div className="absolute inset-0 cursor-pointer" onClick={(e) => handlePremiumClick(e, 'City Filter')}></div>}
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  Profession {!isPremium && <FaLock className="text-[#e61a52] text-[10px]" />}
                </label>
                <div className="relative">
                  <input disabled={!isPremium} type="text" name="profession" value={filters.profession} onChange={handleFilterChange} placeholder="e.g. Doctor" className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm disabled:opacity-50" />
                  {!isPremium && <div className="absolute inset-0 cursor-pointer" onClick={(e) => handlePremiumClick(e, 'Profession Filter')}></div>}
                </div>
              </div>

              <button type="submit" className="w-full bg-crimson-950 text-gold-400 font-bold py-3 rounded-xl hover:bg-crimson-900 transition-colors flex items-center justify-center gap-2">
                <FaSearch /> Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Results Grid */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-crimson-950">Discover Matches</h1>
            <span className="text-slate-500 bg-crimson-900/10 px-3 py-1 rounded-full text-sm font-semibold">{totalProfiles} Found</span>
          </div>

          {loading ? (
            <LogoLoader text="Finding your matches..." />
          ) : profiles.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center border border-crimson-900/10 flex flex-col items-center justify-center h-64">
               <span className="text-4xl mb-4">🔍</span>
               <h3 className="text-xl font-bold text-crimson-950 mb-2">No Matches Found</h3>
               <p className="text-slate-500">Try adjusting your filters to broaden your search criteria.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(profile => (
                  <ProfileCard 
                    key={profile._id} 
                    profile={profile} 
                    currentPlan={user?.plan} 
                    onSendInterest={handleSendInterest}
                    onCancelInterest={handleCancelInterest}
                    isSent={sentRequests.includes(profile.user?._id || profile.user)}
                    isReceived={receivedRequests.includes(profile.user?._id || profile.user)}
                  />
                ))}
              </div>

              {/* PAGINATION CONTROLLER */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm max-w-sm mx-auto">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => {
                      const prevPage = currentPage - 1;
                      setCurrentPage(prevPage);
                      fetchProfiles(filters, prevPage);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#4f080e] text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-crimson-900 transition-all uppercase tracking-wider"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-slate-600 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      fetchProfiles(filters, nextPage);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#4f080e] text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-crimson-900 transition-all uppercase tracking-wider"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
    
    <PremiumWarningModal 
      isOpen={!!premiumModalFeature} 
      onClose={() => setPremiumModalFeature(null)} 
      featureName={premiumModalFeature} 
      navigate={navigate} 
    />
    </>
  );
};

export default SearchProfiles;
