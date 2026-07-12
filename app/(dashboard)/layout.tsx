"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useConvexAuth();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (isAuthenticated) {
      upsertUser();
    }
  }, [isAuthenticated, upsertUser]);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
