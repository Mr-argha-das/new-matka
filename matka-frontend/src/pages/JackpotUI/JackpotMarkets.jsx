import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Play } from "lucide-react";
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
        Loading Jackpot Markets…
      </div>
    );
  }

  return (
    <div className="space-y-3 mx-auto max-w-md font-sans pb-20 bg-white min-h-screen">
      {/* HEADER */}
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-white/20 text-white"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10">
          Jackpot
        </h2>
      </div>

      {/* HISTORY LINKS */}
      <div className="w-full flex gap-3 px-3">
        <a
          href="/jackpot-bid-history"
          className="bg-[#E8F1FF] hover:bg-[#D6E6FF] flex items-center justify-center font-bold rounded-xl py-2.5 px-3 w-full text-black text-sm"
        >
          Bids History
        </a>
        <a
          href="/jackpot-win-history"
          className="bg-[#E8F1FF] hover:bg-[#D6E6FF] flex items-center justify-center font-bold rounded-xl py-2.5 px-3 w-full text-black text-sm"
        >
          Win History
        </a>
      </div>

      {error && (
        <div className="mx-3 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
          {error}
        </div>
      )}

      {!error && slots.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No jackpot markets available right now.
        </p>
      )}

      {/* SLOT CARDS */}
      <div className="px-3 flex flex-col gap-3">
        {slots.map((slot) => {
          const isLive = slot.status === "Market Running";
          return (
            <div
              key={slot.id}
              className="w-full rounded-xl bg-white border border-gray-200 shadow-sm"
            >
              <div className="rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[15px] font-bold uppercase text-black">
                    {slot.name}
                  </h2>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isLive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isLive ? "Running" : "Closed"}
                  </span>
                </div>
                <div className="border-b border-dashed border-gray-300 mb-2"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl mb-1 font-bold text-[#1565D8]">
                      {slot.result || "XXX-X"}
                    </h3>
                    <div className="flex gap-6 text-[11px]">
                      <p>
                        <span className="text-gray-500">Open:</span>
                        <span className="block font-bold text-black">
                          {slot.start_time}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Close:</span>
                        <span className="block font-bold text-black">
                          {slot.end_time}
                        </span>
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/jackpot-play/${slot.id}`}
                    className={`flex flex-col items-center gap-1 ${
                      isLive ? "" : "opacity-60"
                    }`}
                  >
                    <span className="bg-[#1565D8] hover:bg-[#0D3FB2] text-white rounded-full p-3 shadow-md transition">
                      <Play size={20} fill="currentColor" />
                    </span>
                    <span className="text-[11px] font-bold text-black">
                      Play
                    </span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
