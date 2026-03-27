"use client";

import { useEffect, useState } from "react";
import {
  useCandidateProfile,
  useUpdateCandidateProfile,
  useCandidateWorkExperiences,
  useCreateWorkExperience,
  useUpdateWorkExperience,
  useDeleteWorkExperience,
  useCandidateEducations,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
} from "@/src/hooks/useCandidateApi";

import {
  CandidateProfile,
  WorkExperience,
  Education,
} from "@/src/types/candidate";
import { useGetUser } from "@/src/hooks/useUserApi";
import { useRecruiterCompanies } from "@/src/hooks/useCompanyApi";

export default function CandidateProfilePage() {
  const { data: profile } = useCandidateProfile();
  const { data: user } = useGetUser();
  const { data: experiences } = useCandidateWorkExperiences();
  const { data: educations } = useCandidateEducations();
  const { data: companies } = useRecruiterCompanies();

  const { mutate: updateProfile } = useUpdateCandidateProfile();
  const { mutate: createWorkExp } = useCreateWorkExperience();
  const { mutate: updateWorkExp } = useUpdateWorkExperience();
  const { mutate: deleteWorkExp } = useDeleteWorkExperience();
  const { mutate: createEducation } = useCreateEducation();
  const { mutate: updateEducation } = useUpdateEducation();
  const { mutate: deleteEducation } = useDeleteEducation();

  const [profileForm, setProfileForm] = useState<Partial<CandidateProfile>>({
    headline: "",
    preferredLocation: "",
    preferredJobType: undefined,
    expectedSalary: undefined,
    linkedinUrl: "",
    githubUrl: "",
    skills: [],
    currentCompanyId: undefined,
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        headline: profile.headline ?? "",
        preferredLocation: profile.preferredLocation ?? "",
        preferredJobType: profile.preferredJobType,
        expectedSalary: profile.expectedSalary ?? undefined,
        linkedinUrl: profile.linkedinUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
        skills: profile.skills ?? [],
        currentCompanyId: profile.currentCompanyId,
      });
    }
  }, [profile]);

  const [newSkill, setNewSkill] = useState("");

  const [editingExperience, setEditingExperience] =
    useState<WorkExperience | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null,
  );
  const [educationForm, setEducationForm] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    gpa: "",
    description: "",
  });

  const handleUpdateProfile = () => {
    updateProfile({
      headline: profileForm.headline,
      preferredLocation: profileForm.preferredLocation,
      preferredJobType: profileForm.preferredJobType,
      expectedSalary: profileForm.expectedSalary,
      linkedinUrl: profileForm.linkedinUrl,
      githubUrl: profileForm.githubUrl,
      currentCompanyId: profileForm.currentCompanyId,
      skills: profileForm.skills ?? [],
    });
  };

  const resetExperienceForm = () => {
    setEditingExperience(null);
    setExperienceForm({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
  };

  const handleSaveExperience = () => {
    if (editingExperience) {
      updateWorkExp({
        id: editingExperience.id,
        ...experienceForm,
        endDate: experienceForm.endDate || null,
      });
    } else {
      createWorkExp({
        ...experienceForm,
        endDate: experienceForm.endDate || undefined,
      });
    }
    resetExperienceForm();
  };

  const startEditExperience = (exp: WorkExperience) => {
    setEditingExperience(exp);
    setExperienceForm({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate.slice(0, 10),
      endDate: exp.endDate ? exp.endDate.slice(0, 10) : "",
      isCurrent: exp.isCurrent,
      description: exp.description || "",
    });
  };

  const resetEducationForm = () => {
    setEditingEducation(null);
    setEducationForm({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    });
  };

  const handleSaveEducation = () => {
    const payload = {
      institution: educationForm.institution,
      degree: educationForm.degree,
      fieldOfStudy: educationForm.fieldOfStudy || undefined,
      startDate: educationForm.startDate,
      endDate: educationForm.endDate || undefined,
      gpa: educationForm.gpa ? Number(educationForm.gpa) : undefined,
      description: educationForm.description || undefined,
    };

    if (editingEducation) {
      updateEducation({ id: editingEducation.id, ...payload });
    } else {
      createEducation(payload);
    }
    resetEducationForm();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto my-8 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="h-24 w-full rounded-t-2xl bg-[#433875]" />
          <div className="px-8 pb-10 -mt-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Raj Dangol
                </h1>
              </div>
            </div>

            {/* Personal & Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="text"
                    defaultValue={profile?.headline?.split(" ")[0] ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="text"
                    defaultValue={profile?.preferredLocation ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="tel"
                    defaultValue={profile?.phone ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="email"
                    defaultValue={user?.contactEmail ?? ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headline
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="text"
                    value={profileForm.headline ?? ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        headline: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / About
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#433875]"
                  defaultValue={profile?.summary ?? ""}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Location
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="text"
                    value={profileForm.preferredLocation ?? ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        preferredLocation: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Salary
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="number"
                    value={profileForm.expectedSalary ?? ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        expectedSalary: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="url"
                    value={profileForm.linkedinUrl ?? ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        linkedinUrl: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Company
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    value={profileForm.currentCompanyId ?? ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        currentCompanyId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  >
                    <option value="">Select company</option>
                    {(companies || []).map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    type="url"
                    value={profileForm.githubUrl ?? ""}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        githubUrl: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!newSkill.trim()) return;
                          setProfileForm((prev) => ({
                            ...prev,
                            skills: [...(prev.skills ?? []), newSkill.trim()],
                          }));
                          setNewSkill("");
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-xs rounded-md bg-[#433875] text-white"
                      onClick={() => {
                        if (!newSkill.trim()) return;
                        setProfileForm((prev) => ({
                          ...prev,
                          skills: [...(prev.skills ?? []), newSkill.trim()],
                        }));
                        setNewSkill("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(profileForm.skills ?? []).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  className="px-6 py-2 rounded-md bg-[#433875] text-white text-sm font-medium"
                >
                  Update Profile
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Experience
              </h2>
              <div className="space-y-3">
                {experiences?.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-start justify-between rounded-md border border-gray-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {exp.position} @ {exp.company}
                      </p>
                      <p className="text-xs text-gray-600">
                        {exp.startDate?.toString().slice(0, 10)} -{" "}
                        {exp.isCurrent
                          ? "Present"
                          : exp.endDate?.toString().slice(0, 10) || "N/A"}
                      </p>
                      {exp.description && (
                        <p className="mt-1 text-xs text-gray-700">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs text-[#433875]"
                        onClick={() => startEditExperience(exp)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() => deleteWorkExp(exp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={experienceForm.company}
                      onChange={(e) =>
                        setExperienceForm((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select company</option>
                      {(companies || []).map((company: any) => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={experienceForm.position}
                      onChange={(e) =>
                        setExperienceForm((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={experienceForm.startDate}
                      onChange={(e) =>
                        setExperienceForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={experienceForm.endDate}
                      onChange={(e) =>
                        setExperienceForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={experienceForm.isCurrent}
                      onChange={(e) =>
                        setExperienceForm((prev) => ({
                          ...prev,
                          isCurrent: e.target.checked,
                        }))
                      }
                    />
                    Current role
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    value={experienceForm.description}
                    onChange={(e) =>
                      setExperienceForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {editingExperience && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md border border-gray-300 text-xs"
                      onClick={resetExperienceForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-[#433875] text-white text-xs"
                    onClick={handleSaveExperience}
                  >
                    {editingExperience ? "Update Experience" : "Add Experience"}
                  </button>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              <div className="space-y-3">
                {educations?.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex items-start justify-between rounded-md border border-gray-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {edu.degree} @ {edu.institution}
                      </p>
                      <p className="text-xs text-gray-600">
                        {edu.startDate?.toString().slice(0, 10)} -{" "}
                        {edu.endDate?.toString().slice(0, 10) || "Present"}
                      </p>
                      {edu.fieldOfStudy && (
                        <p className="text-xs text-gray-700">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs text-[#433875]"
                        onClick={() => {
                          setEditingEducation(edu);
                          setEducationForm({
                            institution: edu.institution,
                            degree: edu.degree,
                            fieldOfStudy: edu.fieldOfStudy || "",
                            startDate: edu.startDate.slice(0, 10),
                            endDate: edu.endDate
                              ? edu.endDate.slice(0, 10)
                              : "",
                            gpa: edu.gpa?.toString() || "",
                            description: edu.description || "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() => deleteEducation(edu.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Institution
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={educationForm.institution}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          institution: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Degree
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={educationForm.degree}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          degree: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Field of Study
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={educationForm.fieldOfStudy}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          fieldOfStudy: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      GPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={educationForm.gpa}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          gpa: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={educationForm.startDate}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#433875]"
                      value={educationForm.endDate}
                      onChange={(e) =>
                        setEducationForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#433875]"
                    value={educationForm.description}
                    onChange={(e) =>
                      setEducationForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {editingEducation && (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md border border-gray-300 text-xs"
                      onClick={resetEducationForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-[#433875] text-white text-xs"
                    onClick={handleSaveEducation}
                  >
                    {editingEducation ? "Update Education" : "Add Education"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
