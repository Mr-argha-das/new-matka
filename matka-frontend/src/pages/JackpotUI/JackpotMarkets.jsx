import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, History, Play } from "lucide-react";
import { API_URL } from "../../config";

const API_BASE = `${API_URL}/starline_jackpot`;

export default function JackpotMarkets() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jackpot/list`);
      setSlots(res.data || []);
    } catch (err) {
      console.error("Jackpot load error:", err);
      setError("Failed to load jackpot markets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-white text-black">
        Loading Jackpot…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md font-sans pb-20 bg-[#F2F7FF] min-h-screen">
      {/* HEADER */}
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-white/20 text-white"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10">
          Main Jackpot
        </h2>
      </div>

      <div className="bg-white rounded-b-2xl px-4 pt-4 pb-3 shadow-sm">
        {/* HISTORY BUTTONS */}
        <div className="flex gap-3">
          <a
            href="/jackpot-win-history"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white hover:bg-[#E8F1FF] py-2.5 text-[13px] font-bold text-gray-800 uppercase tracking-wide transition"
          >
            <History size={17} className="text-gray-700" /> Result History
          </a>
          <a
            href="/jackpot-bid-history"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white hover:bg-[#E8F1FF] py-2.5 text-[13px] font-bold text-gray-800 uppercase tracking-wide transition"
          >
            <History size={17} className="text-gray-700" /> Bid History
          </a>
        </div>

        {/* JODI RATE PILL */}
        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-gray-200"></div>
          <div className="px-5 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm flex items-center gap-2">
            <span className="text-[14px] font-extrabold text-black tracking-wide">
              JODI
            </span>
            <span className="text-[14px] font-extrabold text-[#1565D8]">
              10-1000
            </span>
          </div>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
      </div>

      {error && (
        <div className="mx-3 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
          {error}
        </div>
      )}

      {!error && slots.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No jackpot markets available right now.
        </p>
      )}

      {/* SLOT CARDS */}
      <div className="px-3 mt-3 flex flex-col gap-3">
        {slots.map((slot) => {
          const isLive = slot.status === "Market Running";
          return (
            <div
              key={slot.id}
              className="w-full rounded-2xl bg-white shadow-sm px-4 py-4 flex items-center justify-between gap-2"
            >
              {/* LEFT: TIME + STATUS */}
              <div className="min-w-0">
                <h2 className="text-[20px] font-extrabold text-black leading-tight">
                  {slot.name}
                </h2>
                <p
                  className={`text-[12px] font-bold mt-1 uppercase tracking-wide ${
                    isLive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isLive ? "Running Now" : "Closed For Today"}
                </p>
              </div>

              {/* MIDDLE: JODI RESULT */}
              <div className="px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <span className="text-[17px] font-extrabold text-[#1565D8] tracking-widest">
                  {slot.result || "**"}
                </span>
              </div>

              {/* RIGHT: PLAY GAME */}
              <a
                href={`/jackpot-play/${slot.id}/jodi`}
                className={`flex items-center gap-2 rounded-full border border-gray-400 bg-white hover:bg-[#E8F1FF] pl-1.5 pr-4 py-1.5 transition ${
                  isLive ? "" : "opacity-70"
                }`}
              >
                <span className="bg-gray-800 text-white rounded-full p-2 flex items-center justify-center">
                  <Play size={14} fill="currentColor" />
                </span>
                <span className="text-[12px] font-bold text-black uppercase whitespace-nowrap">
                  Play Game
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
