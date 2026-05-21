import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChevronLeft, FaSearch, FaCrown, FaHeart, FaGlobeAmericas, 
  FaMapMarkerAlt, FaMapPin, FaGraduationCap, FaMoneyBillWave, 
  FaBriefcase, FaUsers, FaUserFriends, FaChevronDown, FaTimes 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Country, State } from 'country-state-city';

// --- Reusable Components ---

const DualRangeSlider = ({ min, max, minVal, maxVal, onChange, label, formatValue }) => {
  const [minThumb, setMinThumb] = useState(minVal);
  const [maxThumb, setMaxThumb] = useState(maxVal);

  useEffect(() => {
    setMinThumb(minVal);
    setMaxThumb(maxVal);
  }, [minVal, maxVal]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxThumb - 1);
    setMinThumb(value);
    onChange(value, maxThumb);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minThumb + 1);
    setMaxThumb(value);
    onChange(minThumb, value);
  };

  const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-3 shadow-sm">
      <label className="text-xs font-semibold text-slate-600 block mb-3">{label}</label>
      <div className="flex justify-between text-xs font-bold text-slate-800 mb-6">
        <span>Min {formatValue(minThumb)}</span>
        <span>Max {formatValue(maxThumb)}</span>
      </div>
      
      <div className="relative w-full h-1 bg-slate-200 rounded-full mb-2">
        <div 
          className="absolute h-1 bg-[#e61a52] rounded-full"
          style={{ left: `${getPercent(minThumb)}%`, width: `${getPercent(maxThumb) - getPercent(minThumb)}%` }}
        ></div>
        
        <input 
          type="range" min={min} max={max} value={minThumb} onChange={handleMinChange}
          className="absolute w-full -top-2 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
        />
        <input 
          type="range" min={min} max={max} value={maxThumb} onChange={handleMaxChange}
          className="absolute w-full -top-2 appearance-none bg-transparent pointer-events-none z-30 slider-thumb"
        />
      </div>
      
      <style>{`
        input[type=range].slider-thumb::-webkit-slider-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          -webkit-appearance: none;
          background: #faf8f5;
          border: 2px solid #e61a52;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

// Modals
const BottomSheetModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl overflow-hidden animate-slideUp shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-full transition-colors">
            <FaTimes className="text-sm" />
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar pb-10">
          {children}
        </div>
      </div>
    </div>
  );
};

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

const MobileSearchPage = ({ onApplyFilters }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 40,
    heightMin: 4.5,
    heightMax: 6.0,
    maritalStatus: '',
    sect: '',
    caste: '',
    country: '', // Country ISO Code internally
    state: '',   // State ISO Code internally
    motherTongue: '',
    city: '',
    education: '',
    annualIncome: '',
    employedIn: ''
  });

  // Display names for Country/State
  const [displayNames, setDisplayNames] = useState({
    countryName: 'India',
    stateName: 'Any'
  });

  // Set default Country ISO internally for fetching states properly
  useEffect(() => {
    const india = Country.getAllCountries().find(c => c.name === 'India');
    if (india) {
      setFilters(p => ({ ...p, country: india.isoCode }));
    }
  }, []);

  const [activeSheet, setActiveSheet] = useState(null); // Which filter is open in bottom sheet
  const [premiumModalFeature, setPremiumModalFeature] = useState(null); // Feature name for premium modal

  const isPremium = user?.plan === 'premium' || user?.plan === 'elite';

  const handleSearch = () => {
    if (onApplyFilters) {
      onApplyFilters({ ...filters, country: displayNames.countryName, state: displayNames.stateName });
    } else {
      toast.success('Searching profiles...');
      navigate('/dashboard');
    }
  };

  const formatHeight = (val) => {
    const feet = Math.floor(val);
    const inches = Math.round((val - feet) * 10);
    return `${feet}ft ${inches}in`;
  };

  // Option Lists
  const maritalOptions = ['Any', 'Never Married', 'Divorced', 'Separated', 'Widowed', 'Annulled'];
  const tongueOptions = ['Any', 'Urdu', 'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 'Bengali', 'English', 'Arabic'];
  const sectOptions = ['Any', 'Sunni', 'Shia', 'Open to all'];
  const casteOptions = ['Any', 'Syed', 'Sheikh', 'Pathan', 'Ansari', 'Qureshi', 'Mughal', 'Mirza', 'No caste', 'Others'];
  
  // Real world data
  const allCountries = Country.getAllCountries();
  const statesForSelectedCountry = filters.country ? State.getStatesOfCountry(filters.country) : [];

  const cityOptions = ['Any', 'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Vijayawada', 'Guntur'];
  const eduOptions = ['Any', 'B.Tech', 'M.Tech', 'MBBS', 'BSc', 'MSc', 'BCom', 'MBA', 'PhD', 'High School'];
  const incomeOptions = ['Any', 'Below 1L', '1L - 3L', '3L - 5L', '5L - 10L', '10L - 20L', '20L+'];
  const employOptions = ['Any', 'Private Sector', 'Government', 'Business', 'Self Employed', 'Not Working'];

  const handleTriggerClick = (featureName, filterKey) => {
    const premiumFields = ['motherTongue', 'city', 'education', 'annualIncome', 'employedIn'];
    
    if (premiumFields.includes(filterKey) && !isPremium) {
      setPremiumModalFeature(featureName);
    } else {
      setActiveSheet(filterKey);
    }
  };

  // Select Option Helper
  const handleSelectOption = (filterKey, val, displayVal = null) => {
    setFilters(p => ({ ...p, [filterKey]: val === 'Any' ? '' : val }));
    
    if (filterKey === 'country') {
      setDisplayNames(p => ({ ...p, countryName: displayVal || (val === 'Any' ? 'Any' : val) }));
      // Reset state when country changes
      setFilters(p => ({ ...p, state: '' }));
      setDisplayNames(p => ({ ...p, stateName: 'Any' }));
    } else if (filterKey === 'state') {
      setDisplayNames(p => ({ ...p, stateName: displayVal || (val === 'Any' ? 'Any' : val) }));
    }

    setTimeout(() => setActiveSheet(null), 150); // slight delay to show selection
  };

  const renderDropdownTrigger = (icon, label, filterKey, displayValue = null) => {
    const rawVal = filters[filterKey];
    const val = displayValue !== null ? displayValue : (rawVal || 'Any');
    
    return (
      <div 
        onClick={() => handleTriggerClick(label, filterKey)}
        className="bg-white border border-slate-200/80 rounded-2xl p-3 mb-3 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            {icon}
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-medium text-slate-500">{label}</p>
            <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
              {val}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {['motherTongue', 'city', 'education', 'annualIncome', 'employedIn'].includes(filterKey) && !isPremium ? (
            <div className="w-5 h-5 rounded-full bg-[#f3d79b] flex items-center justify-center text-[#c28b1e] shadow-sm">
              <FaCrown className="text-[9px]" />
            </div>
          ) : (
            <div className="text-slate-400">
              <FaChevronDown className="text-[10px]" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to render radio list in bottom sheet
  const renderRadioList = (options, filterKey, isCountryOrState = false) => {
    return (
      <div className="space-y-2">
        {options.map((opt, idx) => {
          let val, display;
          if (isCountryOrState) {
            val = opt.isoCode || 'Any';
            display = opt.name || 'Any';
          } else {
            val = display = opt;
          }
          
          const isSelected = filters[filterKey] === val || (val === 'Any' && !filters[filterKey]);

          return (
            <label key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="text-sm font-semibold text-slate-700">{display}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#e61a52]' : 'border-slate-300'}`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#e61a52]" />}
              </div>
              <input 
                type="radio" 
                name={filterKey}
                className="hidden"
                checked={isSelected}
                onChange={() => handleSelectOption(filterKey, val, display)}
              />
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-outfit relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-[#faf8f5] sticky top-0 z-50 shadow-sm border-b border-slate-200/50">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <FaChevronLeft className="text-[15px]" />
        </button>
        <h1 className="text-[17px] font-extrabold text-slate-800 tracking-wide">Search Profiles</h1>
      </div>

      <div className="px-4 mt-4 space-y-6">
        
        {/* 1. Basic Details */}
        <section>
          <h2 className="text-[13px] font-extrabold text-slate-800 mb-3 uppercase tracking-wider">1. Basic Details</h2>

          <DualRangeSlider 
            label="Age Range"
            min={18} max={60}
            minVal={filters.ageMin} maxVal={filters.ageMax}
            onChange={(min, max) => setFilters(p => ({ ...p, ageMin: min, ageMax: max }))}
            formatValue={(v) => `${v} yrs`}
          />

          <DualRangeSlider 
            label="Height Range"
            min={4.0} max={7.0}
            minVal={filters.heightMin} maxVal={filters.heightMax}
            onChange={(min, max) => setFilters(p => ({ ...p, heightMin: min, heightMax: max }))}
            formatValue={formatHeight}
          />

          {renderDropdownTrigger(<FaHeart className="text-[13px]" />, 'Marital Status', 'maritalStatus')}
          {renderDropdownTrigger(<span className="font-serif font-extrabold text-[12px]">A</span>, 'Mother Tongue', 'motherTongue')}
        </section>

        {/* 2. Community */}
        <section>
          <h2 className="text-[13px] font-extrabold text-slate-800 mb-3 uppercase tracking-wider">2. Community</h2>
          {renderDropdownTrigger(<FaUsers className="text-[13px]" />, 'Sect', 'sect')}
          {renderDropdownTrigger(<FaUserFriends className="text-[13px]" />, 'Caste', 'caste')}
        </section>

        {/* 3. Location */}
        <section>
          <h2 className="text-[13px] font-extrabold text-slate-800 mb-3 uppercase tracking-wider">3. Location</h2>
          {renderDropdownTrigger(<FaGlobeAmericas className="text-[13px]" />, 'Country', 'country', displayNames.countryName)}
          {renderDropdownTrigger(<FaMapMarkerAlt className="text-[13px]" />, 'State', 'state', displayNames.stateName)}
          {renderDropdownTrigger(<FaMapPin className="text-[13px]" />, 'City', 'city')}
        </section>

        {/* 4. Education & Income */}
        <section>
          <h2 className="text-[13px] font-extrabold text-slate-800 mb-3 uppercase tracking-wider">4. Education & Income</h2>
          {renderDropdownTrigger(<FaGraduationCap className="text-[13px]" />, 'Education', 'education')}
          {renderDropdownTrigger(<FaMoneyBillWave className="text-[13px]" />, 'Annual Income', 'annualIncome')}
          {renderDropdownTrigger(<FaBriefcase className="text-[13px]" />, 'Employed In', 'employedIn')}
        </section>

      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-24 bg-[#faf8f5]/95 backdrop-blur-md border-t border-slate-200/60 z-40 flex justify-center">
        <button 
          onClick={handleSearch}
          className="w-[85%] max-w-sm bg-[#e61a52] text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-sm shadow-xl shadow-red-500/30 active:scale-95 transition-transform"
        >
          <FaSearch className="text-[13px]" /> Search Profiles
        </button>
      </div>

      {/* Bottom Sheet Modals for Filters */}
      <BottomSheetModal isOpen={activeSheet === 'maritalStatus'} onClose={() => setActiveSheet(null)} title="Marital Status">
        {renderRadioList(maritalOptions, 'maritalStatus')}
      </BottomSheetModal>
      
      <BottomSheetModal isOpen={activeSheet === 'motherTongue'} onClose={() => setActiveSheet(null)} title="Mother Tongue">
        {renderRadioList(tongueOptions, 'motherTongue')}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'sect'} onClose={() => setActiveSheet(null)} title="Select Sect">
        {renderRadioList(sectOptions, 'sect')}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'caste'} onClose={() => setActiveSheet(null)} title="Select Caste">
        {renderRadioList(casteOptions, 'caste')}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'country'} onClose={() => setActiveSheet(null)} title="Select Country">
        {renderRadioList([{ name: 'Any', isoCode: '' }, ...allCountries], 'country', true)}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'state'} onClose={() => setActiveSheet(null)} title="Select State">
        {filters.country ? (
          statesForSelectedCountry.length > 0 ? (
            renderRadioList([{ name: 'Any', isoCode: '' }, ...statesForSelectedCountry], 'state', true)
          ) : (
            <div className="text-center p-5 text-slate-500 text-sm">No states found for the selected country.</div>
          )
        ) : (
          <div className="text-center p-5 text-slate-500 text-sm">Please select a Country first.</div>
        )}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'city'} onClose={() => setActiveSheet(null)} title="Select City">
        {renderRadioList(cityOptions, 'city')}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'education'} onClose={() => setActiveSheet(null)} title="Select Education">
        {renderRadioList(eduOptions, 'education')}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'annualIncome'} onClose={() => setActiveSheet(null)} title="Annual Income">
        {renderRadioList(incomeOptions, 'annualIncome')}
      </BottomSheetModal>

      <BottomSheetModal isOpen={activeSheet === 'employedIn'} onClose={() => setActiveSheet(null)} title="Employed In">
        {renderRadioList(employOptions, 'employedIn')}
      </BottomSheetModal>

      {/* Premium Warning Modal */}
      <PremiumWarningModal 
        isOpen={!!premiumModalFeature} 
        featureName={premiumModalFeature} 
        onClose={() => setPremiumModalFeature(null)} 
        navigate={navigate}
      />
      
    </div>
  );
};

export default MobileSearchPage;
