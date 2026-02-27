import {
  useQuery,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import {
  PaginatedResponse,
  Job,
  CandidateApplication,
  SingleResponse,
  ApplicationDetail,
  CandidateProfile,
  ApplicationStatus,
} from "../types/recruiter";

// Get recruiter's jobs
export const useRecruiterJobs = (
  page: number = 1,
  limit: number = 10,
  status: string = "ACTIVE",
) => {
  return useQuery({
    queryKey: ["recruiter-jobs", page, limit, status],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Job>>(
        "/jobs/recruiter/my-jobs",
        {
          params: { page, limit, status },
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
      console.log(response);
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
  });
};


// Create job
export const useCreateJob = () => {
  return useMutation({
    mutationFn: async (jobData: {
      title: string;
      description: string;
      requirements?: string;
      employmentType: string;
      experienceLevel?: string;
      salaryRange?: string;
      location: string;
      remoteAvailable: boolean;
    }) => {
      const response = await apiClient.post<SingleResponse<Job>>(
        "/jobs",
        jobData,
      );
      console.log(response);
      return response.data.data;
    },
  });
};

// Get recruiter's companies
export const useRecruiterCompanies = () => {
  return useQuery({
    queryKey: ["recruiter-companies"],
    queryFn: async () => {
      const response = await apiClient.get<SingleResponse<any>>("/companies");
      console.log(response);
      return response.data.data;
    },
  });
};
