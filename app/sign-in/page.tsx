"use client";

import { authClient } from "@/lib/auth-client";
import SignIn from "@/components/ui/store/sign-in";

export default function SignInPage() {
  const { isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}
