"use client";

import { NavigationSidebar } from "@/features/admin/components/NavigationSidebar";
import { Authenticated } from "@/components/auth/Authenticated";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ Không truyền params role -> Cho phép mọi user đã login
    <Authenticated>
      <div className="min-h-screen bg-gray-50">
        {/* ✅ Dùng chung Sidebar với Admin (Sidebar cần thông minh để highlight đúng tab) */}
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