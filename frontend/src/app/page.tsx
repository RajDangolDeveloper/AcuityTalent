import { HomeNavigationBar } from "../components/HomeNavigationBar";
import { HomeFooterBar } from "../components/HomeFooterBar";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import {
  Search,
  Briefcase,
  Users,
  TrendingUp,
  Building2,
  UserRound,
  Clipboard,
  Pen,
  User,
  ArrowRight,
  Bookmark,
  Calendar,
  MapPin,
  SquareCode,
} from "lucide-react";

const categories = [
  { id: 1, name: "Programming", icon: SquareCode },
  { id: 2, name: "Design", icon: SquareCode },
  { id: 3, name: "Marketing", icon: SquareCode },
  { id: 4, name: "Sales", icon: SquareCode },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <HomeNavigationBar />

      <section className="flex justify-center items-center max-h-[950px] relative px-48 pb-48">
        <div className="max-w-6xl px-28 overflow-visible">
          <div className="absolute -top-96 left-0 -z-10 h-[950px] w-dvw rotate-5 scale-150 bg-primary-500 " />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-12">
            Find the job for <span className="text-secondary-400">you</span>
          </h1>
          <form className="bg-white min-w-[800px] h-16 w-full rounded-md flex flex-row mb-6">
            <CustomInput
              placeholder="Job title, keywords, or company"
              leftIcon={<Search className="w-6 h-6 pr-2" />}
              className="min-w-sm w-full border-none h-full"
            />
            <CustomButton
              color="secondary"
              className="h-full min-w-14 max-w-32 px-8"
            >
              Search
            </CustomButton>
          </form>
        </div>
        <img
          className="h-2/3 z-20 translate-y-14"
          src="/stock-images/jobHolder.png"
          alt=""
        />
      </section>

      <section className="flex justify-center items-center gap-24">
        <div className="border-2 border-secondary-500 border-solid max-w-md flex flex-row p-4 justify-center items-center gap-4 rounded-sm">
          <div className="border-2 border-secondary-500 border-solid p-1 rounded-sm">
            <Briefcase className="text-5xl text-secondary-500 w-10 h-10 font-medium" />
          </div>
          <div>
            <div className="text-3xl">0</div>
            <div className="text-xs text-gray-400">Live Jobs</div>
          </div>
        </div>
        <div className="border-2 border-secondary-500 border-solid max-w-md flex flex-row p-4 justify-center items-center gap-4 rounded-sm">
          <div className="border-2 border-secondary-500 border-solid p-1 rounded-sm">
            <Building2 className="text-5xl text-secondary-500 w-10 h-10 font-medium" />
          </div>
          <div>
            <div className="text-3xl">0</div>
            <div className="text-xs text-gray-400">Companies</div>
          </div>
        </div>
        <div className="border-2 border-secondary-500 border-solid max-w-md flex flex-row p-4 justify-center items-center gap-4 rounded-sm">
          <div className="border-2 border-secondary-500 border-solid p-1 rounded-sm">
            <UserRound className="text-5xl text-secondary-500 w-10 h-10 font-medium" />
          </div>
          <div>
            <div className="text-3xl">0</div>
            <div className="text-xs text-gray-400">Candidates</div>
          </div>
        </div>
        <div className="border-2 border-secondary-500 border-solid max-w-md flex flex-row p-4 justify-center items-center gap-4 rounded-sm">
          <div className="border-2 border-secondary-500 border-solid p-1 rounded-sm">
            <Briefcase className="text-5xl text-secondary-500 w-10 h-10 font-medium" />
          </div>
          <div>
            <div className="text-3xl">0</div>
            <div className="text-xs text-gray-400">New Jobs</div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="border border-solid border-primary-500 text-center py-4 px-2 mb-12 text-2xl font-semibold mx-auto max-w-48 rounded-lg text-primary-500 bg-[#E4CEFF]">
          How it works
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center gap-8">
            <div className="min-h-80 min-w-[270px] px-6 py-8 border border-solid border-primary-500 rounded-md flex flex-col gap-2 text-left">
              <div className="h-16 w-16 bg-[#E4CEFF] rounded-full flex justify-center items-center">
                <User className="h-8 w-8 self-center" />
              </div>
              <div className="font-semibold text-2xl mt-2">
                Create your account
              </div>
              <div className="text-gray-400 text-sm">
                Start your journey by creating your account on our platform and
                apply for the job applicant account.
              </div>
            </div>
            <div className="min-h-80 min-w-[270px] px-6 py-8 border border-solid border-primary-500 rounded-md flex flex-col gap-2 text-left">
              <div className="h-16 w-16 bg-[#E4CEFF] rounded-full flex justify-center items-center">
                <Pen className="h-8 w-8 self-center" />
              </div>
              <div className="font-semibold text-2xl mt-2">
                Create your resume
              </div>
              <div className="text-gray-400 text-sm">
                Mention your qualifications, past experiences, expertise and
                scope your interests to create your base resume to start
                applying
              </div>
            </div>
            <div className="min-h-80 min-w-[270px] px-6 py-8 border border-solid border-primary-500 rounded-md flex flex-col gap-2 text-left">
              <div className="h-16 w-16 bg-[#E4CEFF] rounded-full flex justify-center items-center">
                <Search className="h-8 w-8 self-center" />
              </div>
              <div className="font-semibold text-2xl mt-2">
                Find your ideal job
              </div>
              <div className="text-gray-400 text-sm">
                Look for your ideal job through the use of our algorithms and
                categorical views to showcase the different positions that might
                interest you.
              </div>
            </div>
            <div className="min-h-80 min-w-[270px] px-6 py-8 border border-solid border-primary-500 rounded-md flex flex-col gap-2 text-left">
              <div className="h-16 w-16 bg-[#E4CEFF] rounded-full flex justify-center items-center">
                <Clipboard className="h-8 w-8 self-center" />
              </div>
              <div className="font-semibold text-2xl mt-2">
                Get your ideal job
              </div>
              <div className="text-gray-400 text-sm">
                Get your results sooner and receive that ideal job offer letter
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-8">
            <div className="font-semibold text-4xl">Featured Jobs</div>
            <button className="bg-primary-500 text-gray-100 flex gap-2 p-4 rounded-md">
              View all <ArrowRight />
            </button>
          </div>
          <div className="border border-gray-300 px-8 py-4 flex justify-between gap-2 rounded-xl mb-4">
            <div className="flex gap-4 justify-center items-center">
              <img className="h-20 w-20 rounded-full" src="" alt="logo" />
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-center">
                  <div className="font-semibold text-2xl">
                    Senior UX Designer
                  </div>
                  <div className="text-secondary-600 font-semibold px-2 bg-secondary-100 border-2 border-solid border-secondary-500 rounded-sm">
                    Contract
                  </div>
                </div>
                <div className="flex flex-row gap-3 text-sm items-center justify-center">
                  <div className="flex gap-2">
                    <MapPin /> Kathmandu, Nepal
                  </div>
                  <div className="flex gap-2">
                    <div>$1500</div>-<div>$1900</div>
                  </div>
                  <div className="flex gap-2">
                    <Calendar /> 19th December 2026
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button>
                <Bookmark className="text-secondary-600" />
              </button>
              <button className="flex bg-primary-500 text-gray-100 p-3 rounded-md gap-1">
                Apply Now <ArrowRight className="text-gray-100" />
              </button>
            </div>
          </div>
          <div className="border border-gray-300 px-8 py-4 flex justify-between gap-2 rounded-xl mb-4">
            <div className="flex gap-4 justify-center items-center">
              <img className="h-20 w-20 rounded-full" src="" alt="logo" />
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-center">
                  <div className="font-semibold text-2xl">
                    Senior UX Designer
                  </div>
                  <div className="text-secondary-600 font-semibold px-2 bg-secondary-100 border-2 border-solid border-secondary-500 rounded-sm">
                    Contract
                  </div>
                </div>
                <div className="flex flex-row gap-3 text-sm items-center justify-center">
                  <div className="flex gap-2">
                    <MapPin /> Kathmandu, Nepal
                  </div>
                  <div className="flex gap-2">
                    <div>$1500</div>-<div>$1900</div>
                  </div>
                  <div className="flex gap-2">
                    <Calendar /> 19th December 2026
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button>
                <Bookmark className="text-secondary-600" />
              </button>
              <button className="flex bg-primary-500 text-gray-100 p-3 rounded-md gap-1">
                Apply Now <ArrowRight className="text-gray-100" />
              </button>
            </div>
          </div>
          <div className="border border-gray-300 px-8 py-4 flex justify-between gap-2 rounded-xl mb-4">
            <div className="flex gap-4 justify-center items-center">
              <img className="h-20 w-20 rounded-full" src="" alt="logo" />
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-center">
                  <div className="font-semibold text-2xl">
                    Senior UX Designer
                  </div>
                  <div className="text-secondary-600 font-semibold px-2 bg-secondary-100 border-2 border-solid border-secondary-500 rounded-sm">
                    Contract
                  </div>
                </div>
                <div className="flex flex-row gap-3 text-sm items-center justify-center">
                  <div className="flex gap-2">
                    <MapPin /> Kathmandu, Nepal
                  </div>
                  <div className="flex gap-2">
                    <div>$1500</div>-<div>$1900</div>
                  </div>
                  <div className="flex gap-2">
                    <Calendar /> 19th December 2026
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button>
                <Bookmark className="text-secondary-600" />
              </button>
              <button className="flex bg-primary-500 text-gray-100 p-3 rounded-md gap-1">
                Apply Now <ArrowRight className="text-gray-100" />
              </button>
            </div>
          </div>
          <div className="border border-gray-300 px-8 py-4 flex justify-between gap-2 rounded-xl mb-4">
            <div className="flex gap-4 justify-center items-center">
              <img className="h-20 w-20 rounded-full" src="" alt="logo" />
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-center">
                  <div className="font-semibold text-2xl">
                    Senior UX Designer
                  </div>
                  <div className="text-secondary-600 font-semibold px-2 bg-secondary-100 border-2 border-solid border-secondary-500 rounded-sm">
                    Contract
                  </div>
                </div>
                <div className="flex flex-row gap-3 text-sm items-center justify-center">
                  <div className="flex gap-2">
                    <MapPin /> Kathmandu, Nepal
                  </div>
                  <div className="flex gap-2">
                    <div>$1500</div>-<div>$1900</div>
                  </div>
                  <div className="flex gap-2">
                    <Calendar /> 19th December 2026
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button>
                <Bookmark className="text-secondary-600" />
              </button>
              <button className="flex bg-primary-500 text-gray-100 p-3 rounded-md gap-1">
                Apply Now <ArrowRight className="text-gray-100" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto ">
          <div className="font-semibold text-4xl mb-8">Categories</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="font-semibold text-2xl border-3 border-solid border-black max-w-xs min-h-80 flex flex-col-reverse items-end rounded-md"
                >
                  <div className="flex gap-2 items-center pb-3 pr-3">
                    <IconComponent />
                    {category.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-900 mb-6">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who have found their dream jobs
            through AcuityTalent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CustomButton color="primary" className="px-8 py-3">
              Get Started
            </CustomButton>
            <CustomButton color="white" className="px-8 py-3">
              Learn More
            </CustomButton>
          </div>
        </div>
      </section>

      {}
      <HomeFooterBar />
    </div>
  );
}
