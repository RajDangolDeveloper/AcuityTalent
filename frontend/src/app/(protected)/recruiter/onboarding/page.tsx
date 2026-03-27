"use client";

import CustomButton from "@/src/components/CustomButton";
import React, { useState } from "react";
import { useGetCompaniesName } from "@/src/hooks/useCompanyApi";
import { useUpdateRecruiterProfile } from "@/src/hooks/useRecruiterApi";
import { useUpdateUser } from "@/src/hooks/useUserApi";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { data: session, update } = useSession();
  const { data: companiesResponse, isLoading: companiesLoading } =
    useGetCompaniesName();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateRecruiterProfile();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  const companies = companiesResponse?.data || [];

  const handleCompanySubmit = async () => {
    if (!selectedCompanyName) {
      alert("Please select a company");
      return;
    }

    // Find the company ID based on the name
    const company = companies.find((c: any) => c.name === selectedCompanyName);

    if (!company) {
      alert("Please select a valid company from the list");
      return;
    }

    try {
      if (!session?.user?.id) return;

      const userId = Number(session.user.id);

      await updateProfile({
        companyId: company.id,
      });

      await updateUser({
        id: userId,
        data: { isOnboarded: true },
      });

      await update({onboarded: true});
      router.push("/recruiter/dashboard");
    } catch (error) {
      console.error("Failed to submit onboarding data:", error);
      alert("Failed to submit onboarding data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#380294_0%,_#4d1b96_50%,_#52507d_100%)] flex items-center justify-center p-4 relative font-sans">
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <div className="w-4 h-4 bg-white rounded-sm"></div>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
      </div>
      <div className="absolute top-6 right-6">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-10 w-full max-w-[440px]">
          <h1 className="text-[32px] font-bold text-black mb-8">
            Find your Business
          </h1>

          <div className="mb-8">
            <label className="block text-[15px] font-bold text-black mb-1">
              Company
            </label>
            <span className="block text-sm text-gray-600 mb-3">
              Select your company
            </span>
            <input
              type="text"
              list="companies-list"
              className="w-full border border-gray-200 rounded-lg p-4 text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all mb-6"
              placeholder={
                companiesLoading
                  ? "Loading companies..."
                  : "Type to search or select a company"
              }
              value={selectedCompanyName}
              onChange={(e) => setSelectedCompanyName(e.target.value)}
              disabled={companiesLoading}
            />
            <datalist id="companies-list">
              {companies.map((company: any) => (
                <option key={company.id} value={company.name} />
              ))}
            </datalist>
            <CustomButton
              className=""
              color={"primary"}
              onClick={handleCompanySubmit}
              disabled={isUpdatingProfile || isUpdatingUser || companiesLoading}
            >
              {isUpdatingProfile || isUpdatingUser ? "Submitting..." : "Submit"}
            </CustomButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-black">Didn't find your company? </span>
            <button
              onClick={() => setStep(2)}
              className="text-[#4c4280] font-medium hover:underline focus:outline-none"
            >
              Create your own
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-10 w-full max-w-[700px]">
          <h1 className="text-[32px] font-bold text-black mb-8">
            Create your Company
          </h1>
          <div className="grid grid-cols-3 gap-x-10 mb-10 items-start">
            <div className="col-span-2">
              <h2 className="text-lg font-bold text-black mb-6">
                Main Information
              </h2>
              <div className="mb-4">
                <label className="block text-sm text-black mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Name of this glorious company"
                  className="w-full border border-gray-200 rounded-lg p-4 text-gray-400 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="What does your company do?"
                  className="w-full border border-gray-200 rounded-lg p-4 text-gray-400 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="row-span-1 w-[200px] flex flex-col items-center gap-4 pt-10">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <button className="bg-[#4e4871] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d3858] transition-colors">
                Upload Logo
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm text-black mb-1">
                Company Size
              </label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-lg p-4 text-gray-400 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer">
                  <option value="" disabled selected>
                    Size of the Company
                  </option>
                  <option>1-10 Employees</option>
                  <option>11-50 Employees</option>
                  <option>51-200 Employees</option>
                  <option>201+ Employees</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-black mb-1">Email</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="example@company.com"
                  className="w-full border border-gray-200 rounded-lg p-4 text-gray-400 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black mb-4">
              About your company
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div>
                <label className="block text-sm text-black mb-1">
                  Industry
                </label>
                <div className="relative">
                  <select className="w-full border border-gray-200 rounded-lg p-4 text-gray-400 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer">
                    <option value="" disabled selected>
                      Industry of the Company
                    </option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-black mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Address of your company"
                  className="w-full border border-gray-200 rounded-lg p-4 text-gray-400 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStep(1)} // Added ability to go back
                className="border border-[#4e4871] text-[#4e4871] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
              <button
                // The image had a next button with the same text and style as screen 1
                className="bg-[#4e4871] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#3d3858] transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
