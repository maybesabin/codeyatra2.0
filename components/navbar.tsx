"use client";

import Image from "next/image";
import { useState } from "react";
import logo from "../assets/logo.png";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navLinks: { name: string; href: string }[] = [
    { name: "Home", href: "/" },
    { name: "Platform", href: "/dashboard/user" },
    { name: "Pharmacies", href: "/pharmacies" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <nav className="text-primary bg-white ring-primary shadow-md sticky top-0 z-50">
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
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-primary/60 transition duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
            aria-label="Toggle Menu"
          >
            <span
              className={`absolute w-6 h-0.5 bg-primary transition-transform duration-300 ${
                isOpen ? "rotate-45" : "-translate-y-2"
              }`}
            />
            <span
              className={`absolute w-6 h-0.5 bg-primary transition-opacity duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute w-6 h-0.5 bg-primary transition-transform duration-300 ${
                isOpen ? "-rotate-45" : "translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        } bg-primary/50`}
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block hover:text-primary/60 transition duration-200"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
