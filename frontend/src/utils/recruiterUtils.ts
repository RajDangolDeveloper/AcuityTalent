




export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};




export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  return formatDate(dateString);
};




export const getStatusColor = (
  status: string,
): {
  bg: string;
  text: string;
  label: string;
} => {
  const statusMap: Record<string, { bg: string; text: string; label: string }> =
    {
      APPLIED: { bg: "bg-blue-100", text: "text-blue-800", label: "Applied" },
      REVIEWED: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Reviewed",
      },
      SHORTLISTED: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Shortlisted",
      },
      INTERVIEWING: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        label: "Interviewing",
      },
      REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      OFFER_EXTENDED: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        label: "Offer Extended",
      },
      ACCEPTED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Accepted",
      },
      WITHDRAWN: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Withdrawn",
      },
    };

  return (
    statusMap[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    }
  );
};




export const getEmploymentTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
  };
  return typeMap[type] || type;
};




export const getMatchScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};




export const formatSalaryRange = (
  min?: number,
  max?: number,
): string | null => {
  if (!min || !max) return null;
  return `$${min}k - $${max}k`;
};




export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};




export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};




export const isCurrentYear = (year: number): boolean => {
  return new Date().getFullYear() === year;
};
