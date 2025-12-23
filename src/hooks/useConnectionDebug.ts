import { useEffect, useRef } from 'react';
import { useAppSelector } from './hooks';
import { selectConnectionStatus } from '../features/connectionSocket/connectionSlice';

export const useConnectionDebug = () => {
    const status = useAppSelector(selectConnectionStatus);
    const prevStatusRef = useRef(status);

    useEffect(() => {
        if (prevStatusRef.current !== status) {
            console.log(
                '%c[CONNECTION STATE CHANGE]',
                'color: white; background: #e74c3c; padding: 4px 8px; border-radius: 4px; font-weight: bold',
                {
                    from: prevStatusRef.current,
                    to: status,
                    timestamp: new Date().toISOString(),
                    stackTrace: new Error().stack // 🔥 Show where state changed
                }
            );
            prevStatusRef.current = status;
        }
    }, [status]);
};

export default useConnectionDebug;