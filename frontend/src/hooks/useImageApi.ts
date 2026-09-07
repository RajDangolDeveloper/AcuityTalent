import { useQuery } from "@tanstack/react-query";
import apiClient from "@/src/app/api/api-client";

export const useGetImageUrl = (
  fileName?: string | null,
  isPrivate: boolean = false,
) => {
  return useQuery({
    queryKey: ["image-url", fileName, isPrivate],
    enabled: !!fileName,
    queryFn: async () => {
      const response = await apiClient.get<string>(`/spaces/upload-url`, {
        params: {
          fileName,
          isPrivate,
        },
      });
      return response;
    },
  });
};
