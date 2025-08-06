import React, { useEffect, useReducer } from "react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { Cancel01Icon } from "hugeicons-react";

type ActionType = { type: "OFFLINE" } | { type: "ONLINE" } | { type: "HIDE_MESSAGES" };

type StateType = {
  showOfflineMessage: boolean;
  showOnlineMessage: boolean;
  wasOffline: boolean;
};

const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "OFFLINE":
      return { ...state, showOfflineMessage: true, wasOffline: true };
    case "ONLINE":
      return { ...state, showOfflineMessage: false, showOnlineMessage: true };
    case "HIDE_MESSAGES":
      return { ...state, showOnlineMessage: false, wasOffline: false };
    default:
      return state;
  }
};

export const OfflineLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();

  const [state, dispatch] = useReducer(reducer, {
    showOfflineMessage: false,
    showOnlineMessage: false,
    wasOffline: false,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    switch (true) {
      case !isOnline:
        dispatch({ type: "OFFLINE" });
        break;
      case isOnline && state.wasOffline:
        dispatch({ type: "ONLINE" });
        timer = setTimeout(() => dispatch({ type: "HIDE_MESSAGES" }), 3000);
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline, state.wasOffline]);

  return (
    <>
      {state.showOfflineMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between w-auto  md:max-w-sm animate-fadeIn">
          ❌ You are offline! Please check your connection.
          <button
            onClick={() => dispatch({ type: "HIDE_MESSAGES" })}
            className="ml-3 hover:text-gray-300"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
        </div>
      )}

      {state.showOnlineMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg w-auto max-w-xs md:max-w-sm animate-fadeIn">
          ✅ You are back online!
        </div>
      )}

      {children}
    </>
  );
};
