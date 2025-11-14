import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(251,191,36,0.1),transparent_55%),radial-gradient(1200px_circle_at_80%_0%,rgba(56,189,248,0.1),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.98))]">
      <SignIn />
    </div>
  );
}

