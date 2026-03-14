"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { ToastProvider } from "@/components/providers/ToastProvider";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={`min-h-screen transition-[margin] duration-200 ${collapsed ? "md:ml-[72px]" : "md:ml-64"}`}
      >
        <Header />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <LayoutInner>{children}</LayoutInner>
      </SidebarProvider>
    </ToastProvider>
  );
}
