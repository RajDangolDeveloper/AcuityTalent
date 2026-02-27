import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-screen h-screen bg-linear-to-b from-primary-500 to-[#46009A] flex flex-col items-center">
      <div className="min-w-dvw flex justify-between items-center h-20 px-6 py-6">
        <Link href="/">
          <img className="h-16 w-8" src="/logo/logo-small.png" alt="" />
        </Link>
        <Link href="/candidate/profile">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        </Link>
      </div>
      <div className=" w-full h-5/6 flex justify-center items-center drop-shadow-sm">
        <div className=" rounded-md min-h-140 min-w-xl">{children}</div>
      </div>
    </div>
  );
}
