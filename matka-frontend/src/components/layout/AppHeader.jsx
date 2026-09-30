// AppHeader.jsx - Orange theme like screenshot
import React, { useState, useEffect } from "react";
import { Menu, Wallet2Icon } from "lucide-react";
import { API_URL } from "../../config";
import logo from "../../assets/logo.png";

const API_BASE_URL = API_URL;

const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

export default function AppHeader({ setSidebar }) {
  const [balance, setBalance] = useState("...");
  const [loading, setLoading] = useState(true);

  const fetchWalletBalance = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setBalance("Login");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/user/balance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance.toFixed(2));
      } else {
        setBalance("N/A");
      }
    } catch {
      setBalance("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    const intervalId = setInterval(fetchWalletBalance, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="w-full z-40">
      <div className="theme-orange-header mx-auto flex max-w-md items-center justify-between px-4 py-3 rounded-b-[20px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebar(true)}
            className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition"
          >
            <Menu size={22} />
          </button>
          <img src={logo} alt="sridevimatka" className="h-9 w-9 rounded-full bg-white object-cover" />
          <h1 className="text-white text-lg font-bold tracking-wide">
            sridevimatka
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-white/30 transition">
            <Wallet2Icon size={18} />
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `₹${balance}`
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
