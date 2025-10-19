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
        // MUDEI PARA sessionStorage: Verifica a sessão fictícia que dura apenas enquanto a aba estiver aberta
        const storedSession = sessionStorage.getItem('orla33_mock_auth');
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
            // MUDEI PARA sessionStorage: Persiste o login SÓ até o fechamento da aba
            sessionStorage.setItem('orla33_mock_auth', 'true'); 
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
        // MUDEI PARA sessionStorage: Remove a persistência
        sessionStorage.removeItem('orla33_mock_auth'); 
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