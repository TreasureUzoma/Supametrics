import Logo from "@repo/ui/components/ui/logo";
import { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify Email - Supametrics",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 text-center">
      <div className="max-w-md w-full flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3 mt-5 p-6 border border-gray-200 rounded-2xl shadow-sm">
          <Mail size={60} className="text-blue-500" />
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-neutral-500">
            We&apos;ve sent a verification link to your email. Please check your
            inbox (and spam folder) and click the link to activate your account.
          </p>
        </div>
      </div>
    </div>
  );
}
