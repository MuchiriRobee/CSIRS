import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { incidentApi } from './api/incidentApi';
import { userApi } from './api/userApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [incidentApi.reducerPath]: incidentApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      incidentApi.middleware,
      userApi.middleware
    ),
});

// Optional but recommended (for typing later)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;