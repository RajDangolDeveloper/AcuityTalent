"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateJob } from "@/src/hooks/useRecruiterApi";
import Notification from "@/src/element/Notification";

export default function CreateJobPage() {
  const router = useRouter();
  const createJobMutation = useCreateJob();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    salary: "",
    employmentType: "FULL_TIME",
    locationtype: "HYBRID",
    experience: "",
    location: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Notification({
        toastMessage: "Please fill in all required fields",
        toastStatus: "error",
      });
      return;
    }

    try {
      await createJobMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        requirements: formData.experience,
        employmentType: formData.employmentType,
        experienceLevel: undefined,
        salaryRange: formData.salary,
        location: formData.location,
        remoteAvailable: formData.locationtype === "REMOTE",
      });

      Notification({
        toastMessage: "Job created successfully!",
        toastStatus: "success",
      });

      router.push("/recruiter/jobs");
    } catch (error) {
      Notification({
        toastMessage:
          error instanceof Error ? error.message : "Failed to create job",
        toastStatus: "error",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-4 font-semibold"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create your job posting
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border-2 border-gray-300 p-8 space-y-6">
            {/* Main Information Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Main Information
              </h2>

              {/* Title and Company Row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Senior UI/UX Designer"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Company
                  </label>
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.company ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">e.g. LinkedIn</option>
                    <option value="company1">Company 1</option>
                    <option value="company2">Company 2</option>
                    <option value="company3">Company 3</option>
                  </select>
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Salary, Employment Type, Location Type Row */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g. 12500 - 25000"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location Type
                  </label>
                  <select
                    name="locationtype"
                    value={formData.locationtype}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>
              </div>

              {/* Experience and Location Row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    placeholder="e.g. 2 - 5+ years"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Kathmandu, Nepal"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Write a detailed job description using markdown formatting...

**Example:**
We're looking for a talented Senior UI/UX Designer to join our team.

## About the Role
In this role, you'll be responsible for creating intuitive, user-centered designs that drive engagement and delight our customers.

## What You'll Do
- Design intuitive user interfaces
- Collaborate with cross-functional teams
- Lead design reviews and presentations
- Conduct user research and usability testing

## Required Qualifications
- 5+ years of experience in UI/UI design
- Expert proficiency in Figma, Sketch, or Adobe XD
- Strong portfolio demonstrating user-centered design solutions
- Deep understanding of accessibility standards (WCAG 2.1)

## Preferred Qualifications
- Bachelor's degree in Design, HCI, or related field
- Experience working in Agile/Scrum environments
- Familiarity with front-end technologies (HTML, CSS, React)"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={20}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-900 rounded font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createJobMutation.isPending}
                className="px-8 py-2 bg-primary-600 text-white rounded font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createJobMutation.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
