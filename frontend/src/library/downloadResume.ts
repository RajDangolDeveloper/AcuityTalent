import apiClient from "@/src/app/api/api-client";

export async function downloadResume(resumeId: number, fileName?: string) {
  const response = await apiClient.get(`/resumes/${resumeId}/download`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "resume.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
