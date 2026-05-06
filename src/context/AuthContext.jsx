import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Mid-level passwords — not based on usernames
const USER_CREDENTIALS = {
  atique:   { password: 'Solar@2026',  role: 'admin',   name: 'Atique' },
  himanshu: { password: 'Orbit#91x',   role: 'admin',   name: 'Himanshu' },
  praveen:  { password: 'Meteor$47',   role: 'manager', name: 'Praveen' },
  poonam:   { password: 'Galaxy!83k',  role: 'manager', name: 'Poonam' },
  mukta:    { password: 'Nebula@52',   role: 'manager', name: 'Mukta' },
  gurpreet: { password: 'Comet#76z',   role: 'manager', name: 'Gurpreet' },
  kapil:    { password: 'Quasar$29',   role: 'manager', name: 'Kapil' },
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
      const loggedInUser = { role: cred.role, name: cred.name, username: cred.name };
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
