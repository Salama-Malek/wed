import { useEffect } from "react";
import { useNavigation, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/redux/slices/loadingSlice";

export const useNavigationLoading = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigation.state === "loading") {
      dispatch(startLoading());
    } else {
      const timer = setTimeout(() => {
        dispatch(stopLoading());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, dispatch]);

  useEffect(() => {
    dispatch(stopLoading());
  }, [location.pathname, dispatch]);
};