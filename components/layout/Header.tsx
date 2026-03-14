"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, User, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./SidebarContext";

export function Header() {
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { setMobileOpen } = useSidebar();
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:h-16 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
        />
      </div>
      <div className="relative" ref={ref}>
        <motion.button
          onClick={() => setProfileOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium text-slate-700">Admin</span>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition ${profileOpen ? "rotate-180" : ""}`} />
        </motion.button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
            >
              <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50">Profile</button>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50">Settings</button>
              <button className="w-full border-t border-slate-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
