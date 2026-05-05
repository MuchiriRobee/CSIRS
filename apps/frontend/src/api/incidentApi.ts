// src/api/incidentApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const incidentApi = createApi({
  reducerPath: "incidentApi",
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
  tagTypes: ["Incidents", "MyReports", "IncidentComments"],
  endpoints: (builder) => ({
    createIncident: builder.mutation({
      query: (body: FormData) => ({
        url: "/incidents",
        method: "POST",
        body,
        formData: true, // Must be at this level
      }),
      invalidatesTags: ["Incidents", "MyReports"], // This should trigger refetch
    }),

    getMyReports: builder.query({
      query: () => "/my-reports",
      providesTags: ["MyReports"],
    }),

    getAllIncidents: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/incidents?page=${page}&limit=${limit}`,
      providesTags: ["Incidents"],
    }),

    updateIncidentStatus: builder.mutation({
      query: ({ id, status, adminNotes }) => ({
        url: `/incidents/${id}`,
        method: "PUT",
        body: { status, adminNotes },
      }),
      invalidatesTags: ["Incidents"],
    }),

    // NEW: Reporter updates their own incident
    updateOwnIncident: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/my-reports/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ({ id }) => [
        "MyReports",
        "Incidents",
        { type: "IncidentComments", id },
      ],
    }),

        // NEW: Get full incident with attachments and comments
    getIncidentDetails: builder.query({
      query: (incidentId: string) => `/incidents/${incidentId}`,
      providesTags: (incidentId) => [
        { type: "IncidentComments", id: incidentId },
        "Incidents",
      ],
    }),

    getIncidentComments: builder.query({
  query: (incidentId: string) => `/incidents/${incidentId}/comments`,
  providesTags: (incidentId) => [
    { type: "IncidentComments", id: incidentId },
  ],
}),

addComment: builder.mutation({
  query: ({ incidentId, content }: { incidentId: string; content: string }) => ({
    url: `/incidents/${incidentId}/comments`,
    method: "POST",
    body: { content },
  }),
  invalidatesTags: ({ incidentId }) => [
    { type: "IncidentComments", id: incidentId },
  ],
}),
  }),
});

export const {
  useCreateIncidentMutation,
  useGetMyReportsQuery,
  useGetAllIncidentsQuery,
  useUpdateIncidentStatusMutation,
  useGetIncidentCommentsQuery,
  useAddCommentMutation,
  useGetIncidentDetailsQuery,
  useUpdateOwnIncidentMutation,  
} = incidentApi;
