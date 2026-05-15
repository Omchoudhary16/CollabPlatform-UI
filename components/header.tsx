"use client";
import { useAuth } from "@/providers/auth-provider";
import { useNotificationCount } from "@/hooks/use-notification-count";
import Link from "next/link";
import { useState } from "react";
import { FaBars, FaTimes, FaUserCircle, FaBell } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user, logout } = useAuth();
  const { count } = useNotificationCount();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navLinks = [
    { href: "/dashboard/", label: "Home" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/matches", label: "Matches" },
    { href: "/dashboard/requests", label: "Requests" },
  ];

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/dashboard/profile" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CollabHub
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              {link.label}
            </Link>
          ))}

          {/* Notification Bell */}
          <Link href="/dashboard/requests" className="relative">
            <FaBell className="text-xl text-gray-600 hover:text-blue-600 transition" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FaUserCircle className="text-xl" />
              <span>{user.fullName}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-gray-600 hover:text-blue-600 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Mobile notification item */}
              <Link
                href="/dashboard/requests"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                <FaBell />
                Notifications
                {count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {count}
                  </span>
                )}
              </Link>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FaUserCircle size={20} />
                  <span>{user.fullName}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}