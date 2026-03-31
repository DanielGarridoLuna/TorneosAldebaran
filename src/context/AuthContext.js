import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const jugadorData = await AsyncStorage.getItem('jugador_data');
      if (jugadorData) {
        setUser(JSON.parse(jugadorData));
      }
    } catch (error) {
      console.log('Error al cargar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (jugador) => {
    try {
      await AsyncStorage.setItem('player_id', jugador.player_id);
      await AsyncStorage.setItem('jugador_data', JSON.stringify(jugador));
      setUser(jugador);
      return { success: true };
    } catch (error) {
      console.log('Error al guardar sesión:', error);
      return { success: false, error: 'Error al guardar sesión' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('player_id');
      await AsyncStorage.removeItem('jugador_data');
      setUser(null);
    } catch (error) {
      console.log('Error al cerrar sesión:', error);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      await AsyncStorage.setItem('jugador_data', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.log('Error al actualizar usuario:', error);
      return { success: false, error: 'Error al actualizar datos' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};