export const interviewRequestQueryKeys = {
  all: ["interview-requests"] as const,
  lists: () => [...interviewRequestQueryKeys.all, "list"] as const,
  details: () => [...interviewRequestQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...interviewRequestQueryKeys.details(), id] as const,
  byRecruiter: (recruiterId: number) =>
    [...interviewRequestQueryKeys.all, "recruiter", recruiterId] as const,
  byCandidate: (candidateId: number) =>
    [...interviewRequestQueryKeys.all, "candidate", candidateId] as const,
};
