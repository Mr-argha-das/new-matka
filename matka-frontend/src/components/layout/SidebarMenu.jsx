import React, { useCallback, useEffect, useState } from "react";
import {
  User,
  Wallet,
  Clock,
  Trophy,
  Gamepad2,
  Phone,
  Lock,
  LogOut,
  Lightbulb,
  X,
  DollarSign,
  Star,
  Play,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config";
import { SiMarketo } from "react-icons/si";

const API_BASE = `${API_URL}/user`;

export default function SidebarMenu({ sidebar, setSidebar }) {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");

  const token = localStorage.getItem("accessToken");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(res.data.username || "");
      setMobile(res.data.mobile || "");
    } catch (err) {
      console.log("Profile load error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) setAccessToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setAccessToken(null);
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: <User size={20} />, label: "My Profile", link: "/profile" },
    { icon: <Wallet size={20} />, label: "Wallet", link: "/wallet" },
    { icon: <Clock size={20} />, label: "My Bids", link: "/my-bids" },
    { icon: <DollarSign size={20} />, label: "Add Points", link: "/add-points" },
    { icon: <Star size={20} />, label: "Starline", link: "/starline" },
    { icon: <SiMarketo size={20} />, label: "Galidesawar", link: "/golidesawar" },
    { icon: <Play size={20} />, label: "Withdrawal Funds", link: "/withdrawal-request" },
    { icon: <Clock size={20} />, label: "Bid History", link: "/bid-history" },
    { icon: <Trophy size={20} />, label: "Win History", link: "/win-history" },
    { icon: <Gamepad2 size={20} />, label: "Game Rate", link: "/game-rate" },
    { icon: <Phone size={20} />, label: "Contact Us", link: "/contact-us" },
    { icon: <Lightbulb size={20} />, label: "User's Idea", link: "/users-idea" },
    { icon: <Star size={20} />, label: "Refer & Earn", link: "/referrals" },
    { icon: <Lock size={20} />, label: "Change Password", link: "/change-password" },
    { icon: <Play size={20} />, label: "How To Play", link: "/how-to-play" },
    { icon: <LogOut size={20} />, label: "Logout", onClick: handleLogout, isLogout: true },
  ];

  return (
    <>
      {sidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebar(false)}
        ></div>
      )}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 transform bg-white shadow-[8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out ${sidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="theme-orange-header relative flex flex-col items-center px-4 py-6 rounded-b-[24px]">
          <button
            onClick={() => setSidebar(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
          >
            <X size={20} />
          </button>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-[#1565D8] shadow-lg">
            {username?.[0]?.toUpperCase()}
          </div>
          <h3 className="mt-3 text-lg font-bold capitalize text-white">{username}</h3>
          <p className="text-sm text-white/90">{mobile}</p>
        </div>

        <div className="flex h-[calc(100%-130px)] flex-col overflow-y-auto bg-white px-4 pt-2">
          {menuItems
            .filter((item) => !item.isLogout || accessToken)
            .map((item, index) => {
              const Component = item.link ? "a" : "div";
              const props = item.link ? { href: item.link } : { onClick: item.onClick };
              const isLogout = item.isLogout;
              return (
                <Component
                  key={index}
                  {...props}
                  className={`flex cursor-pointer items-center gap-4 border-b border-gray-200 px-1 py-[15px] transition hover:bg-[#F2F7FF] ${isLogout ? "text-red-600" : "text-[#1F2937]"}`}
                >
                  <div className={`${isLogout ? "text-red-500" : "text-[#374151]"}`}>{item.icon}</div>
                  <span className="text-[15px] font-medium">{item.label}</span>
                </Component>
              );
            })}
        </div>
      </div>
    </>
  );
}
