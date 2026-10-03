import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { ArrowLeft, Dice1, Dice2, Diamond, Coins, Layers, Hash, Shuffle, Star, CircleDollarSign, Spade, Heart, Gem, Clover, Copy, Repeat, Users } from "lucide-react";
import { isMarketPlayable } from "../utils/marketTime";

export default function Games() {
  const { marketId } = useParams();
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  const fetchMarketDetails = useCallback(async () => {
    if (!marketId) { setError("Market ID missing"); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/market/${marketId}`, { headers });
      const m = res?.data?.data;
      if (!m) { setError("Market not found"); return; }
      setMarket({
        id: m._id?.$oid,
        name: m.name,
        hindi: m.hindi,
        open_time: m.open_time,
        close_time: m.close_time,
        status: m.status,
        is_active: m.is_active,
        marketType: m.marketType,
      });
    } catch { setError("Failed to load market details."); }
    finally { setIsLoading(false); }
  }, [marketId]);

  useEffect(() => { fetchMarketDetails(); }, [fetchMarketDetails]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const allGames = [
    { name: "Single Digit", icon: <Dice1 size={28} /> },
    { name: "Single Bulk Digit", icon: <Hash size={28} /> },
    { name: "Jodi Digit", icon: <Dice2 size={28} /> },
    { name: "Jodi Digit Bulk", icon: <Copy size={28} /> },
    { name: "Single Panna", icon: <Layers size={28} /> },
    { name: "Single Panna Bulk", icon: <Layers size={28} /> },
    { name: "Double Panna", icon: <Spade size={28} /> },
    { name: "Double Panna Bulk", icon: <Spade size={28} /> },
    { name: "Triple Panna", icon: <Diamond size={28} /> },
    { name: "Full Sangam", icon: <Coins size={28} /> },
    { name: "Half Sangam(A)", icon: <Gem size={28} /> },
    { name: "Half Sangam(B)", icon: <Gem size={28} /> },
    { name: "DP Motor", icon: <Clover size={28} /> },
    { name: "SP Motor", icon: <Clover size={28} /> },
    { name: "SP DP TP", icon: <Layers size={28} /> },
    { name: "Two Digit Pana", icon: <Dice1 size={28} /> },
    { name: "SP Common", icon: <Shuffle size={28} /> },
    { name: "Odd Even", icon: <Dice2 size={28} /> },
    { name: "DP Common", icon: <Clover size={28} /> },
    { name: "Red Jodi", icon: <Heart size={28} /> },
    { name: "Pana Family", icon: <Users size={28} /> },
    { name: "Digit Based Jodi", icon: <Hash size={28} /> },
    { name: "Cycle Jodi", icon: <Repeat size={28} /> },
    { name: "Jodi Family", icon: <Users size={28} /> },
  ];

  if (isLoading) return <div className="text-center py-20 max-w-md mx-auto min-h-screen bg-white text-black">Loading Market...</div>;
  if (error) return <div className="text-center py-20 max-w-md mx-auto min-h-screen bg-white text-red-600">{error}</div>;
  if (!market) return <div className="text-center py-20 max-w-md mx-auto min-h-screen bg-white text-black">Market Not Found</div>;

  const marketPlayable = isMarketPlayable(market, now);

  return (
    <div className="max-w-md mx-auto flex min-h-screen flex-col bg-white font-sans">
      {/* Orange Header like screenshot */}
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/20 transition text-white">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase tracking-wide pr-10">
          {market?.name}
        </h2>
      </div>

      {/* Market Info - light gray */}
      <div className="bg-[#F0F6FF] border-b border-gray-200 px-4 py-2.5 flex justify-between text-[12px]">
        <span className="flex flex-col"><span className="text-gray-500 font-medium">Open Time:</span><span className="font-bold text-black">{market.open_time}</span></span>
        <span className="flex flex-col"><span className="text-gray-500 font-medium">Close Time:</span><span className="font-bold text-black">{market.close_time}</span></span>
        <span className="flex flex-col"><span className="text-gray-500 font-medium">Status:</span><span className={`font-bold ${marketPlayable ? "text-green-600" : "text-red-600"}`}>{marketPlayable ? "Running" : "Closed"}</span></span>
      </div>

      {!marketPlayable && (
        <div className="mx-3 mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 text-center">
          Market Closed. Play is disabled after close time.
        </div>
      )}

      {/* Game Grid - like screenshot: gray cards */}
      <div className="grid grid-cols-2 gap-3 px-3 pb-28 pt-4 bg-white">
        {allGames.map((game, index) => (
          <a
            key={index}
            href={marketPlayable ? `/game/${marketId}/${createSlug(game.name)}` : undefined}
            aria-disabled={!marketPlayable}
            onClick={(e) => { if (!marketPlayable) e.preventDefault(); }}
            className={`flex flex-col items-center justify-center rounded-[16px] px-3 py-5 text-center transition-all duration-200 ${marketPlayable ? "bg-[#E8F1FF] hover:bg-[#D6E6FF] hover:shadow-md hover:-translate-y-0.5" : "bg-gray-200 opacity-60 cursor-not-allowed"}`}
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-gradient-to-br from-[#2E7BF6] to-[#1565D8] shadow-[0_4px_12px_rgba(21,101,216,0.35)] text-white">
              {game.icon}
            </div>
            <p className="mt-3 text-[14px] font-bold leading-tight text-black">
              {game.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
