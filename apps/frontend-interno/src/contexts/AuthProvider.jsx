import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Importa a nossa API configurada
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      try {
        const parsed = JSON.parse(recoveredUser);
        setUser(parsed);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, senha) => {
    const { data } = await api.post('/auth/login', { username, senha });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    
    setUser(data.usuario);
  };

  const logout = () => {
    console.log("DESLOGANDO...");
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};