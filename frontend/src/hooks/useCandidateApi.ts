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
import { ApplicationsResponse } from "../types/application";
import { candidateQueryKeys } from "../constants/candidate/query-keys";
import { queryClient } from "@/library/queryClient";


export const useGetCandidateApplications = () => {
  const params = { page: 1, limit: 50 };

  return useQuery({
    queryKey: candidateQueryKeys.candidate.applications.list(params),
    queryFn: async () => {
      const res = await apiClient.get<ApplicationsResponse>(
        "/applications/candidate/all",
        { params },
      );
      return res.data.data;
    },
  });
};

export const useCreateCandidateProfile = () => {
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

// Get candidate profile
export const useCandidateProfile = () => {
  return useQuery({
    queryKey: ["candidate-profile"],
    queryFn: async () => {
      console.log("[useCandidateProfile] Fetching candidate profile");
      try {
        const response = await apiClient.get<SingleResponse<CandidateProfile>>(
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
        summary: string;
        phone: string;
        location: string;
        preferredJobType: EmploymentType;
        expectedSalary: number;
        linkedinUrl: string;
        githubUrl: string;
      }>,
    ) => {
      try {
        const response = await apiClient.patch<
          SingleResponse<CandidateProfile>
        >("/candidates/profile", payload);
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

export const useCandidateWorkExperiences = () => {
  return useQuery({
    queryKey: ["candidate-work-experiences"],
    queryFn: async () => {
      console.log("[useCandidateWorkExperiences] Fetching work experiences");
      try {
        const response = await apiClient.get<SingleResponse<WorkExperience[]>>(
          "/candidates/work-experience",
        );
        return response.data.data;
      } catch (error) {
        console.error("[useCandidateWorkExperiences] Error:", error);
        throw error;
      }
    },
  });
};

export const useCreateWorkExperience = () => {
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
        const response = await apiClient.post<SingleResponse<WorkExperience>>(
          "/candidates/work-experience",
          payload,
        );
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

export const useGetCandidateById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: async () => {
      // This part only runs if enabled is true
      const response = await apiClient.get<SingleResponse<any>>(
        `/candidates/${id}`,
      );
      return response.data.data;
    },
    // 💡 This is the magic: The query won't run if id is undefined
    enabled: typeof id === "number",
  });
};
