export const candidateQueryKeys = {
  candidate: {
    all: ["candidate"] as const,
    applications: {
      all: () => [...candidateQueryKeys.candidate.all, "applications"] as const,
      list: (params: { page: number; limit: number }) =>
        [
          ...candidateQueryKeys.candidate.applications.all(),
          "list",
          params,
        ] as const,
    },
  },
} as const;
