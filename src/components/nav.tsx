"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Activity,
  ShoppingBag,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Trophy,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/live", label: "Live", icon: Activity },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/network", label: "Network", icon: Users },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/meetups", label: "Meetups", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string; avatar_url?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        setUser({
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name,
          avatar_url: currentUser.user_metadata?.avatar_url,
        });
      }
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "?";
  };

  return (
    <>
      {/* Desktop nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900 border-b border-dark-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/feed" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <span className="text-2xl">{"\u26F3"}</span>
              <span>Fairway Social</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "text-gray-400 hover:bg-dark-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User section (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-dark-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-dark-600 flex items-center justify-center text-xs font-bold">
                  {getInitials()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-sm"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-out panel */}
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-dark-900 text-white shadow-2xl pt-20 px-4">
            {/* User info */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-emerald-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-emerald-400 flex items-center justify-center text-sm font-bold">
                  {getInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.full_name || "Golfer"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Mobile links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-dark-800 text-emerald-400"
                        : "text-gray-400 hover:bg-dark-800 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 mt-4 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-dark-800 hover:text-white transition-colors border-t border-dark-700 pt-4"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
