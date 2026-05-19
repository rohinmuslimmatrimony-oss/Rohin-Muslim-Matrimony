import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProfileCard from '../components/ProfileCard';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SearchProfiles = () => {
  const { user } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);

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
    fetchProfiles();
    fetchMyRequests();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      // Clean empty filters
      const queryParams = Object.keys(filters).reduce((acc, key) => {
        if (filters[key] !== '' && filters[key] !== 'All') {
          acc[key] = filters[key];
        }
        return acc;
      }, {});

      const res = await api.get('/profiles', { params: queryParams });
      if (res.data.success) {
        setProfiles(res.data.data);
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
        const sent = res.data.data.filter(r => r.sender._id === user?._id).map(r => r.receiver._id);
        setSentRequests(sent);
      }
    } catch (error) {
      console.error('Failed to fetch requests');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchProfiles();
    setIsFilterOpen(false);
  };

  const handleSendInterest = async (receiverId) => {
    try {
      const res = await api.post('/requests', { receiverId });
      if (res.data.success) {
        toast.success('Interest sent successfully!');
        setSentRequests([...sentRequests, receiverId]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send interest');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pt-20 pb-12 px-4 md:px-8">
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
              {isFilterOpen && <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-slate-500"><FaTimes /></button>}
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sect</label>
                <select name="sect" value={filters.sect} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm">
                  <option value="All">All Sects</option>
                  <option value="Sunni">Sunni</option>
                  <option value="Shia">Shia</option>
                  <option value="Sufi">Sufi</option>
                  <option value="No Preference">No Preference</option>
                </select>
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="e.g. Hyderabad" className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profession</label>
                <input type="text" name="profession" value={filters.profession} onChange={handleFilterChange} placeholder="e.g. Doctor" className="w-full px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm" />
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
            <span className="text-slate-500 bg-crimson-900/10 px-3 py-1 rounded-full text-sm font-semibold">{profiles.length} Found</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="w-10 h-10 border-4 border-crimson-950 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center border border-crimson-900/10 flex flex-col items-center justify-center h-64">
               <span className="text-4xl mb-4">🔍</span>
               <h3 className="text-xl font-bold text-crimson-950 mb-2">No Matches Found</h3>
               <p className="text-slate-500">Try adjusting your filters to broaden your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map(profile => (
                <ProfileCard 
                  key={profile._id} 
                  profile={profile} 
                  currentPlan={user?.plan} 
                  onSendInterest={handleSendInterest}
                  isSent={sentRequests.includes(profile.user?._id || profile.user)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchProfiles;
