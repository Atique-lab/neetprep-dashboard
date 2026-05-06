import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Mid-level passwords — not based on usernames
// Enriched with hierarchical info
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
    role: 'admin',   
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
    role: 'ceo',     
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

  const login = (username, password) => {
    const key = username.toLowerCase().trim();
    const cred = USER_CREDENTIALS[key];

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

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
