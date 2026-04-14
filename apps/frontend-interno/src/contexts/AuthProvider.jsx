import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Checagem inicial ao carregar a página
  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      try {
        const parsed = JSON.parse(recoveredUser);
        setUser(parsed);
        axios.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, senha) => {
    // Chamada ao backend
    const { data } = await axios.post('/api/auth/login', { username, senha });
    
    // IMPORTANTE: Salvar TUDO antes de atualizar o estado
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    axios.defaults.headers.Authorization = `Bearer ${data.token}`;
    
    // Atualiza o estado global
    setUser(data.usuario);
  };

const logout = () => {
  console.log("DESLOGANDO...");
  localStorage.clear();
  delete axios.defaults.headers.Authorization;
  setUser(null);
};

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};