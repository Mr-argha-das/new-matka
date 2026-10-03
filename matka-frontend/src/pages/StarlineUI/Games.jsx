import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import { ArrowLeft, Dice1, Dice2, Diamond, Layers, Coins, Gem } from "lucide-react";

export default function Games() {
  const { marketId } = useParams();
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setMarket({ id: m._id?.$oid, name: m.name, open_time: m.open_time, close_time: m.close_time, status: m.status });
    } catch { setError("Failed to load market details."); }
    finally { setIsLoading(false); }
  }, [marketId]);

  useEffect(() => { fetchMarketDetails(); }, [fetchMarketDetails]);

  const allGames = [
    { name: "Single Digit", icon: <Dice1 size={28} /> },
    { name: "Jodi Digit", icon: <Dice2 size={28} /> },
    { name: "Single Panna", icon: <Layers size={28} /> },
    { name: "Double Panna", icon: <Layers size={28} /> },
    { name: "Triple Panna", icon: <Diamond size={28} /> },
    { name: "SP, DP ,TP", icon: <Coins size={28} /> },
    { name: "Half Sangam", icon: <Gem size={28} /> },
    { name: "Full Sangam", icon: <Coins size={28} /> },
  ];

  if (isLoading) return <div className="text-center py-20 max-w-md mx-auto min-h-screen bg-white text-black">Loading...</div>;
  if (error) return <div className="text-center py-20 max-w-md mx-auto min-h-screen bg-white text-red-600">{error}</div>;
  if (!market) return <div className="text-center py-20 max-w-md mx-auto min-h-screen bg-white">Market Not Found</div>;

  return (
    <div className="max-w-md mx-auto flex flex-col font-sans bg-white min-h-screen">
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/20 text-white"><ArrowLeft size={24} /></button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10">{market?.name}</h2>
      </div>
      <div className="bg-[#F0F6FF] border-b border-gray-200 px-4 py-2.5 flex justify-between text-[12px]">
        <span className="flex flex-col"><span className="text-gray-500">Open:</span><span className="font-bold text-black">{market.open_time}</span></span>
        <span className="flex flex-col"><span className="text-gray-500">Close:</span><span className="font-bold text-black">{market.close_time}</span></span>
        <span className={`font-bold ${market.status ? "text-green-600" : "text-red-600"}`}>{market.status ? "Running" : "Closed"}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3 pb-20 bg-white">
        {allGames.map((game, index) => (
          <a key={index} href={`/game/${marketId}/${createSlug(game.name)}`} className="flex flex-col justify-center items-center rounded-[16px] bg-[#E8F1FF] hover:bg-[#D6E6FF] py-5 transition hover:shadow-md hover:-translate-y-0.5">
            <div className="bg-gradient-to-br from-[#2E7BF6] to-[#1565D8] rounded-[18px] p-4 mb-3 shadow-[0_4px_12px_rgba(21,101,216,0.35)] text-white">{game.icon}</div>
            <p className="text-black text-[13px] font-bold text-center">{game.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
