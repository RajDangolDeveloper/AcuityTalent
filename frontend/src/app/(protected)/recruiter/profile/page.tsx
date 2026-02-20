"use client";

import { Button } from "@/src/components/recruiter/Button";
import { Mail, Phone, MapPin, Building2, User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

          <div className="grid grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="w-32 h-32 mx-auto bg-linear-to-br from-gray-300 to-gray-400 rounded-full mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  John Recruiter
                </h2>
                <p className="text-gray-600 text-center mt-2">
                  Senior Recruiter
                </p>
                <Button variant="primary" size="md" className="w-full mt-6">
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="text-gray-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          john.recruiter@company.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-gray-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-900">
                          San Francisco, CA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Company Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="text-gray-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium text-gray-900">
                          Tech Solutions Inc.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="text-gray-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium text-gray-900">
                          Human Resources
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Account Settings
                  </h3>
                  <Button variant="secondary" size="md" className="mr-2">
                    Change Password
                  </Button>
                  <Button variant="secondary" size="md">
                    Two-Factor Authentication
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
