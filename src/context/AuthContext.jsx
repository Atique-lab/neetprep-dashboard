import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    // Admin Check
    if (username === 'Atique@Neetprep' && password === 'Atique@Gooded') {
      const adminUser = { role: 'admin', name: 'Atique', username };
      setUser(adminUser);
      localStorage.setItem('auth_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // Manager Check
    if (username.endsWith('@Neetprep') && password.endsWith('@Gooded')) {
      const nameFromUsername = username.split('@')[0];
      const nameFromPassword = password.split('@')[0];
      
      if (nameFromUsername === nameFromPassword) {
        const managerUser = { role: 'manager', name: nameFromUsername, username };
        setUser(managerUser);
        localStorage.setItem('auth_user', JSON.stringify(managerUser));
        return { success: true };
      }
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
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
