import React, { createContext, useState, useEffect } from 'react';
import api, { SOCKET_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchNotifications = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        const unread = res.data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Fetch Notifications Error:', error);
    }
  };

  const fetchPendingRequestsCount = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await api.get('/requests');
      if (res.data.success) {
        setPendingRequestsCount(res.data.received.length);
      }
    } catch (error) {
      console.error('Fetch Pending Requests Count Error:', error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      fetchPendingRequestsCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPendingRequestsCount(0);
    }
  }, [user]);

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

  useEffect(() => {
    let socket;
    if (user?._id) {
      socket = io(SOCKET_BASE_URL);
      
      socket.emit('join_room', user._id);
      
      socket.on('receive_interest_notification', (data) => {
        fetchNotifications();
        fetchPendingRequestsCount();
        toast((t) => (
          <div 
            onClick={() => { 
              toast.dismiss(t.id); 
              window.location.href = '/interests'; 
            }} 
            className="cursor-pointer py-1"
          >
            <div className="font-bold text-white flex items-center gap-2">
              <span>💖</span> New Interest Received!
            </div>
            <div className="text-xs text-slate-200 mt-1">
              <strong>{data.senderName}</strong> is interested in your profile.
            </div>
            <div className="text-[10px] text-gold-400 font-bold underline mt-1.5 hover:text-white transition-colors">
              Click to view requests & accept/decline
            </div>
          </div>
        ), {
          duration: 7000,
          position: 'top-right',
          style: {
            background: '#4f080e',
            color: '#fff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }
        });
      });

      socket.on('receive_interest_accept', (data) => {
        fetchNotifications();
        fetchPendingRequestsCount();
        toast((t) => (
          <div 
            onClick={() => { 
              toast.dismiss(t.id); 
              window.location.href = '/interests'; 
            }} 
            className="cursor-pointer py-1"
          >
            <div className="font-bold text-white flex items-center gap-2">
              <span>🎉</span> Request Accepted!
            </div>
            <div className="text-xs text-slate-200 mt-1">
              <strong>{data.receiverName}</strong> accepted your interest request!
            </div>
            <div className="text-[10px] text-gold-400 font-bold underline mt-1.5 hover:text-white transition-colors">
              Click to start chatting & view contact details
            </div>
          </div>
        ), {
          duration: 7000,
          position: 'top-right',
          style: {
            background: '#0f5132',
            color: '#fff',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }
        });
      });

      socket.on('receive_message', (data) => {
        fetchNotifications();
        const activePartnerId = localStorage.getItem('activeChatPartnerId');
        const isCurrentlyChatting = (window.location.pathname === '/interests' || window.location.pathname.startsWith('/chat/')) && activePartnerId === data.sender;
        
        if (!isCurrentlyChatting) {
          toast((t) => (
            <div 
              onClick={() => { 
                toast.dismiss(t.id); 
                window.location.href = window.innerWidth < 1024 ? `/chat/${data.sender}` : '/interests'; 
              }} 
              className="cursor-pointer py-1"
            >
              <div className="font-bold text-white flex items-center gap-2">
                <span>💬</span> New Message Received!
              </div>
              <div className="text-xs text-slate-200 mt-1">
                You have received a new message from a connected member.
              </div>
              <div className="text-[10px] text-gold-400 font-bold underline mt-1.5 hover:text-white transition-colors">
                Click to open chat & reply
              </div>
            </div>
          ), {
            duration: 6000,
            position: 'top-right',
            style: {
              background: '#0d6efd',
              color: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
          });
        } else {
          // Since the user is chatting, mark the notification as read immediately
          api.put(`/notifications/mark-read-sender/${data.sender}`).catch(() => {});
        }
      });

      socket.on('new_notification', (data) => {
        fetchNotifications();
        fetchPendingRequestsCount();
      });

      socket.on('notifications_updated', () => {
        fetchNotifications();
        fetchPendingRequestsCount();
      });

      socket.on('interests_updated', () => {
        fetchPendingRequestsCount();
        window.dispatchEvent(new Event('interests_updated'));
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  // Helper to convert base64 VAPID public key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window && user?._id) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Wait until service worker is ready
        await navigator.serviceWorker.ready;

        const keyRes = await api.get('/auth/vapid-public-key');
        if (!keyRes.data.success || !keyRes.data.publicKey) {
          console.warn('VAPID public key not configured on server.');
          return;
        }
        
        const vapidPublicKey = keyRes.data.publicKey;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        await api.post('/auth/subscribe', subscription);
        console.log('Web Push subscription registered successfully.');
      } catch (error) {
        console.error('Failed to subscribe to Web Push notifications:', error);
      }
    }
  };

  useEffect(() => {
    if (user?._id) {
      // Trigger Web Push registration dynamically
      subscribeToPushNotifications();
    }
  }, [user]);

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

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/mark-read/${id}`);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark Notification Read Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.put('/notifications/mark-all-read');
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark All Notifications Read Error:', error);
    }
  };

  const markNotificationsReadFromSender = async (senderId) => {
    try {
      const res = await api.put(`/notifications/mark-read-sender/${senderId}`);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark Notifications From Sender Read Error:', error);
    }
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
        notifications,
        unreadCount,
        fetchNotifications,
        pendingRequestsCount,
        fetchPendingRequestsCount,
        markAsRead,
        markAllAsRead,
        markNotificationsReadFromSender,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
