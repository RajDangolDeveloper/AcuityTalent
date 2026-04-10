"use client";

import CustomButton from "@/src/components/CustomButton";
import React, { useState } from "react";
import {
  useCreateCompany,
  useGetCompaniesName,
} from "@/src/hooks/useCompanyApi";
import { useUpdateUser } from "@/src/hooks/useUserApi";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CompanySize, Industry } from "@/src/types/company";
import { useCreateRecruiterProfile } from "@/src/hooks/useRecruiterApi";

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { data: session, update } = useSession();
  const { data: companiesResponse, isLoading: companiesLoading } =
    useGetCompaniesName();

  const createCompany = useCreateCompany();
  const { mutateAsync: createProfile, isPending: isCreatingProfile } =
    useCreateRecruiterProfile();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  const INDUSTRY_OPTIONS = [
    "TECHNOLOGY",
    "HEALTHCARE",
    "FINANCE",
    "EDUCATION",
    "RETAIL",
    "MANUFACTURING",
    "CONSULTING",
    "REAL_ESTATE",
    "ENTERTAINMENT",
    "HOSPITALITY",
    "CONSTRUCTION",
    "TRANSPORTATION",
    "ENERGY",
    "TELECOMMUNICATIONS",
    "MARKETING",
    "NON_PROFIT",
    "GOVERNMENT",
    "OTHER",
  ];

  // New State for Company Creation
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    companySize: "",
    email: "",
    industry: "",
    address: "",
  });

  const companies = companiesResponse?.data || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyCreate = async () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in at least the company name and email.");
      return;
    }

    try {
      await createCompany.mutateAsync({
        ownerId: Number(session?.user?.id),
        name: formData.name,
        description: formData.description,
        companySize: formData.companySize as CompanySize,
        companyEmail: formData.email,
        industry: formData.industry as Industry,
        officeAddress: formData.address,
      });

      alert("Company created successfully!");
      setSelectedCompanyName(formData.name);
      setStep(1);
    } catch (error) {
      console.error("Failed to create company:", error);
      alert("Failed to create company. Please try again.");
    }
  };

  const handleCompanySubmit = async () => {
    if (!selectedCompanyName) {
      alert("Please select a company");
      return;
    }

    const company = companies.find((c: any) => c.name === selectedCompanyName);

    if (!company) {
      alert("Please select a valid company from the list");
      return;
    }

    try {
      if (!session?.user?.id) return;
      const userId = session.user.id;
      console.log(userId);

      await createProfile({
        userId: session.user.id,
        companyId: company.id,
        positionTitle: "",
      });
      await updateUser({ id: Number(userId), data: { isOnboarded: true } });
      await update({ onboarded: true });

      router.push("/recruiter/dashboard");
    } catch (error) {
      console.error("Failed to submit onboarding data:", error);
      alert("Failed to submit onboarding data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#380294_0%,_#4d1b96_50%,_#52507d_100%)] flex items-center justify-center p-4 relative font-sans">
      {/* Step 1: Find Business */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-10 w-full max-w-[440px]">
          <h1 className="text-[32px] font-bold text-black mb-8">
            Find your Business
          </h1>
          <div className="mb-8">
            <label className="block text-[15px] font-bold text-black mb-1">
              Company
            </label>
            <input
              type="text"
              list="companies-list"
              className="w-full border border-gray-200 rounded-lg p-4 text-gray-700 mb-6"
              placeholder={
                companiesLoading ? "Loading..." : "Type to search..."
              }
              value={selectedCompanyName}
              onChange={(e) => setSelectedCompanyName(e.target.value)}
            />
            <datalist id="companies-list">
              {companies.map((company: any) => (
                <option key={company.id} value={company.name} />
              ))}
            </datalist>
            <CustomButton
              color={"primary"}
              onClick={handleCompanySubmit}
              disabled={isCreatingProfile || isUpdatingUser}
            >
              {isCreatingProfile ? "Submitting..." : "Submit"}
            </CustomButton>
          </div>
          <div className="text-center text-sm">
            <span className="text-black">Didn't find your company? </span>
            <button
              onClick={() => setStep(2)}
              className="text-[#4c4280] font-medium hover:underline"
            >
              Create your own
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Create Company */}
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
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full border border-gray-200 rounded-lg p-4 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-1">
                  Description
                </label>
                <input
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What does your company do?"
                  className="w-full border border-gray-200 rounded-lg p-4 text-sm"
                />
              </div>
            </div>
            <div className="w-[200px] flex flex-col items-center gap-4 pt-10">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <button className="bg-[#4e4871] text-white px-6 py-2 rounded-lg text-sm">
                Upload Logo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm text-black mb-1">
                Company Size
              </label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg p-4 text-sm bg-white"
              >
                <option value="">Select Size</option>
                <option value="ONE_TO_TEN">1-10 Employees</option>
                <option value="ELEVEN_TO_FIFTY">11-50 Employees</option>
                <option value="FIFTY_ONE_TO_TWO_HUNDRED">
                  51-200 Employees
                </option>
                <option value="TWO_HUNDRED_ONE_TO_FIVE_HUNDRED">
                  201-500 Employees
                </option>
                <option value="FIVE_HUNDRED_ONE_TO_THOUSAND">
                  501-1000 Employees
                </option>
                <option value="THOUSAND_PLUS">1000+ Employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-black mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@company.com"
                className="w-full border border-gray-200 rounded-lg p-4 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sm text-black mb-1">Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg p-4 text-sm bg-white"
              >
                <option value="">Select Industry</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-black mb-1">Address</label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Company Address"
                className="w-full border border-gray-200 rounded-lg p-4 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setStep(1)}
              className="border border-[#4e4871] text-[#4e4871] px-6 py-2.5 rounded-lg text-sm"
            >
              Back
            </button>
            <button
              onClick={handleCompanyCreate}
              disabled={createCompany.isPending}
              className="bg-[#4e4871] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#3d3858]"
            >
              {createCompany.isPending ? "Creating..." : "Create Company"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
