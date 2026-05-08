import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const USER_CREDENTIALS = {
  atique: { 
    password: 'Solar@2026',  
    role: 'admin',   
    name: 'Atique', 
    title: 'Data & Dashboard Manager', 
    reportsTo: 'Poonam, Praveen, Mukta, Gurpreet',
    desc: 'Handles all task related to Data and Dashboard systems.'
  },
  himanshu: { 
    password: 'Orbit#91x',   
    role: 'manager', 
    name: 'Himanshu', 
    title: 'Operations Manager', 
    reportsTo: 'Poonam, Praveen, Mukta, Gurpreet',
    desc: 'Handles day-to-day operations across all centres.'
  },
  praveen: { 
    password: 'Meteor$47',   
    role: 'manager', 
    name: 'Praveen', 
    title: 'Accounts & Centre Manager', 
    reportsTo: 'Kapil',
    desc: 'Manages centre operations and handles accounts related works for all centres.'
  },
  poonam: { 
    password: 'Galaxy!83k',  
    role: 'manager', 
    name: 'Poonam', 
    title: 'Centre Manager', 
    reportsTo: 'Kapil',
    desc: 'Manages centre operations and performance.'
  },
  mukta: { 
    password: 'Nebula@52',   
    role: 'manager', 
    name: 'Mukta', 
    title: 'Centre Manager', 
    reportsTo: 'Kapil',
    desc: 'Manages centre operations and performance.'
  },
  gurpreet: { 
    password: 'Comet#76z',   
    role: 'manager', 
    name: 'Gurpreet', 
    title: 'Centre Manager', 
    reportsTo: 'Kapil',
    desc: 'Manages centre operations and performance.'
  },
  kapil: { 
    password: 'Quasar$29',   
    role: 'manager', 
    name: 'Kapil', 
    title: 'CEO', 
    reportsTo: 'Board',
    desc: 'Managing the company directors and overall company strategy.'
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [profileImage, setProfileImage] = useState(null);

  // Load profile image from Supabase
  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('avatar_url')
            .eq('username', user.name)
            .maybeSingle();
          
          if (data && data.avatar_url) setProfileImage(data.avatar_url);
        } catch (err) {
          console.error("Critical Auth Sync Error:", err);
        }
      } else {
        setProfileImage(null);
      }
    }
    loadProfile();
  }, [user]);

  const updateProfileImage = async (dataUrl) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            username: user.name, 
            avatar_url: dataUrl,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        setProfileImage(dataUrl);
      } catch (err) {
        console.error("Error updating profile image:", err);
      }
    }
  };

  const [presence, setPresence] = useState({});

  // Presence Tracking
  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      try {
        await supabase
          .from('user_profiles')
          .upsert({ 
            username: user.name, 
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'username' });
      } catch (err) {}
    };

    const fetchPresence = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('username, last_seen, avatar_url');
        
        const presenceMap = {};
        data?.forEach(p => {
          const isOnline = new Date() - new Date(p.last_seen) < 300000; // 5 mins
          presenceMap[p.username] = { ...p, isOnline };
        });
        setPresence(presenceMap);
      } catch (err) {}
    };

    updatePresence();
    fetchPresence();
    const interval = setInterval(() => {
      updatePresence();
      fetchPresence();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const changePassword = async (newPassword) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            username: user.name, 
            password: newPassword,
            updated_at: new Date().toISOString()
          }, { onConflict: 'username' });
        
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error("Error changing password:", err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: "No user logged in" };
  };

  const login = async (username, password) => {
    const key = username.toLowerCase().trim();
    const cred = USER_CREDENTIALS[key];

    try {
      // Check DB first
      const { data: dbUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', cred?.name || username)
        .maybeSingle();

      if (dbUser && dbUser.password === password) {
        const loggedInUser = { 
          role: cred?.role || 'manager', 
          name: dbUser.username, 
          username: dbUser.username,
          title: cred?.title || 'Team Member',
          reportsTo: cred?.reportsTo || 'Admin',
          desc: cred?.desc || ''
        };
        setUser(loggedInUser);
        sessionStorage.setItem('auth_user', JSON.stringify(loggedInUser));
        return { success: true };
      }

      // Fallback to hardcoded
      if (cred && password === cred.password) {
        const loggedInUser = { 
          role: cred.role, 
          name: cred.name, 
          username: cred.name,
          title: cred.title,
          reportsTo: cred.reportsTo,
          desc: cred.desc
        };
        setUser(loggedInUser);
        sessionStorage.setItem('auth_user', JSON.stringify(loggedInUser));
        return { success: true };
      }
    } catch (err) {}

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('auth_user');
  };

  const userList = Object.values(USER_CREDENTIALS).map(u => ({ name: u.name, title: u.title }));

  return (
    <AuthContext.Provider value={{ user, login, logout, profileImage, updateProfileImage, userList, presence, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
