import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, getUserById, getFamilyById } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);

  // ✅ Função para buscar família após login
  const fetchFamilyData = async (familyId) => {
    try {
      if (!familyId) {
        return;
      }
      const familyData = await getFamilyById(familyId);
      if (familyData) {
        setFamily(familyData);
      }
    } catch (error) {
    }
  };

  // ✅ Função para fazer login
  const login = async (accessName, password) => {
    try {
      const response = await apiLogin({ accessName, password });
      if (response && response.token) {
        const accessToken = response.token;
        localStorage.setItem("token", accessToken);
        setToken(accessToken);

        const userId = response.user?.id;
        if (!userId) {
          return { success: false, error: "Usuário não encontrado." };
        }

        localStorage.setItem("userId", userId);
        setUser(response.user);

        // 🔍 Busca família após login
        fetchFamilyData(response.user.familyId);

        return { success: true, user: response.user };
      }

      return { success: false, error: "Falha ao fazer login." };
    } catch (error) {
      return { success: false, error: "Erro ao autenticar. Tente novamente." };
    }
  };

  // ✅ Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
    setFamily(null);
  };

  // ✅ Recupera a sessão do usuário ao carregar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken) {
      setToken(storedToken);
      if (storedUserId) {
        getUserById(storedUserId)
          .then((userData) => {
            if (userData) {
              setUser(userData);
              fetchFamilyData(userData.familyId);
            } else {
              logout();
            }
          })
          .catch(() => {
            logout();
          });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, family, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
