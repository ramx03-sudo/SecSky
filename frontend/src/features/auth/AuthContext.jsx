import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../../utils/api';
import { deriveMasterKey } from '../../utils/crypto';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [masterKey, setMasterKey] = useState(null);
    const [userSalt, setUserSalt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(localStorage.getItem('vault_unlocked') === 'true');

    useEffect(() => {
        getCurrentUser()
            .then(userData => {
                setUser(userData);
                setUserSalt(userData.salt);
            })
            .catch(() => {
                setUser(null);
                setIsVaultUnlocked(false);
                localStorage.removeItem('vault_unlocked');
            })
            .finally(() => setLoading(false));

        const handleLock = () => {
            setMasterKey(null);
            setIsVaultUnlocked(false);
        };
        window.addEventListener('vaultLocked', handleLock);
        return () => window.removeEventListener('vaultLocked', handleLock);
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
        setMasterKey(mKey);
        setIsVaultUnlocked(true);
        localStorage.setItem('vault_unlocked', 'true');
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
        setIsVaultUnlocked(true);
        localStorage.setItem('vault_unlocked', 'true');
        return true;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        setMasterKey(null);
        setUserSalt(null);
        setIsVaultUnlocked(false);
        localStorage.removeItem('vault_unlocked');
    };

    return (
        <AuthContext.Provider value={{ user, masterKey, userSalt, isVaultUnlocked, login, unlockVault, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
