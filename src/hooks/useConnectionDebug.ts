import { useEffect } from 'react';
import { useAppSelector } from './hooks';
import { selectConnectionStatus, selectReconnectAttempts } from '../features/connectionSocket/connectionSlice';

/**
 * Debug hook để log connection state changes
 * Chỉ dùng trong development
 */
export const useConnectionDebug = () => {
    const status = useAppSelector(selectConnectionStatus);
    const attempts = useAppSelector(selectReconnectAttempts);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        const logStyle = 'color: white; background: #2563eb; padding: 4px 8px; border-radius: 4px; font-weight: bold';

        console.log(
            '%c[CONNECTION DEBUG]',
            logStyle,
            {
                status,
                attempts,
                isAuthenticated,
                timestamp: new Date().toISOString()
            }
        );
    }, [status, attempts, isAuthenticated]);
};

export default useConnectionDebug;