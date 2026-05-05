// src/api/auditLogApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const auditLogApi = createApi({
  reducerPath: "auditLogApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AuditLogs"],
  endpoints: (builder) => ({
    
    //  Get all audit logs (paginated)
    getAuditLogs: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/audit-logs?page=${page}&limit=${limit}`,
      providesTags: ["AuditLogs"],
    }),

    //  Get single audit log
    getAuditLogById: builder.query({
      query: (id: string) => `/audit-logs/${id}`,
      providesTags: ["AuditLogs"],
    }),

  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
} = auditLogApi;