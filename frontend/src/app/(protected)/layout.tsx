import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import CustomSidebar from "@/src/components/CustomSidebar";
import { Home, LogOut, Settings } from "lucide-react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <CustomSidebar variant="primary">
        <CustomSidebar.Top>
          <CustomSidebar.Item icon={<Home />} label="Dashboard" active />
          <CustomSidebar.Item icon={<Settings />} label="Settings" />
        </CustomSidebar.Top>

        <CustomSidebar.Bottom>
          <CustomSidebar.Item
            icon={<LogOut />}
            label="Logout"
            onClick={() => console.log("Logging out...")}
          />
        </CustomSidebar.Bottom>
      </CustomSidebar>
      {children}
    </>
  );
}
