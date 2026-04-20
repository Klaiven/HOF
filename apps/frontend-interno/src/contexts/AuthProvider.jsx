import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Importa a nossa API configurada
import { AuthContext } from './AuthContext';

// Função para decodificar JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      try {
        const parsed = JSON.parse(recoveredUser);
        const decoded = decodeJWT(token);

        // Garantir que tipo e setor estejam presentes (priorizando o token se disponível)
        if (!parsed.tipo || !parsed.setor) {
          if (decoded) {
            parsed.tipo = parsed.tipo || decoded.tipo || decoded.role || 'usuario';
            parsed.setor = parsed.setor || decoded.setor || decoded.department || decoded.unit;
          }
        }
        
        setUser(parsed);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, senha) => {
    try {
      const { data } = await api.post('/auth/login', { username, senha });
      
      if (!data.token || !data.usuario) {
        throw new Error('Resposta inválida do servidor');
      }
      
      // Decodificar JWT para extrair tipo e setor
      const decoded = decodeJWT(data.token);
      
      // Montar objeto de usuário completo
      const usuarioComInfo = {
        ...data.usuario,
        tipo: decoded?.tipo || decoded?.role || data.usuario.tipo || 'usuario',
        setor: decoded?.setor || decoded?.department || decoded?.unit || data.usuario.setor
      };
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(usuarioComInfo));
      
      setUser(usuarioComInfo);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};