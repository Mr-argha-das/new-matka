// src/pages/AdminLoginPage.jsx
import React, { useState } from "react";
import {
  LogIn,
  User,
  Power,
  Loader2,
  Smartphone,
  Lock,
  ShieldAlert,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { API_URL } from "../../config";

// Spinner
const LoadingSpinner = () => <Loader2 className="animate-spin h-5 w-5 mr-2" />;

export default function AdminLoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [shake, setShake] = useState(false);

  const showError = (text) => {
    setMessage({ type: "error", text });
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async () => {
    if (!mobile || !password) {
      showError("Enter admin mobile & password.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // 1) Real login with the admin account (DB user with role=admin)
      const res = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        showError(d.detail || "Incorrect mobile or password");
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      const token = data.access_token;

      // 2) Verify this account really has admin rights
      const check = await fetch(`${API_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!check.ok) {
        showError("Ye account admin nahi hai! Admin wale mobile/password se login karo.");
        setIsLoading(false);
        return;
      }

      // 3) Store a DEDICATED admin token (user-app login won't overwrite it)
      localStorage.setItem("adminAccessToken", token);
      localStorage.setItem("adminUserId", data.userId || "");
      localStorage.setItem("adminToken", token); // legacy compat

      setMessage({ type: "success", text: "Admin Login Successful!" });
      setTimeout(() => {
        window.location.href = "/admin";
      }, 600);
    } catch {
      showError("Network error — try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const Message = ({ type, text }) => {
    if (!text) return null;

    let bgColor = "bg-gray-700/80 text-white border";
    let Icon = ShieldAlert;

    if (type === "error") {
      bgColor = "bg-red-600/20 border border-red-500 text-red-300";
      Icon = Power;
    }
    if (type === "success") {
      bgColor = "bg-green-600/20 border border-green-500 text-green-300";
      Icon = LogIn;
    }

    return (
      <div
        className={`p-3 rounded-xl flex items-center gap-2 mt-3 shadow-md ${bgColor} ${
          type === "error" && shake ? "animate-shake" : ""
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl backdrop-blur">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="sridevimatka"
            className="h-30 rounded-full place-items-center mb-3"
          />
        </div>

        <h1 className="text-center text-3xl text-white font-bold tracking-wide">
          Admin Login
        </h1>
        <p className="text-center text-gray-400 text-sm mt-2">
          Authorized access only.
        </p>

        {message && <Message type={message.type} text={message.text} />}

        {/* MOBILE INPUT */}
        <label className="text-gray-300 block mt-6 mb-1 text-sm font-semibold">
          Admin Mobile
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter admin mobile"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* PASSWORD INPUT */}
        <label className="text-gray-300 block mt-5 mb-1 text-sm font-semibold">
          Admin Password
        </label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex mt-5 items-center justify-center bg-gradient-to-tl from-[#212b61] to-[#79049a] text-white font-semibold py-3 rounded-lg hover:bg-purple-800 transition"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Verifying...
            </>
          ) : (
            <>
              <LogIn size={20} className="mr-2" /> Login as Admin
            </>
          )}
        </button>

        <p className="text-center text-gray-400 mt-5 text-sm">
          Need Assistance?{" "}
          <a
            href="https://wa.me/918585918780"
            className="text-green-400 underline"
            target="_blank"
            rel="noreferrer"
          >
            Contact Support
          </a>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
