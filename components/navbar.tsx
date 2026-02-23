"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { User, LogOut } from "lucide-react";

type AuthUser = { name: string; profilePicture: string; role: string; verify?: boolean };

const capitalizeFirst = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    setUser(null);
    setProfileDropdownOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      setAuthChecked(true);
      return;
    }
    axios
      .get<{ success: boolean; name: string; profilePicture: string; role: string; verify?: boolean }>("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (data.success && data.name) {
          setUser({
            name: data.name,
            profilePicture: data.profilePicture ?? "",
            role: data.role ?? "user",
            verify: data.verify ?? false,
          });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, [pathname]);

  const dashboardHref = user?.role === "doctor" ? "/dashboard/doctor" : user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user";

  return (
    <nav className="text-primary bg-white border-b py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href={"/"}
            className="text-xl font-bold flex items-center gap-3 tracking-wide cursor-pointer"
          >
            <Image
              className="size-10 bg-primary rounded-lg p-2"
              width={600}
              height={600}
              src={logo.src}
              alt=""
            />
            <p className="text-primary">
              Care <span className="text-black">Sync</span>
            </p>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {authChecked &&
              (user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 hover:opacity-90 transition-opacity rounded-full cursor-pointer"
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0 hover:opacity-90"
                      title={capitalizeFirst(user.name)}
                    >
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-primary font-semibold text-sm">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"
                          }
                        </span>
                      )}
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-foreground max-w-[120px] truncate">
                        {capitalizeFirst(user.name)}
                      </span>
                      {user.role === "user" && (
                        <span className={`-mt-1 text-xs ${user.verify ? "text-green-600" : "text-red-600"}`}>
                          {user.verify ? "verified" : "not verified"}
                        </span>
                      )}
                    </div>
                  </button>
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 py-1 bg-white rounded-lg shadow-lg border border-border z-50"
                      role="menu"
                    >
                      <Link
                        href={dashboardHref}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        role="menuitem"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-primary" />
                        View profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors text-left"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4 text-primary" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hover:text-primary/60 transition duration-200 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
                  >
                    Sign up
                  </Link>
                </>
              ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
            aria-label="Toggle Menu"
          >
            <span
              className={`absolute w-6 h-0.5 bg-primary transition-transform duration-300 ${isOpen ? "rotate-45" : "-translate-y-2"
                }`}
            />
            <span
              className={`absolute w-6 h-0.5 bg-primary transition-opacity duration-300 ${isOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`absolute w-6 h-0.5 bg-primary transition-transform duration-300 ${isOpen ? "-rotate-45" : "translate-y-2"
                }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 py-4 space-y-3">
          {authChecked &&
            (user ? (
              <>
                <div className="flex items-center gap-2 py-2 border-b border-border/50">
                  <span className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-primary font-semibold text-sm">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "?"}
                      </span>
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{capitalizeFirst(user.name)}</span>
                    {user.role === "user" && (
                      <span className={`text-xs ${user.verify ? "text-green-600" : "text-red-600"}`}>
                        {user.verify ? "verified" : "not verified"}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 py-2 text-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  View profile
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full py-2 text-left text-foreground hover:text-primary"
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block hover:text-primary/60 transition duration-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block hover:text-primary/60 transition duration-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
