"use client";

import { ProfileForm } from "@/components/profile-form";

export default function AdminProfilePage() {
  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] w-full flex-col items-center p-6 md:p-8">
      <ProfileForm />
    </div>
  );
}
