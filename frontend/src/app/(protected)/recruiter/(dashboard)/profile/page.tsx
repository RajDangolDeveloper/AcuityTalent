"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/recruiter/Button";
import { useGetCurrentUser, useUpdateUser } from "@/src/hooks/useUserApi";
import { useGetImageUrl } from "@/src/hooks/useImageApi";
import { Camera, Dot, FilePen, Pen, UserPen } from "lucide-react";
import { useGetCurrentRecruiterProfile } from "@/src/hooks/useRecruiterApi";
import { Panel, Tab, TabContainer, TabPanels } from "@/src/components/Tab";
import { useGetRecruiterWorkExperience } from "@/src/hooks/useExperienceApi";

export default function ProfilePage() {
  const { data: user } = useGetCurrentUser();
  const { data: recruiter } = useGetCurrentRecruiterProfile();
  const { data: workExperience } = useGetRecruiterWorkExperience();

  const ownerView = user?.id === recruiter?.userId;

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

  const items = [
    user?.contactEmail,
    user?.contactPhone,
    recruiter?.positionTitle,
    recruiter?.linkedinUrl,
    recruiter?.githubUrl,
  ].filter(Boolean);

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
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-11/12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="h-32 w-full rounded-t-2xl bg-[#433875]" />
          <div className="-mt-18 ">
            <div className="flex items-center justify-center flex-col gap-6 mb-6">
              <div className="w-36 h-36 relative">
                <img
                  src={userProfileUrl}
                  className="w-36 h-36 rounded-full bg-gray-200 border-4 border-white shadow"
                />
                <button className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium hover:bg-primary-600 transition disabled:opacity-50">
                  <Camera size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-2 justify-center items-center">
                <h1 className="font-semibold text-2xl text-gray-900">
                  {(user?.firstName ?? "Mr") +
                    " " +
                    (user?.lastName ?? "No Name")}
                </h1>
                <div className="flex">
                  {items.map((item, index) => (
                    <div className="flex" key={index}>
                      <div className="font-semibold">{item}</div>
                      {index < items.length - 1 && <Dot />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 px-10">
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

            <div className="flex justify-end gap-2 py-4">
              <Button
                variant="primary"
                size="md"
                className="px-6"
                type="submit"
                disabled={isSubmitting || updateUser.isPending}
              >
                Update Profile
              </Button>
              <Button
                variant="outline"
                size="md"
                className="px-6"
                type="submit"
                disabled={isSubmitting || updateUser.isPending}
                onClick={() => setIsEditing(!isEditing)}
              >
                Back to Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4/5 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="h-32 w-full rounded-t-2xl bg-[#433875]" />
          <div className="px-10 pb-10 -mt-18">
            <div className="flex items-center justify-center flex-col gap-6 mb-6">
              <div className="w-36 h-36 relative">
                <img
                  src={userProfileUrl}
                  className="w-36 h-36 rounded-full bg-gray-200 border-4 border-white shadow"
                />
                <button className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium hover:bg-primary-600 transition disabled:opacity-50">
                  <Camera size={14} />
                </button>
              </div>
              <div className="flex gap-2 flex-col justify-center items-center">
                <h1 className="font-semibold text-2xl text-gray-900">
                  {(user?.firstName ?? "Mr") +
                    " " +
                    (user?.lastName ?? "No Name")}
                </h1>
                <div className="flex">
                  {items.map((item, index) => (
                    <div className="flex" key={index}>
                      <div className="font-semibold">{item}</div>
                      {index < items.length - 1 && <Dot />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <TabContainer defaultValue="overview">
              <div className="flex gap-4 border-b border-gray-200 px-4">
                <Tab value={"overview"}>Overview</Tab>
                <Tab value={"experience"}>Experience</Tab>
                <Tab value={"skills"}>Skills</Tab>
                <Tab value={"education"}>Education</Tab>
              </div>
              <TabPanels>
                <Panel value={"overview"}>
                  <div className="flex flex-col gap-4">
                    {recruiter?.summary && (
                      <div className="flex flex-col gap-4">
                        <div className="font-semibold text-2xl">About</div>
                        <div className="text-sm py-6 px-4">
                          {recruiter?.summary}
                        </div>
                      </div>
                    )}

                    {!recruiter?.summary && ownerView && (
                      <div className="flex flex-col gap-4">
                        <div className="font-semibold text-2xl">About</div>
                        <div className="text-sm w-full py-10 px-4 border-2 border-dashed rounded-sm border-primary-300 hover:border-primary-400">
                          <div className="flex flex-col justify-center items-center">
                            <div className="border border-primary-500 h-12 w-12 rounded-full relative bg-primary-500">
                              <UserPen className="text-white h-6 w-6 absolute left-3 top-2.5" />
                            </div>
                            <div className="font-semibold pt-2 text-xl">
                              Tell your story
                            </div>
                            <div className="text-xs text-slate-500 w-xl pt-1 text-center">
                              Your profile is looking a bit quiet. The About
                              section introduces who you are, your core skills,
                              and what drives your professional growth.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!recruiter?.summary && !ownerView && (
                      <div className="flex flex-col gap-4">
                        <div className="font-semibold text-2xl">About</div>
                        <div className="text-sm w-full py-10 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <div className="flex flex-col justify-center items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                              <UserPen className="text-gray-400 h-6 w-6" />
                            </div>
                            <div className="font-semibold text-lg text-gray-800">
                              No summary provided
                            </div>
                            <div className="text-gray-500 max-w-md pt-1 text-sm">
                              This recruiter hasn't added an about section yet.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(workExperience?.length || 0 > 0) && (
                      <div className="flex flex-col gap-2">
                        <div className="font-semibold text-2xl">
                          Current Position
                        </div>
                        <div className="border border-gray-400 rounded-sm">
                          <div className="flex justify-between px-5 py-3">
                            <div className="border border-gray-400 rounded-sm p-4">
                              <div className="text-xl font-semibold px-2 py-1"></div>
                              <img src="" alt="" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(workExperience?.length || 0 === 0) && !ownerView && (
                      <div className="flex flex-col gap-2">
                        <div className="font-semibold text-2xl">
                          Current Position
                        </div>
                        <div className="border border-gray-400 rounded-sm">
                          <div className="flex justify-between px-5 py-3">
                            <div className="border border-gray-400 rounded-sm p-4">
                              <div className="text-xl font-semibold px-2 py-1">
                                {recruiter?.positionTitle}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(workExperience?.length || 0 === 0) && ownerView && (
                      <div className="flex flex-col gap-2 pt-2">
                        <div className="font-semibold text-2xl">
                          Current Position
                        </div>
                        <div className="text-sm w-full py-10 px-4 border-2 border-dashed rounded-sm border-primary-300 hover:border-primary-400 mt-2">
                          <div className="flex flex-col justify-center items-center">
                            <div className="border border-primary-500 h-12 w-12 rounded-full relative bg-primary-500">
                              <FilePen className="text-white h-6 w-6 absolute left-2.5 top-2.5" />
                            </div>
                            <div className="text-xl font-semibold px-2 py-1">
                              No current position added
                            </div>
                            <p className="text-xs text-center text-slate-500 max-w-xs mb-3">
                              Add your current role and company to keep your
                              experience up to date.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {recruiter?.skills && recruiter.skills.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <div className="font-semibold text-2xl">Skills</div>
                        {recruiter?.skills.map((skill, index) => {
                          return (
                            <div className="flex gap-4" key={index}>
                              <div className="border rounded-xs p-4">
                                {skill}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {recruiter?.skills &&
                    recruiter.skills.length === 0 &&
                    !ownerView ? (
                      <div className="flex flex-col gap-4">
                        <div className="font-semibold text-2xl">Skills</div>
                        <div className="flex flex-col justify-center items-center px-5 py-3">
                          <div className="border border-primary-500 h-12 w-12 rounded-full relative bg-primary-500">
                            <FilePen className="text-white h-6 w-6 absolute left-2.5 top-2.5" />
                          </div>
                          <div className="text-xl font-semibold px-2 py-1">
                            No Skills have been added yet
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 ">
                        <div className="font-semibold text-2xl">Skills</div>
                        <div className="flex flex-col justify-center items-center text-sm w-full py-10 px-4 border-2 border-dashed rounded-sm border-primary-300 hover:border-primary-400">
                          <div className="border border-primary-500 h-12 w-12 rounded-full relative bg-primary-500">
                            <Pen className="text-white h-6 w-6 absolute left-2.5 top-2.5" />
                          </div>
                          <div className="text-xl font-semibold px-2 py-1">
                            No skills listed
                          </div>
                          <p className="text-xs text-slate-500 max-w-xs">
                            This user hasn’t added any skills to their profile
                            yet.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
                <Panel value={"experience"}>
                  <div className="font-semibold text-2xl">Work Experience</div>
                  {workExperience?.length === 0 && (
                    <div className="border-2 border-dashed rounded-md px-6 py-4 mt-6">
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <div className="border border-primary-500 h-12 w-12 rounded-full relative bg-primary-500">
                          <UserPen className="text-white h-6 w-6 absolute left-3 top-2.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  <ul className="relative">
                    <li></li>
                  </ul>
                </Panel>
                <Panel value={"skills"}>Test Panel</Panel>
                <Panel value={"education"}>Test Panel</Panel>
              </TabPanels>
            </TabContainer>
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                className="px-6"
                type="submit"
                disabled={isSubmitting || updateUser.isPending}
                onClick={() => setIsEditing(!isEditing)}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
