import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate token and fetch currently logged-in user details on load
  useEffect(() => {
    const initAuth = async () => {
      const startTime = Date.now();
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          }
        } catch (error) {
          console.error('Initial Auth Error:', error);
          localStorage.removeItem('token');
          setUser(null);
          setProfile(null);
        }
      }
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) {
        await new Promise(r => setTimeout(r, 3000 - elapsed));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        toast.success(`Welcome back, ${res.data.profile?.name || 'Member'}!`);
        return { success: true, role: res.data.user.role };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Invalid credentials.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile);
        toast.success(`Account created! Welcome, ${res.data.profile.name}!`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    toast.success('Logged out successfully.');
  };

  // Update profile details locally and trigger state reload
  const updateProfile = async (formData) => {
    try {
      // Axios request with multipart/form-data support if uploading a file
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = await api.put('/profiles/my-profile', formData, config);
      if (res.data.success) {
        setProfile(res.data.data);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Reload current user state
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      }
    } catch (error) {
      console.error('Refresh User Error:', error);
    }
  };

  const getCompleteness = (prof = profile) => {
    if (!prof) return { score: 0, missingFields: [] };
    let score = 20; // Base score (email, password, name, gender, age, city)
    const missingFields = [];
    
    // 1. Family Details (+40%)
    if (prof.familyDetails?.fatherOccupation && prof.familyDetails?.fatherOccupation.trim() !== '') {
      score += 40;
    } else {
      missingFields.push({ name: '👪 Family Details', percentage: 40, field: 'familyDetails' });
    }
    
    // 2. Career Details Customization (+40%)
    if (
      prof.profession && 
      prof.profession.trim() !== '' && 
      prof.profession !== 'Not Specified' && 
      prof.education && 
      prof.education.trim() !== '' && 
      prof.education !== 'Not Specified'
    ) {
      score += 40;
    } else {
      missingFields.push({ name: '💼 Career & Education Details', percentage: 40, field: 'careerDetails' });
    }

    // 3. Wali Contact (Optional)
    if (!prof.waliContact || prof.waliContact.trim() === '') {
      missingFields.push({ name: '📞 Chaperone / Wali Contact (Optional)', percentage: 0, field: 'waliContact' });
    }
    
    return {
      score: Math.min(score, 100),
      missingFields
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        getCompleteness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
