import { useReducer, useCallback } from 'react';

type Action = { type: 'OPEN' } | { type: 'CLOSE' } | { type: 'TOGGLE' };

type State = {
  isOpen: boolean;
};

const toggleReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
};

const useToggle = (initialState: boolean = false) => {

    const [state, dispatch] = useReducer(toggleReducer, { isOpen: initialState });

  const open = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const toggle = useCallback(() => dispatch({ type: 'TOGGLE' }), []);

  return { isOpen: state.isOpen, open, close, toggle };
};

export default useToggle;


