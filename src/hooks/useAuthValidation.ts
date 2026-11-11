import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/apiClient';
import { selectIsAuthenticated, selectRefreshToken, selectToken } from '../features/auth/authSelectors';
import { logout, setToken } from '../features/auth/authSlice';
import { store } from '../store';

export const useAuthValidation = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const refresh = useSelector(selectRefreshToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        // 1️⃣ Try refreshing first
        if (refresh) {
          const refreshResponse = await api.post('/api/v1/auth-service/refresh', { token: refresh });
          dispatch(setToken(refreshResponse.data.authenticationToken));
        }

        // 2️⃣ Validate the current token with backend
        const validationResponse = await api.get('/api/v1/auth-service/validateToken', {
          params: { token: store.getState().auth.token },
        });

        if (!validationResponse.data) {
          // token invalid
          dispatch(logout());
        }

      } catch (e) {
        dispatch(logout());
      } finally {
        setChecking(false);
      }
    };

    validate();
  }, [dispatch, token, refresh]);

  return { isAuthenticated, checking };
};
