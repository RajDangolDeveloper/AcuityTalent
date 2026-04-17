import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import {
  PaginatedResponse,
  Job,
  CandidateApplication,
  SingleResponse,
  ApplicationDetail,
  CandidateProfile,
  ApplicationStatus,
  LocationType,
} from "../types/recruiter";
import Notification from "../element/Notification";

export const useGetRecruiterJobs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["recruiter-jobs", page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Job>>(
        "/jobs/recruiter/my-jobs",
        {
          params: { page, limit },
        },
      );
      console.log(response);
      return response.data;
    },
  });
};

// Get job candidates/applications
export const useJobApplications = (
  jobId: number,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ["job-applications", jobId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<
        PaginatedResponse<CandidateApplication>
      >(`/applications/job/${jobId}/candidates`, {
        params: { page, limit },
      });
      console.log(response);
      return response.data;
    },
    enabled: !!jobId,
  });
};

// Get application details with candidate profile
export const useApplicationDetail = (applicationId: number) => {
  return useQuery({
    queryKey: ["application-detail", applicationId],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<ApplicationDetail>>(
        `/applications/${applicationId}`,
      );
      return response.data.data;
    },
    enabled: !!applicationId,
  });
};

// Get candidate profile
export const useCandidateProfile = (candidateId: number) => {
  return useQuery({
    queryKey: ["candidate-profile", candidateId],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<CandidateProfile>>(
        `/candidates/${candidateId}`,
      );
      console.log(response);
      return response.data.data;
    },
    enabled: !!candidateId,
  });
};

// Update application status
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: number;
      status: ApplicationStatus;
    }) => {
      let endpoint = `/applications/${applicationId}`;

      if (status === "SHORTLISTED") {
        endpoint = `/applications/${applicationId}/shortlist`;
      } else if (status === "INTERVIEWING") {
        endpoint = `/applications/${applicationId}/interview`;
      } else if (status === "REJECTED") {
        endpoint = `/applications/${applicationId}/reject`;
      } else if (status === "OFFER_EXTENDED") {
        endpoint = `/applications/${applicationId}/offer`;
      }

      const response = await apiClient.patch<SingleResponse<ApplicationDetail>>(
        endpoint,
        { status },
      );
      console.log(response);
      return response.data.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["job-applications"] }),
        queryClient.invalidateQueries({
          queryKey: ["application-detail", variables.applicationId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["candidate", "applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["recent-candidate-applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["total-candidate-applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-applications-response-rate"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["candidate-applications-interview-rate"],
        }),
        queryClient.invalidateQueries({ queryKey: ["candidate-total-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["interviews"] }),
      ]);
    },
  });
};

// Create job
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: {
      title: string;
      description: string;
      requirements?: string;
      employmentType: string;
      experienceLevel?: string;
      salaryRange?: string;
      location: string;
      locationType: LocationType;
      remoteAvailable: boolean;
    }) => {
      const response = await apiClient.post<SingleResponse<Job>>(
        "/jobs",
        jobData,
      );
      console.log(response);
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
    },
  });
};

// Get recruiter's companies
export const useGetRecruiterCompanies = () => {
  return useQuery({
    queryKey: ["recruiter-companies"],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<any>>(
        "/companies/recruiter",
      );
      console.log(response);
      return response.data.data;
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      jobData,
    }: {
      jobId: number;
      jobData: {
        title?: string;
        description?: string;
        requirements?: string;
        employmentType?: string;
        experienceLevel?: string;
        salaryRange?: string;
        location?: string;
        locationType?: LocationType;
        remoteAvailable?: boolean;
      };
    }) => {
      const response = await apiClient.patch<SingleResponse<Job>>(
        `jobs/${jobId}`,
        jobData,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] });
      Notification({
        toastMessage: "Job Updated Successfully",
        toastStatus: "success",
      });
    },
    onError: (error) => {
      Notification({
        toastMessage: "Job Updated UnSuccessfully",
        toastStatus: "error",
      });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiClient.delete(`jobs/${jobId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-jobs"] });
      Notification({
        toastMessage: "Job Deleted Successfully",
        toastStatus: "success",
      });
    },
    onError: (error) => {
      Notification({
        toastMessage: "Job Deleted UnSuccessfully",
        toastStatus: "error",
      });
    },
  });
};

export const useUpdateRecruiterProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch("/recruiters/profile", data);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["recruiter-current-profile"],
        }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
    },
  });
};

export const useCreateRecruiterProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/recruiters/profile", data);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["recruiter-current-profile"],
        }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-feature-list"] }),
      ]);
    },
  });
};

export const useGetCurrentRecruiterProfile = () => {
  return useQuery({
    queryKey: ["recruiter-current-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/recruiters/profile/current");
      return response.data;
    },
  });
};
