import { useEffect, useCallback } from 'react';

const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        memoizedCallback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, memoizedCallback]);

};

export default useOutsideClick;
