import { useEffect } from 'react';

export function useVaultInactivity(timeout = 10 * 60 * 1000) {
    useEffect(() => {
        let timeoutId;

        const handleActivity = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (localStorage.getItem('vault_unlocked') === 'true') {
                    localStorage.removeItem('vault_unlocked');
                    window.dispatchEvent(new Event('vaultLocked'));
                }
            }, timeout);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        // Initial setup
        handleActivity();

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [timeout]);
}
