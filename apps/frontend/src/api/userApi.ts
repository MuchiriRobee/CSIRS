import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UserRole } from "@csirs/shared";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any)?.auth?.token || localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, role }: { id: string; role: UserRole }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUsersQuery, useUpdateUserRoleMutation } = userApi;
