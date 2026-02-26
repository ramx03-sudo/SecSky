import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../../utils/api';
import { deriveMasterKey } from '../../utils/crypto';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const masterKeyRef = useRef(null);
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [userSalt, setUserSalt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(userData => {
                setUser(userData);
                setUserSalt(userData.salt);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => setLoading(false));

        const handleLock = () => {
            masterKeyRef.current = null;
            setIsVaultUnlocked(false);
        };
        window.addEventListener('vaultLocked', handleLock);
        return () => window.removeEventListener('vaultLocked', handleLock);
    }, []);

    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        setUser({ email, id: res.user_id, vault_metadata: res.vault_metadata });
        setUserSalt(res.salt);
        return true;
    };

    const unlockVault = async (masterPassword) => {
        if (!userSalt) throw new Error("No salt found. Please re-login.");
        if (!user || !user.vault_metadata) throw new Error("Vault metadata missing. Cannot verify master password.");

        const { masterKey: mKey } = await deriveMasterKey(masterPassword, userSalt);

        try {
            const meta = JSON.parse(user.vault_metadata);
            const iv = new Uint8Array(atob(meta.iv).split('').map(c => c.charCodeAt(0)));
            const data = new Uint8Array(atob(meta.data).split('').map(c => c.charCodeAt(0)));

            await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                mKey,
                data
            );
        } catch (e) {
            throw new Error("Incorrect master password");
        }

        masterKeyRef.current = mKey;
        setIsVaultUnlocked(true);
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
        setUser({ email, id: res.id, vault_metadata });
        setUserSalt(saltString);
        masterKeyRef.current = mKey;
        setIsVaultUnlocked(true);
        return true;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        masterKeyRef.current = null;
        setIsVaultUnlocked(false);
        setUserSalt(null);
    };

    return (
        <AuthContext.Provider value={{ user, masterKey: masterKeyRef.current, userSalt, isVaultUnlocked, login, unlockVault, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);
