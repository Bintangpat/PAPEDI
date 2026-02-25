"use client";

import { ProfileForm } from "@/components/profile-form";

export default function StudentProfilePage() {
  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] w-full flex-col items-center">
      <ProfileForm />
    </div>
  );
}
