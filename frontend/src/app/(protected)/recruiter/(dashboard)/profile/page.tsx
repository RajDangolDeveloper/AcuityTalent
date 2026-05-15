"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/recruiter/Button";
import { useGetCurrentUser, useUpdateUser } from "@/src/hooks/useUserApi";

export default function ProfilePage() {
  const { data: recruiter } = useGetCurrentUser();
  const updateUser = useUpdateUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    if (recruiter) {
      setFormData({
        firstName: recruiter.firstName ?? "",
        lastName: recruiter.lastName ?? "",
        contactPhone: recruiter.contactPhone ?? "",
        contactEmail: recruiter.contactEmail ?? "",
      });
    }
  }, [recruiter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recruiter?.id) return;

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
        id: recruiter.id,
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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="h-24 w-full rounded-t-2xl bg-[#433875]" />
          <div className="px-10 pb-10 -mt-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow" />
              <h1 className="text-2xl font-semibold text-gray-900">
                {(recruiter?.firstName ?? "Mr") +
                  " " +
                  (recruiter?.lastName ?? "No Name")}
              </h1>
            </div>

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
        </div>
      </div>
    </div>
  );
}
