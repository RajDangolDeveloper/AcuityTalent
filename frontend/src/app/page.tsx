import { HomeNavigationBar } from "../components/HomeNavigationBar";
import { HomeFooterBar } from "../components/HomeFooterBar";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-500">
      {/* Navigation Bar */}
      <HomeNavigationBar />

      {/* Hero Section */}
      <section className="bg-linear-to-br py-20 px-4">
        <div className="max-w-4xl px-24">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-6">
            Find the job for <span className="text-secondary-400">you</span>
          </h1>

          <form className="bg-white w-fit rounded-md grid md:grid-cols-2 mb-6">
            <CustomInput
              placeholder="Job title, keywords, or company"
              leftIcon={<Search className="w-6 h-6" />}
              className="min-w-sm w-full"
            />
            <CustomButton color="secondary" className="w-2/3 h-12">
              Search Jobs
            </CustomButton>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-12">
            Why Choose AcuityTalent?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Smart Job Matching
              </h3>
              <p className="text-gray-600">
                Our AI-powered system matches you with jobs that fit your
                skills, experience, and preferences.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Top Companies
              </h3>
              <p className="text-gray-600">
                Connect with leading companies across various industries looking
                for talented professionals.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Career Growth
              </h3>
              <p className="text-gray-600">
                Access tools and resources to advance your career and achieve
                your professional goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Active Jobs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-primary-100">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-100">Job Seekers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-primary-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
      <HomeFooterBar />
    </div>
  );
}
