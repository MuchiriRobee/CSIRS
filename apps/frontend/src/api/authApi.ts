// src/api/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Use the shared inferred types (now properly exported)
import type { RegisterInput, LoginInput } from "@csirs/shared";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials: RegisterInput) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials: LoginInput) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
