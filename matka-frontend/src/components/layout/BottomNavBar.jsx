import React from "react";
import { Home, User } from "lucide-react";
import { IoHammerOutline } from "react-icons/io5";
import { IoMdBook } from "react-icons/io";
import { MdOutlineCurrencyRupee } from "react-icons/md";

export default function BottomNavBar() {
  return (
    <div className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-center">
      <div className="relative flex w-full max-w-md items-center justify-between bg-white border-t border-gray-200 px-2 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        {/* Left icons */}
        <div className="flex w-full items-center justify-around">
          <a href="/bid-history" className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-[#FF8C00] transition">
            <IoHammerOutline size={22} />
            <span className="text-[11px] font-medium">My Bids</span>
          </a>
          <a href="/passbook" className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-[#FF8C00] transition">
            <IoMdBook size={22} />
            <span className="text-[11px] font-medium">Passbook</span>
          </a>
        </div>

        {/* Center Home */}
        <div className="flex w-full justify-center">
          <a href="/" className="flex flex-col items-center">
            <div className="rounded-full bg-gradient-to-br from-[#FF9800] to-[#F57C00] p-3 shadow-lg hover:scale-105 transition">
              <Home size={22} className="text-white" />
            </div>
            <span className="text-[11px] font-medium text-[#FF8C00] mt-1">Home</span>
          </a>
        </div>

        {/* Right icons */}
        <div className="flex w-full items-center justify-around">
          <a href="/withdrawal-request" className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-[#FF8C00] transition">
            <MdOutlineCurrencyRupee size={22} />
            <span className="text-[11px] font-medium">Withdraw</span>
          </a>
          <a href="/profile" className="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-[#FF8C00] transition">
            <User size={22} />
            <span className="text-[11px] font-medium">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}
