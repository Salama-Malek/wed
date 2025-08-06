import { useEffect, useCallback } from 'react';

interface UseKeyboardPreventionOptions {
  preventEnterSubmit?: boolean;
  preventEscape?: boolean;
  preventTab?: boolean;
  preventF5?: boolean;
  preventCtrlS?: boolean;
  preventCtrlEnter?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
}

/**
 * Custom hook to prevent unwanted keyboard actions globally
 * @param options Configuration options for keyboard prevention
 */
export const useKeyboardPrevention = (options: UseKeyboardPreventionOptions = {}) => {
  const {
    preventEnterSubmit = true,
    preventEscape = false,
    preventTab = false,
    preventF5 = false,
    preventCtrlS = true,
    preventCtrlEnter = true,
    onKeyDown
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent Enter key from submitting forms
    if (preventEnterSubmit && e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      // Allow Enter in textareas for new lines
      if (target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Allow Enter in specific elements that should handle it
      if (target.tagName === 'BUTTON' || 
          target.getAttribute('role') === 'button' ||
          target.closest('[role="button"]')) {
        return;
      }
      
      // Prevent form submission on Enter
      if (target.tagName === 'INPUT' || target.closest('form')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    // Prevent Escape key
    if (preventEscape && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent Tab key
    if (preventTab && e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent F5 refresh
    if (preventF5 && e.key === 'F5') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent Ctrl+S (save)
    if (preventCtrlS && e.ctrlKey && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent Ctrl+Enter
    if (preventCtrlEnter && e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }

    // Call custom key handler if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [preventEnterSubmit, preventEscape, preventTab, preventF5, preventCtrlS, preventCtrlEnter, onKeyDown]);

  useEffect(() => {
    // Add global event listener
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
};

/**
 * Utility function to prevent form submission on Enter key
 * @param e Keyboard event
 */
export const preventEnterSubmit = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter') {
    const target = e.target as HTMLElement;
    
    // Allow Enter in textareas
    if (target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Allow Enter in buttons
    if (target.tagName === 'BUTTON' || 
        target.getAttribute('role') === 'button' ||
        target.closest('[role="button"]')) {
      return;
    }
    
    // Prevent form submission
    if (target.tagName === 'INPUT' || target.closest('form')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};

/**
 * Utility function to prevent specific keys
 * @param e Keyboard event
 * @param keys Array of keys to prevent
 */
export const preventKeys = (e: React.KeyboardEvent<HTMLElement>, keys: string[]) => {
  if (keys.includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
}; 