"use client";

import Image from "next/image";
import { useState } from "react";
import logo from "../assets/logo.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navLinks: { name: string; href: string }[] = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#" },
    { name: "Doctors", href: "#" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
  ];

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold tracking-wide cursor-pointer">
            <Image
              className="size-8"
              width={600}
              height={600}
              src={logo.src}
              alt=""
            />
          </div>
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-[#2EC4B6] transition duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
            aria-label="Toggle Menu"
          >
            <span
              className={`absolute w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? "rotate-45" : "-translate-y-2"
                }`}
            />
            <span
              className={`absolute w-6 h-0.5 bg-white transition-opacity duration-300 ${isOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`absolute w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? "-rotate-45" : "translate-y-2"
                }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          } bg-[#16233A]`}
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block hover:text-[#2EC4B6] transition duration-200"
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
