"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  History,
  Warehouse,
  Factory,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendors", label: "Vendors", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/billing", label: "Create Bill", icon: FileText },
  { href: "/billing/history", label: "Billing History", icon: History },
  { href: "/stock", label: "Stock", icon: Warehouse },
  { href: "/production", label: "Production", icon: Factory },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-700/50 bg-slate-900 text-white transition-[transform,width] duration-200 ease-out
          w-[256px] max-w-[85vw]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:max-w-none
          ${collapsed ? "md:w-[72px]" : "md:w-64"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700/50 px-3">
          <span
            className={`overflow-hidden text-lg font-bold text-sky-400 transition-all duration-200 md:text-xl ${
              collapsed ? "md:w-0 md:opacity-0" : "md:opacity-100"
            }`}
          >
            Sharma Ice-Cream
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-sky-300 md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-sky-300 md:block"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <nav className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/billing" && item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick} title={collapsed ? item.label : undefined}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-200 ${collapsed ? "md:w-0 md:overflow-hidden md:opacity-0" : ""}`}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
