import { Suspense } from "react";
import { Metadata } from "next";
import { SignUpPage } from "@/components/auth/SignUpPage";

export const metadata: Metadata = {
  title: "Open Client File — Register",
  description: "Create your private client file for seamless appointment booking and style continuity at THE CHAIR."
};

export default function Page() {
  return (
    <Suspense fallback={<main className="split-auth-page" style={{ background: "var(--bone)" }} />}>
      <SignUpPage />
    </Suspense>
  );
}
