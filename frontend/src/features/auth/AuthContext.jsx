import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../../utils/api';
import { deriveMasterKey } from '../../utils/crypto';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [masterKey, setMasterKey] = useState(null);
    const [userSalt, setUserSalt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(userData => {
                setUser(userData);
                // We keep user logged in but don't have masterKey
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        setUser({ email, id: res.user_id });
        setUserSalt(res.salt);
        return true;
    };

    const unlockVault = async (masterPassword) => {
        if (!userSalt) throw new Error("No salt found. Please re-login.");
        const { masterKey: mKey } = await deriveMasterKey(masterPassword, userSalt);
        // ideally verify master key by decrypting vault_metadata
        setMasterKey(mKey);
    };

    const register = async (email, loginPassword, masterPassword) => {
        // Generate random salt
        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
        const saltString = btoa(String.fromCharCode(...saltBytes));

        const { masterKey: mKey } = await deriveMasterKey(masterPassword, saltString);

        // Let's create a vault initialization metadata (e.g., empty string encrypted)
        // Wait, for MVP let's just use string "SECURE_VAULT" to prove decryption later.
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedMeta = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            mKey,
            enc.encode("SECURE_VAULT")
        );
        const vault_metadata = JSON.stringify({
            data: btoa(String.fromCharCode(...new Uint8Array(encryptedMeta))),
            iv: btoa(String.fromCharCode(...iv))
        });

        const res = await registerUser({ email, password: loginPassword, salt: saltString, vault_metadata });
        setUser({ email, id: res.id });
        setUserSalt(saltString);
        setMasterKey(mKey);
        return true;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        setMasterKey(null);
        setUserSalt(null);
    };

    return (
        <AuthContext.Provider value={{ user, masterKey, userSalt, login, unlockVault, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
