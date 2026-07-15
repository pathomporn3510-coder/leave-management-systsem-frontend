"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "user") {
      router.replace("/dashboard/user");
    } else if (role === "manager") {
      router.replace("/dashboard/manager");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-zinc-400">Loading your dashboard...</div>
    </div>
  );
}
