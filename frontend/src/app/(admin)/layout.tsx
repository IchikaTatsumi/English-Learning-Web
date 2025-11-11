"use client";

import { NavigationSidebar } from "@/features/admin/components/NavigationSidebar";
import { Role } from "@/lib/constants/enums";
import { Authenticated } from "@/components/auth/Authenticated";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticated params={{ role: Role.ADMIN }}>
      <div className="min-h-screen bg-gray-50">
        <NavigationSidebar />
        <Suspense 
          fallback={
            <div className="lg:pl-64 w-full min-h-screen flex justify-center items-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <div className="lg:pl-64 transition-all duration-300">{children}</div>
        </Suspense>
      </div>
    </Authenticated>
  );
}