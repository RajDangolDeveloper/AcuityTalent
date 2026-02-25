import CustomSidebar from "@/src/components/CustomSidebar";
import { FileDown, X } from "lucide-react";

export default function ResumesPage() {
  return (
    <div className="relative h-dvh w-full">
      {/* This is the secondary sidebar for the list of resumes available */}
      <CustomSidebar variant="secondary">
        <div className="border border-solid border-gray-800 flex justify-between py-3 px-4">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Resume-1</div>
            <div className="flex gap-2 items-center">
              <div className="text-xs text-gray-100 bg-yellow-400 border border-yellow-500 font-semibold px-1 py-0.5 rounded-sm">
                70%
              </div>
              <div className="text-xs">Resume Score</div>
            </div>
          </div>
          <div className="flex gap-1 items-start">
            <button>
              <FileDown className="w-5 h-5 cursor-pointer" />
            </button>
            <button>
              <X className="w-5 h-5 cursor-pointer" />
            </button>
          </div>
        </div>
      </CustomSidebar>
      {/* This is the Detailed View of said resume */}
      <div></div>
      {/* This is the button for creating a resume*/}
      <button className="absolute bottom-2 right-2 p-4 rounded-md bg-primary-500 text-gray-100 font-semibold">
        Create Resume
      </button>
    </div>
  );
}
