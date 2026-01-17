import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}