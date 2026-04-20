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
  tagTypes: ["Incidents", "MyReports"],
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
  }),
});

export const {
  useCreateIncidentMutation,
  useGetMyReportsQuery,
  useGetAllIncidentsQuery,
  useUpdateIncidentStatusMutation,
} = incidentApi;
