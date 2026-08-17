import { Suspense } from "react";
import { Metadata } from "next";
import { SignInPage } from "@/components/auth/SignInPage";

export const metadata: Metadata = {
  title: "Sign In — Client File",
  description: "Access your protected appointments, request changes, and manage your grooming profile at THE CHAIR."
};

export default function Page() {
  return (
    <Suspense fallback={<main className="split-auth-page" style={{ background: "var(--bone)" }} />}>
      <SignInPage />
    </Suspense>
  );
}
