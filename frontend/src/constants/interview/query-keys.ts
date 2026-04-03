export const interviewQueryKeys = {
  interviews: {
    all: ["interviews"] as const,
    upcoming: (month?: string) =>
      [
        ...interviewQueryKeys.interviews.all,
        "upcoming",
        month ?? "all",
      ] as const,
    detail: (id: number | string) =>
      [...interviewQueryKeys.interviews.all, "detail", id] as const,
    byRoom: (roomId: string) =>
      [...interviewQueryKeys.interviews.all, "room", roomId] as const,
  },
} as const;
