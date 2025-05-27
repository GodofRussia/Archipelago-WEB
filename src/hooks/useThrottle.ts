import {useCallback, useRef} from 'react';

function useThrottle<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number,
): (...args: Parameters<T>) => void {
    const lastCalled = useRef<number>(0);

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();

            if (now - lastCalled.current >= delay) {
                lastCalled.current = now;
                callback(...args);
            }
        },
        [callback, delay],
    );
}

export default useThrottle;
