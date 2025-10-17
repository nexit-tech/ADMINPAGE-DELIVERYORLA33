import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/lib/supabase';

// ----------------------------------------------------
// CREDENCIAIS AGORA VÊM DO .ENV (SEGURAS FORA DO GIT)
// ----------------------------------------------------
const MOCK_EMAIL = import.meta.env.VITE_MOCK_EMAIL || 'admin@orla33.com';
const MOCK_PASSWORD = import.meta.env.VITE_MOCK_PASSWORD || 'orla33admin';
// ----------------------------------------------------

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verifica a sessão fictícia no localStorage para persistência
        const storedSession = localStorage.getItem('orla33_mock_auth');
        if (storedSession === 'true') {
            // Simula que o usuário está logado
            setUser({ id: 'mock-user-123', email: MOCK_EMAIL }); 
        }
        setLoading(false);
    }, []);

    // Função de Login (Fictício)
    const signIn = async (email, password) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula um delay
        
        if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
            const mockUser = { id: 'mock-user-123', email: MOCK_EMAIL };
            setUser(mockUser);
            localStorage.setItem('orla33_mock_auth', 'true'); // Persiste o login
            setLoading(false);
            return mockUser;
        } else {
            setLoading(false);
            throw new Error("Credenciais inválidas");
        }
    };

    // Função de Logout (Fictício)
    const signOut = async () => {
        setUser(null);
        localStorage.removeItem('orla33_mock_auth'); // Remove a persistência
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};