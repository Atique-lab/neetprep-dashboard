import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    // Admin Check
    if (username.toLowerCase() === 'atique' && password.toLowerCase() === 'atique') {
      const adminUser = { role: 'admin', name: 'Atique', username: 'Atique' };
      setUser(adminUser);
      sessionStorage.setItem('auth_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // Manager Check
    const allowedManagers = ['Praveen', 'Poonam', 'Mukta', 'Gurpreet', 'Kapil'];
    
    // Check if the username matches an allowed manager (case-insensitive)
    const manager = allowedManagers.find(m => m.toLowerCase() === username.toLowerCase());
    
    if (manager && password.toLowerCase() === username.toLowerCase()) {
      const managerUser = { role: 'manager', name: manager, username: manager };
      setUser(managerUser);
      sessionStorage.setItem('auth_user', JSON.stringify(managerUser));
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
