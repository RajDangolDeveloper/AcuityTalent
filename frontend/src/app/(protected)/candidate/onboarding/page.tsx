"use client";
import { useState } from "react";

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Professional" },
  { id: 3, label: "Current" },
];

// ── Step components ────────────────────────────────────────────────────────────
function Step1({ data, setData }) {
  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 m-0 mb-8 leading-tight font-['Playfair_Display',Georgia,serif]">
        Lets get to know each other
      </h1>

      <h2 className="text-base font-bold text-gray-900 m-0 mb-4">
        Personal Details
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            First Name
          </label>
          <input
            type="text"
            placeholder="First Name"
            value={data.firstName}
            onChange={set("firstName")}
            className="w-full px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 bg-white outline-none transition-colors focus:border-[#4b3fa0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Last Name"
            value={data.lastName}
            onChange={set("lastName")}
            className="w-full px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 bg-white outline-none transition-colors focus:border-[#4b3fa0]"
          />
        </div>
      </div>

      <h2 className="text-base font-bold text-gray-900 m-0 mb-4 mt-7">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="Email Address"
            value={data.email}
            onChange={set("email")}
            className="w-full px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 bg-white outline-none transition-colors focus:border-[#4b3fa0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+ (000) 12345678"
            value={data.phone}
            onChange={set("phone")}
            className="w-full px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 bg-white outline-none transition-colors focus:border-[#4b3fa0]"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({ data, setData }) {
  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setData((d) => ({
      ...d,
      skills: [...(d.skills || []), skillInput.trim()],
    }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setData((d) => ({
      ...d,
      skills: (d.skills || []).filter((s) => s !== skill),
    }));

  const expOptions = [
    "Less than 1 year",
    "1–2 years",
    "3–5 years",
    "6–10 years",
    "10+ years",
  ];
  const locOptions = ["Remote", "On-site", "Hybrid", "Open to all"];
  const jobOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
  ];
  const degreeOptions = [
    "High School",
    "Associate",
    "Bachelor's",
    "Master's",
    "PhD",
    "Other",
  ];
  const salaryOptions = [
    "$30k–$50k",
    "$50k–$80k",
    "$80k–$120k",
    "$120k–$180k",
    "$180k+",
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 m-0 mb-8 leading-tight font-['Playfair_Display',Georgia,serif]">
        More about you.. Professionally ✨
      </h1>

      <h2 className="text-base font-bold text-gray-900 m-0 mb-4">Experience</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          Headline
        </label>
        <input
          type="text"
          placeholder="Make this about who you are....."
          value={data.headline}
          onChange={set("headline")}
          className="w-full px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 bg-white outline-none transition-colors focus:border-[#4b3fa0]"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          Summary
        </label>
        <textarea
          placeholder="Summarise who you are and what u represent"
          value={data.summary}
          onChange={set("summary")}
          rows={3}
          className="w-full px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 bg-white outline-none resize-y transition-colors focus:border-[#4b3fa0]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Years of Experience
          </label>
          <div className="relative w-full">
            <select
              value={data.yearsExp}
              onChange={set("yearsExp")}
              className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.yearsExp ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="" disabled hidden>
                Years of Experience
              </option>
              {expOptions.map((o) => (
                <option key={o} value={o} className="text-gray-900">
                  {o}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
              ▾
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Add your skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Skills"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              className="flex-1 px-4 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm text-gray-900 outline-none transition-colors focus:border-[#4b3fa0]"
            />
            <button
              onClick={addSkill}
              className="w-12 h-12 rounded-xl border-[1.5px] border-[#e2e2e2] bg-white cursor-pointer text-[22px] flex items-center justify-center shrink-0 hover:bg-gray-50"
            >
              +
            </button>
          </div>
          {(data.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(data.skills || []).map((s) => (
                <span
                  key={s}
                  className="bg-[#ede9fe] text-[#4b3fa0] rounded-full px-2.5 py-1 text-xs flex items-center gap-1"
                >
                  {s}
                  <button
                    onClick={() => removeSkill(s)}
                    className="bg-transparent border-none cursor-pointer p-0 text-[#4b3fa0] text-sm leading-none hover:text-[#3d3578]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-base font-bold text-gray-900 m-0 mb-4 mt-6">
        Preferences
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Preferred Location
          </label>
          <div className="relative w-full">
            <select
              value={data.location}
              onChange={set("location")}
              className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.location ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="" disabled hidden>
                Preferred Location
              </option>
              {locOptions.map((o) => (
                <option key={o} value={o} className="text-gray-900">
                  {o}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
              ▾
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Preferred Job Type
          </label>
          <div className="relative w-full">
            <select
              value={data.jobType}
              onChange={set("jobType")}
              className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.jobType ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="" disabled hidden>
                Preferred Job Type
              </option>
              {jobOptions.map((o) => (
                <option key={o} value={o} className="text-gray-900">
                  {o}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
              ▾
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Highest Degree
          </label>
          <div className="relative w-full">
            <select
              value={data.degree}
              onChange={set("degree")}
              className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.degree ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="" disabled hidden>
                Select your Degree
              </option>
              {degreeOptions.map((o) => (
                <option key={o} value={o} className="text-gray-900">
                  {o}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
              ▾
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Expected Salary
          </label>
          <div className="relative w-full">
            <select
              value={data.salary}
              onChange={set("salary")}
              className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.salary ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="" disabled hidden>
                Expected Salary
              </option>
              {salaryOptions.map((o) => (
                <option key={o} value={o} className="text-gray-900">
                  {o}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
              ▾
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3({ data, setData }) {
  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  const compOptions = [
    "Google",
    "Meta",
    "Amazon",
    "Apple",
    "Microsoft",
    "Netflix",
    "Startup",
    "Other",
  ];
  const posOptions = [
    "Software Engineer",
    "Product Manager",
    "Designer",
    "Data Scientist",
    "Marketing",
    "Sales",
    "Other",
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 m-0 mb-8 leading-tight font-['Playfair_Display',Georgia,serif]">
        Are you currently working?
      </h1>

      <h2 className="text-base font-bold text-gray-900 m-0 mb-4">
        Current Experience
      </h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          Company
        </label>
        <div className="relative w-full">
          <select
            value={data.company}
            onChange={set("company")}
            className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.company ? "text-gray-900" : "text-gray-400"}`}
          >
            <option value="" disabled hidden>
              Select your company
            </option>
            {compOptions.map((o) => (
              <option key={o} value={o} className="text-gray-900">
                {o}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
            ▾
          </span>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          Current Position
        </label>
        <div className="relative w-full">
          <select
            value={data.position}
            onChange={set("position")}
            className={`w-full pl-4 pr-10 py-3.5 border-[1.5px] border-[#e2e2e2] rounded-xl text-sm bg-white outline-none appearance-none cursor-pointer transition-colors focus:border-[#4b3fa0] ${data.position ? "text-gray-900" : "text-gray-400"}`}
          >
            <option value="" disabled hidden>
              Select your position
            </option>
            {posOptions.map((o) => (
              <option key={o} value={o} className="text-gray-900">
                {o}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
            ▾
          </span>
        </div>
      </div>

      <h2 className="text-base font-bold text-gray-900 m-0 mb-4">Socials</h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center border-[1.5px] border-[#e2e2e2] rounded-xl px-4 py-3 gap-2.5 bg-white transition-colors focus-within:border-[#4b3fa0]">
          <span className="text-lg shrink-0">🐙</span>
          <input
            type="text"
            placeholder="Github Link"
            value={data.github}
            onChange={set("github")}
            className="border-none outline-none text-sm text-gray-900 w-full bg-transparent"
          />
        </div>
        <div className="flex items-center border-[1.5px] border-[#e2e2e2] rounded-xl px-4 py-3 gap-2.5 bg-white transition-colors focus-within:border-[#4b3fa0]">
          <span className="text-lg shrink-0">🔗</span>
          <input
            type="text"
            placeholder="LinkedIn Url"
            value={data.linkedin}
            onChange={set("linkedin")}
            className="border-none outline-none text-sm text-gray-900 w-full bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [step2Data, setStep2Data] = useState({
    headline: "",
    summary: "",
    yearsExp: "",
    skills: [],
    location: "",
    jobType: "",
    degree: "",
    salary: "",
  });
  const [step3Data, setStep3Data] = useState({
    company: "",
    position: "",
    github: "",
    linkedin: "",
  });

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      const finalData = { ...step1Data, ...step2Data, ...step3Data };
    }
  };

  return (
    <>
      <style>{`
        
      `}</style>

      <div className="bg-transparent flex flex-col items-center justify-center font-sans p-2 sm:py-4 sm:px-10 relative">
        {/* Progress dots */}
        <div className="flex gap-2.5 mb-6">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                step >= s.id ? "bg-white" : "bg-white/30"
              }`}
              style={{ width: step === s.id ? 32 : 10 }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className={`bg-white rounded-3xl p-8 sm:px-12 sm:py-12 w-full transition-all duration-300 shadow-[0_32px_80px_rgba(0,0,0,0.35)] ${
            step === 2 ? "max-w-2xl" : "max-w-xl"
          }`}
        >
          {step === 1 && <Step1 data={step1Data} setData={setStep1Data} />}
          {step === 2 && <Step2 data={step2Data} setData={setStep2Data} />}
          {step === 3 && <Step3 data={step3Data} setData={setStep3Data} />}

          <div
            className={`flex items-center mt-8 ${
              step === 3 ? "justify-between" : "justify-end"
            }`}
          >
            {step === 3 && (
              <button
                onClick={handleNext}
                className="px-7 py-3 rounded-xl border-[1.5px] border-[#e2e2e2] bg-white text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
            )}

            <div className="flex gap-3 items-center">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-3 rounded-xl border-[1.5px] border-[#e2e2e2] bg-white text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-7 py-3 rounded-xl border-none bg-[#3d3578] text-white text-sm font-semibold cursor-pointer tracking-wide transition-colors hover:bg-[#2d2060]"
              >
                {step === 3 ? "Finish" : "Next Step"}
              </button>
            </div>
          </div>
        </div>

        {/* Step counter */}
        <p className="text-white/50 text-sm mt-4">
          Step {step} of {STEPS.length}
        </p>
      </div>
    </>
  );
}
