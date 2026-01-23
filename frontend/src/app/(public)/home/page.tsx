import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to Home</h1>
      <Link href="/recruiter/login">Recruiter Login</Link>
      <Link href="/candidate/login">Candidate Login</Link>
    </div>
  );
}
