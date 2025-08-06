import { stopLoading } from '@/redux/slices/loadingSlice';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

const ProgressTrigger = (Component: React.ComponentType<any>) => (props: any) => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    return () => {
      dispatch(stopLoading());
    }
  }, [location]);

  return <Component {...props} />
};

export default ProgressTrigger;