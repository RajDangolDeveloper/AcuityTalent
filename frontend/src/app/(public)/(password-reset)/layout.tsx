"use client";

export default function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex align-center justify-center items-center w-dvw h-dvh bg-primary-500">
      <div className="bg-white min-h-3/4 h-[711px] w-[553px] rounded-sm">
        {children}
      </div>
    </div>
  );
}
