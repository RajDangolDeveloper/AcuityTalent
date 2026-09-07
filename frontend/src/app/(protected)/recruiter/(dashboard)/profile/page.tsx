"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/recruiter/Button";
import { useGetCurrentUser, useUpdateUser } from "@/src/hooks/useUserApi";
import { useGetImageUrl } from "@/src/hooks/useImageApi";
import { Camera } from "lucide-react";
import { useGetCurrentRecruiterProfile } from "@/src/hooks/useRecruiterApi";

export default function ProfilePage() {
  const { data: user } = useGetCurrentUser();
  const { data: recruiter } = useGetCurrentRecruiterProfile();

  console.log(recruiter);

  const { data: pfpUrl } = useGetImageUrl(user?.profilePictureUrl);

  const updateUser = useUpdateUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const userProfileUrl = pfpUrl?.data;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        contactPhone: user.contactPhone ?? "",
        contactEmail: user.contactEmail ?? "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.contactPhone.trim() ||
      !formData.contactEmail.trim()
    ) {
      setFormMessage("All profile fields are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      setFormMessage(null);
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          contactPhone: formData.contactPhone.trim(),
          contactEmail: formData.contactEmail.trim(),
        },
      });
      setFormMessage("Profile updated successfully.");
    } catch (error) {
      setFormMessage("Unable to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return isEditing ? (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {formMessage}
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactPhone: e.target.value,
                }))
              }
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }))
              }
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            size="md"
            className="px-6"
            type="submit"
            disabled={isSubmitting || updateUser.isPending}
          >
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  ) : (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-11/12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="h-32 w-full rounded-t-2xl bg-[#433875]" />
          <div className="px-10 pb-10 -mt-18">
            <div className="flex items-center justify-center flex-col gap-6 mb-8">
              <div className="w-36 h-36 relative">
                <img
                  src={userProfileUrl}
                  className="w-36 h-36 rounded-full bg-gray-200 border-4 border-white shadow"
                />
                <button className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium hover:bg-primary-600 transition disabled:opacity-50">
                  <Camera size={14} />
                </button>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {(user?.firstName ?? "Mr") +
                  " " +
                  (user?.lastName ?? "No Name")}
              </h1>
              <div className="flex gap-4">
                {user?.contactEmail && <div>{user?.contactEmail}</div>}
                {user?.contactPhone && <div>{user?.contactPhone}</div>}
                {recruiter?.positionTitle && (
                  <div>{recruiter?.positionTitle}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
