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
    const res = await axiosInstance.post('/api/auth/signUp', formData);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const login = async (formData) => {
    const res = await axiosInstance.post('/api/auth/signIn', formData);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;