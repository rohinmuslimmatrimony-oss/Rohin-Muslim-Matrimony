import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { SOCKET_BASE_URL } from '../services/api';
import ProfileCard from '../components/ProfileCard';
import DefaultAvatar from '../components/DefaultAvatar';
import { FaFilter, FaSearch, FaTimes, FaCrown, FaLock, FaClock, FaHeart, FaCheckCircle, FaStar, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SimpleSpinner from '../components/SimpleSpinner';
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
  const [handpickedMatches, setHandpickedMatches] = useState([]);
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
  const [showMobileResults, setShowMobileResults] = useState(false);

  useEffect(() => {
    fetchProfiles(filters, 1);
    fetchMyRequests();
    fetchHandpickedMatches();
  }, []);

  const fetchHandpickedMatches = async () => {
    try {
      const res = await api.get('/profiles/handpicked');
      if (res.data.success) {
        setHandpickedMatches(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load handpicked matches in search:', err);
    }
  };

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
      setShowMobileResults(true);
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
      {/* MOBILE VIEW FILTER */}
      {!showMobileResults && (
        <div className="block md:hidden">
          <MobileSearchPage 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onApplyFilters={applyFilters} 
          />
        </div>
      )}

      {/* DESKTOP VIEW AND MOBILE RESULTS GRID */}
      <div className={`${showMobileResults ? 'block' : 'hidden md:block'} min-h-screen bg-cream-50 pt-8 pb-12 px-4 md:px-8`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Back Button */}
        {showMobileResults && (
          <div className="md:hidden w-full">
            <button 
              onClick={() => setShowMobileResults(false)}
              className="bg-white text-crimson-900 border border-crimson-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 mb-4 w-full shadow-sm"
            >
              &larr; Back to Search Filters
            </button>
          </div>
        )}

        {/* Filters Sidebar (Desktop) */}
        <div className="hidden md:block md:w-1/3 lg:w-1/4">
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
                    <option value="Ahle Hadees">Ahle Hadees</option>
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
        <div className="lg:w-3/4 w-full space-y-6">
          {/* HANDPICKED MATCHMAKER SUGGESTIONS (24H EXCLUSIVE) */}
          {handpickedMatches.length > 0 && (
            <div className="bg-gradient-to-r from-crimson-950 via-slate-900 to-crimson-900 rounded-3xl p-6 shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
              {/* Background ambient glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-400/20">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-lg">
                    👑
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
                      Handpicked by Matchmaker
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-crimson-950 px-2.5 py-0.5 rounded-full shadow-sm">
                        24h Exclusive
                      </span>
                    </h2>
                    <p className="text-xs text-amber-200/70 font-medium">Personalized recommendations selected specifically for you</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full w-fit">
                  {handpickedMatches.length} Suggestion{handpickedMatches.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Handpicked cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {handpickedMatches.map((m) => {
                  const p = m.partner;
                  if (!p) return null;

                  const isSent = m.isInterestSent || sentRequests.includes(p.user?._id || p.user);
                  const fullPhotoUrl = p.profilePhoto && p.profilePhoto !== '/uploads/default-avatar.png' && p.profilePhoto !== '/uploads/blurred-avatar.png'
                    ? (p.profilePhoto.startsWith('http') ? p.profilePhoto : `${SOCKET_BASE_URL}${p.profilePhoto}`)
                    : null;

                  return (
                    <div 
                      key={m.matchId} 
                      className="bg-slate-900/90 border border-amber-400/30 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all shadow-md backdrop-blur-sm"
                    >
                      <div className="flex gap-3.5 items-start">
                        {/* Avatar */}
                        <div 
                          onClick={() => navigate(`/profile/${p.user?._id || p._id}`)}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/50 flex-shrink-0 cursor-pointer relative bg-slate-800"
                        >
                          {fullPhotoUrl ? (
                            <img src={fullPhotoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <DefaultAvatar gender={p.gender} className="w-full h-full object-contain" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 
                              onClick={() => navigate(`/profile/${p.user?._id || p._id}`)}
                              className="text-base font-bold text-white font-serif hover:text-amber-300 transition-colors cursor-pointer truncate"
                            >
                              {p.name}
                            </h3>
                            <span className="text-[10px] font-black text-amber-300 bg-crimson-950 px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1 flex-shrink-0">
                              <FaClock className="text-amber-400 animate-pulse text-[9px]" /> {m.hoursLeft}h {m.minutesLeft}m left
                            </span>
                          </div>

                          <p className="text-xs text-amber-200/80 font-medium mt-0.5">
                            {p.age} yrs • {p.sect || 'Sunni'} • {p.city || 'India'}
                          </p>

                          {m.message && (
                            <div className="mt-2 bg-amber-500/10 border-l-2 border-amber-400 px-2.5 py-1 rounded-r-md">
                              <p className="text-[11px] text-amber-100/90 italic line-clamp-2">
                                "{m.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => navigate(`/profile/${p.user?._id || p._id}`)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold py-2 px-3 rounded-xl transition-all border border-slate-700 text-center cursor-pointer"
                        >
                          View Biodata
                        </button>

                        {isSent ? (
                          <div className="flex-1 bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1 text-center">
                            <FaCheckCircle className="text-xs" /> Interest Sent
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSendInterest(p.user?._id || p.user)}
                            className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-crimson-950 text-xs font-black py-2 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FaHeart className="text-xs text-crimson-950" /> Send Interest
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-crimson-950">Discover Matches</h1>
            <span className="text-slate-500 bg-crimson-900/10 px-3 py-1 rounded-full text-sm font-semibold">{totalProfiles} Found</span>
          </div>

          {loading ? (
            <SimpleSpinner />
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
