import React, { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/10 backdrop-blur-md text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Left - Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Betting Logo"
            className="w-10 h-10 object-contain"
          />
          
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="hover:text-yellow-400 transition">Home</a>
          <a href="#dashboard" className="hover:text-yellow-400 transition">Dashboard</a>
          <div className="flex items-center space-x-2 hover:text-yellow-400 cursor-pointer transition">
            <img src="/coin.png" alt="Coins" className="w-5 h-5" />
            <span>120</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-yellow-400 cursor-pointer transition">
            <img
              src="/profile.png"
              alt="Profile"
              className="w-8 h-8 rounded-full border border-yellow-400"
            />
            <span>Profile</span>
          </div>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-8 h-8 text-yellow-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-md text-white px-6 py-4 space-y-4 border-t border-gray-500/30">
          <a href="#home" className="block hover:text-yellow-400">Home</a>
          <a href="#dashboard" className="block hover:text-yellow-400">Dashboard</a>
          <div className="flex items-center space-x-2 hover:text-yellow-400">
            <img src="/coin.png" alt="Coins" className="w-5 h-5" />
            <span>120 Coins</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-yellow-400">
            <img
              src="/profile.png"
              alt="Profile"
              className="w-8 h-8 rounded-full border border-yellow-400"
            />
            <span>Profile</span>
          </div>
        </div>
      )}
    </nav>
  );
}
