import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CardSim, Diamond, Dice1 } from "lucide-react";
import { API_URL } from "../../config";

const API_BASE = `${API_URL}/starline_jackpot`;

export default function JackpotGameSelect() {
  const { marketId } = useParams();

  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/jackpot/${marketId}`);
      const data = response.data;
      setMarket({
        id: data.id,
        name: data.name || data.start_time,
        open_time: data.start_time,
        close_time: data.end_time || "—",
        status: data.status,
      });
    } catch (err) {
      console.error("Error fetching market:", err);
      setError("Failed to load market. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [marketId]);

  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  const allGames = [
    { name: "Single Digit", icon: <Dice1 size={30} className="text-white" /> },
    { name: "Single Panna", icon: <CardSim size={30} className="text-white" /> },
    { name: "Double Panna", icon: <CardSim size={30} className="text-white" /> },
    { name: "Triple Panna", icon: <Diamond size={30} className="text-white" /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-white text-black">
        Loading Market…
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="mx-3 mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
        {error || "Market not found."}
      </div>
    );
  }

  const isLive = market.status === "Market Running";

  return (
    <div className="max-w-md mx-auto flex flex-col font-sans pb-20 bg-white min-h-screen">
      {/* HEADER */}
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-white/20 text-white"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10">
          {market.name}
        </h2>
      </div>

      {/* MARKET DETAILS */}
      <div className="bg-[#E8F1FF] text-xs py-2.5 px-4 flex justify-around items-center text-gray-700 mb-4 border-b border-blue-100">
        <p>
          Open: <span className="font-bold text-black">{market.open_time}</span>
        </p>
        <p>
          Close: <span className="font-bold text-black">{market.close_time}</span>
        </p>
        <span
          className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
            isLive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {isLive ? "LIVE" : "CLOSED"}
        </span>
      </div>

      {/* GAME GRID */}
      <div className="grid grid-cols-2 gap-4 p-3">
        {allGames.map((game, index) => (
          <a
            key={index}
            href={`/jackpot-play/${marketId}/${createSlug(game.name)}`}
            className="flex flex-col justify-center items-center bg-white rounded-xl py-6 border border-gray-200 shadow-sm hover:border-[#1565D8] hover:shadow-md transition-all hover:scale-[1.03]"
          >
            <div className="bg-[#1565D8] rounded-2xl p-4 mb-2 shadow-lg">
              {game.icon}
            </div>
            <p className="text-black text-sm font-bold text-center">
              {game.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
