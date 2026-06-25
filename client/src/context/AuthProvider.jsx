import { useState } from 'react';
import AuthContext from './AuthContext';
import axiosInstance from '../api/axiosInstance';

const getUserFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { userId: payload.userId };
  } catch {
    return null;
  }
};

const storedToken = localStorage.getItem('token');

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(storedToken);
  const [user, setUser]   = useState(() => storedToken ? getUserFromToken(storedToken) : null);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const signup = async (formData) => {
    const res = await axiosInstance.post('/auth/signUp', formData);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Fall back to decoding token if server doesn't return user object
    setUser(newUser || getUserFromToken(newToken));
    return res.data;
  };

const login = async (formData) => {
  const res = await axiosInstance.post('/auth/signIn', formData);
  console.log('Full login response:', res.data); // ← add this
  const { token: newToken, user: newUser } = res.data.data;
  console.log('newToken:', newToken); // ← and this
  localStorage.setItem('token', newToken);
  setToken(newToken);
  setUser(newUser || getUserFromToken(newToken));
  return res.data;
};
  return (
    // Add loading: false so ProtectedRoute doesn't get undefined
    <AuthContext.Provider value={{ user, token, login, logout, signup, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;