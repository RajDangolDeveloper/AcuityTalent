import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";
import {
  PaginatedResponse,
  Job,
  JobDetails,
  CandidateApplication,
  SingleResponse,
  SavedJob,
  CandidateProfile,
  Resume,
  EmploymentType,
  WorkExperience,
  Education,
} from "@/src/types/candidate";

// Get all active jobs with filters
export const getAllJobs = (
  page: number = 1,
  limit: number = 10,
  filters?: {
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    remoteOnly?: boolean;
    search?: string;
  },
) => {
  return useQuery({
    queryKey: ["candidate-jobs", page, limit, filters],
    queryFn: async () => {
      console.log("[getAllJobs] Fetching jobs", { page, limit, filters });
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (filters?.location) params.append("location", filters.location);
      if (filters?.employmentType)
        params.append("employmentType", filters.employmentType);
      if (filters?.experienceLevel)
        params.append("experienceLevel", filters.experienceLevel);
      if (filters?.remoteOnly) params.append("remoteOnly", "true");
      if (filters?.search) params.append("search", filters.search);

      try {
        const response = await apiClient.get<PaginatedResponse<Job>>(
          `/jobs?${params.toString()}`,
        );
        console.log("[getAllJobs] Success:", response.data);
        return response.data;
      } catch (error) {
        console.error("[getAllJobs] Error:", error);
        throw error;
      }
    },
  });
};

// Get job details
export const useJobDetails = (jobId: number | null) => {
  return useQuery({
    queryKey: ["job-details", jobId],
    queryFn: async () => {
      console.log("[useJobDetails] Fetching job details for jobId:", jobId);
      try {
        const response = await apiClient.get<SingleResponse<JobDetails>>(
          `/jobs/${jobId}`,
        );
        console.log("[useJobDetails] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useJobDetails] Error:", error);
        throw error;
      }
    },
    enabled: !!jobId,
  });
};

// Get candidate's applications
export const useCandidateApplications = (
  page: number = 1,
  limit: number = 10,
  status?: string,
) => {
  return useQuery({
    queryKey: ["candidate-applications", page, limit, status],
    queryFn: async () => {
      console.log("[useCandidateApplications] Fetching applications", {
        page,
        limit,
        status,
      });
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      try {
        const response = await apiClient.get<
          PaginatedResponse<CandidateApplication>
        >(`/applications/candidate/all?${params.toString()}`);
        console.log("[useCandidateApplications] Success:", response.data);
        return response.data;
      } catch (error) {
        console.error("[useCandidateApplications] Error:", error);
        throw error;
      }
    },
  });
};

export const useCreateCandidateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      headline,
      currentPosition,
      currentCompanyId,
      experienceYears,
      highestDegree,
      skills,
      preferredLocation,
      preferredJobType,
      expectedSalary,
      linkedinUrl,
      githubUrl,
      phone,
      location,
      summary,
    }: {
      headline?: string;
      currentPosition?: string;
      currentCompanyId?: number;
      experienceYears?: number;
      highestDegree?: string;
      skills?: string[];
      preferredLocation?: string;
      preferredJobType?: EmploymentType;
      expectedSalary?: number;
      linkedinUrl?: string;
      githubUrl?: string;
      phone?: string;
      location?: string;
      summary?: string;
    }) => {
      try {
        const response = await apiClient.post<SingleResponse<CandidateProfile>>(
          "/candidates/profile",
          {
            headline,
            currentPosition,
            currentCompanyId,
            experienceYears,
            highestDegree,
            skills,
            preferredLocation,
            preferredJobType,
            expectedSalary,
            linkedinUrl,
            githubUrl,
            phone,
            location,
            summary,
          },
        );
        return response.data.data;
      } catch (error) {
        console.error("[useCreateProfile] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useCreateProfile] Invalidating related queries");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
};

// Create application
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      resumeId,
      coverLetter,
    }: {
      jobId: number;
      resumeId: number;
      coverLetter?: string;
    }) => {
      console.log("[useCreateApplication] Creating application", {
        jobId,
        resumeId,
        coverLetter,
      });
      try {
        const response = await apiClient.post<
          SingleResponse<CandidateApplication>
        >("/applications", {
          jobId,
          resumeId,
          coverLetter: coverLetter || "",
        });
        console.log("[useCreateApplication] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useCreateApplication] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useCreateApplication] Invalidating related queries");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] });
    },
  });
};

// Get candidate's saved jobs
export const useCandidateSavedJobs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["candidate-saved-jobs", page, limit],
    queryFn: async () => {
      console.log("[useCandidateSavedJobs] Fetching saved jobs", {
        page,
        limit,
      });
      try {
        const response = await apiClient.get<PaginatedResponse<SavedJob>>(
          `/saved-jobs?page=${page}&limit=${limit}`,
        );
        console.log("[useCandidateSavedJobs] Success:", response.data);
        return response.data;
      } catch (error) {
        console.error("[useCandidateSavedJobs] Error:", error);
        throw error;
      }
    },
  });
};

// Save a job
export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      console.log("[useSaveJob] Saving job", { jobId });
      try {
        const response = await apiClient.post<SingleResponse<SavedJob>>(
          "/saved-jobs",
          { jobId },
        );
        console.log("[useSaveJob] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useSaveJob] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useSaveJob] Invalidating saved jobs query");
      queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] });
    },
  });
};

// Remove saved job
export const useRemoveSavedJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      console.log("[useRemoveSavedJob] Removing saved job", { jobId });
      try {
        await apiClient.delete(`/saved-jobs/${jobId}`);
        console.log("[useRemoveSavedJob] Success");
      } catch (error) {
        console.error("[useRemoveSavedJob] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[useRemoveSavedJob] Invalidating saved jobs query");
      queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] });
    },
  });
};

// Get candidate profile
export const useCandidateProfile = () => {
  return useQuery({
    queryKey: ["candidate-profile"],
    queryFn: async () => {
      console.log("[useCandidateProfile] Fetching candidate profile");
      try {
        const response =
          await apiClient.get<SingleResponse<CandidateProfile>>(
            "/candidates/profile",
          );
        console.log("[useCandidateProfile] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useCandidateProfile] Error:", error);
        throw error;
      }
    },
  });
};

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Partial<{
        headline: string;
        currentPosition: string;
        currentCompanyId: number;
        experienceYears: number;
        highestDegree: string;
        skills: string[];
        preferredLocation: string;
        preferredJobType: EmploymentType;
        expectedSalary: number;
        linkedinUrl: string;
        githubUrl: string;
      }>,
    ) => {
      try {
        const response = await apiClient.patch<SingleResponse<CandidateProfile>>(
          "/candidates/profile",
          payload,
        );
        return response.data.data;
      } catch (error) {
        console.error("[useUpdateCandidateProfile] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    },
  });
};

// Get candidate's resumes
export const useCandidateResumes = () => {
  return useQuery({
    queryKey: ["candidate-resumes"],
    queryFn: async () => {
      console.log("[useCandidateResumes] Fetching candidate resumes");
      try {
        const response = await apiClient.get<{ data: Resume[] }>("/resumes");
        console.log("[useCandidateResumes] Success:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("[useCandidateResumes] Error:", error);
        throw error;
      }
    },
  });
};

// Work experience CRUD
export const useCandidateWorkExperiences = () => {
  return useQuery({
    queryKey: ["candidate-work-experiences"],
    queryFn: async () => {
      console.log("[useCandidateWorkExperiences] Fetching work experiences");
      try {
        const response = await apiClient.get<
          SingleResponse<WorkExperience[]>
        >("/candidates/work-experience");
        return response.data.data;
      } catch (error) {
        console.error("[useCandidateWorkExperiences] Error:", error);
        throw error;
      }
    },
  });
};

export const useCreateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      isCurrent?: boolean;
      description?: string;
    }) => {
      try {
        const response = await apiClient.post<
          SingleResponse<WorkExperience>
        >("/candidates/work-experience", payload);
        return response.data.data;
      } catch (error) {
        console.error("[useCreateWorkExperience] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-work-experiences"],
      });
    },
  });
};

export const useUpdateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      company?: string;
      position?: string;
      startDate?: string;
      endDate?: string | null;
      isCurrent?: boolean;
      description?: string;
    }) => {
      try {
        const response = await apiClient.patch<
          SingleResponse<WorkExperience>
        >(`/candidates/work-experience/${id}`, payload);
        return response.data.data;
      } catch (error) {
        console.error("[useUpdateWorkExperience] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-work-experiences"],
      });
    },
  });
};

export const useDeleteWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/candidates/work-experience/${id}`);
      } catch (error) {
        console.error("[useDeleteWorkExperience] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-work-experiences"],
      });
    },
  });
};

// Education CRUD
export const useCandidateEducations = () => {
  return useQuery({
    queryKey: ["candidate-educations"],
    queryFn: async () => {
      console.log("[useCandidateEducations] Fetching educations");
      try {
        const response = await apiClient.get<SingleResponse<Education[]>>(
          "/candidates/education",
        );
        return response.data.data;
      } catch (error) {
        console.error("[useCandidateEducations] Error:", error);
        throw error;
      }
    },
  });
};

export const useCreateEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      institution: string;
      degree: string;
      fieldOfStudy?: string;
      startDate: string;
      endDate?: string;
      gpa?: number;
      description?: string;
    }) => {
      try {
        const response = await apiClient.post<SingleResponse<Education>>(
          "/candidates/education",
          payload,
        );
        return response.data.data;
      } catch (error) {
        console.error("[useCreateEducation] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-educations"] });
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      institution?: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: string;
      endDate?: string | null;
      gpa?: number;
      description?: string;
    }) => {
      try {
        const response = await apiClient.patch<SingleResponse<Education>>(
          `/candidates/education/${id}`,
          payload,
        );
        return response.data.data;
      } catch (error) {
        console.error("[useUpdateEducation] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-educations"] });
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/candidates/education/${id}`);
      } catch (error) {
        console.error("[useDeleteEducation] Error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-educations"] });
    },
  });
};
