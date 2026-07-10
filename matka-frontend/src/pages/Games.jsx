import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { ArrowLeft, CardSim, Coins, Diamond, Dice1, Dice2 } from "lucide-react";
import { isMarketPlayable } from "../utils/marketTime";

export default function Games() {
  const { marketId } = useParams();

  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  // Convert name → slug
  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  // ============================
  // FETCH MARKET DETAILS
  // ============================

  const fetchMarketDetails = useCallback(async () => {
    if (!marketId) {
      setError("Market ID missing");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.get(`${API_URL}/api/admin/market/${marketId}`, {
        headers,
      });

      console.log(res);

      const m = res?.data?.data;

      console.log(m);

      if (!m) {
        setError("Market not found");
        return;
      }

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
    } catch (err) {
      console.log(err);
      setError("Failed to load market details.");
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchMarketDetails();
  }, [fetchMarketDetails]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // ============================
  // GAME CARDS
  // ============================
  const colors = ["#ff9800", "#7ee000", "#ffd700", "#29b6e8", "#4d63ff", "#ff3f72"];
  const withColor = (items) =>
    items.map((item, index) => ({ ...item, color: colors[index % colors.length] }));

  const allGames = withColor([
    {
      name: "Single Digit",
      icon: <Dice1 size={30} />,
    },
    {
      name: "Single Bulk Digit",
      icon: <Dice1 size={30} />,
    },
    {
      name: "Jodi Digit",
      icon: <Dice2 size={30} />,
    },
    {
      name: "Jodi Digit Bulk",
      icon: <Dice2 size={30} />,
    },
    {
      name: "Single Panna",
      icon: <CardSim size={30} />,
    },
    {
      name: "Single Panna Bulk",
      icon: <CardSim size={30} />,
    },
    {
      name: "Double Panna",
      icon: <CardSim size={30} />,
    },
    {
      name: "Double Panna Bulk",
      icon: <CardSim size={30} />,
    },
    {
      name: "Triple Panna",
      icon: <Diamond size={30} />,
    },
    {
      name: "Full Sangam",
      icon: <Coins size={30} />,
    },
    {
      name: "Half Sangam(A)",
      icon: <Diamond size={30} />,
    },
    {
      name: "Half Sangam(B)",
      icon: <Diamond size={30} />,
    },
    {
      name: "DP Motor",
      icon: <Coins size={30} />,
    },
    {
      name: "SP Motor",
      icon: <Coins size={30} />,
    },
    {
      name: "SP DP TP",
      icon: <Coins size={30} />,
    },
    {
      name: "Two Digit Pana",
      icon: <CardSim size={30} />,
    },
    {
      name: "SP Common",
      icon: <Coins size={30} />,
    },
    {
      name: "Odd Even",
      icon: <Dice2 size={30} />,
    },
    {
      name: "DP Common",
      icon: <Coins size={30} />,
    },
    {
      name: "Red Jodi",
      icon: <Dice2 size={30} />,
    },
    {
      name: "Pana Family",
      icon: <CardSim size={30} />,
    },
    {
      name: "Digit Based Jodi",
      icon: <Dice2 size={30} />,
    },
    {
      name: "Cycle Jodi",
      icon: <Dice2 size={30} />,
    },
    {
      name: "Jodi Family",
      icon: <Dice2 size={30} />,
    },
  ]);

  if (isLoading)
    return (
      <div className="text-white text-center py-10 max-w-md mx-auto min-h-screen">
        <h1 className="text-xl font-semibold animate-pulse">
          Loading Market...
        </h1>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 max-w-md mx-auto min-h-screen bg-red-800/30 text-red-300 p-4">
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p>{error}</p>
      </div>
    );

  if (!market)
    return (
      <div className="text-white text-center py-10 max-w-md mx-auto min-h-screen">
        <h1 className="text-xl font-semibold">Market Not Found</h1>
      </div>
    );

  const marketPlayable = isMarketPlayable(market, now);

  return (
    <div className="max-w-md mx-auto flex min-h-screen flex-col bg-[#f5f6f6] font-sans text-slate-950">
      <div className="w-full relative bg-gradient-to-b from-black to-black/0 pb-2 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="p-2 pl-4 z-10 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-md z-0 w-full absolute   justify-between font-bold bg-gradient-to-b from-black to-black/0 px-4 py-2  flex justify-center items-center gap-2">
          <span className="flex gap-2 uppercase text-md items-center">
            {market?.name}
          </span>
        </h2>
        <a className="pr-4 z-10">{/* <HistoryIcon /> */}</a>
      </div>

      <p className="text-xs bg-white/5 flex justify-between px-4 py-3 rounded-b-lg text-gray-300 mb-4">
        <span className="flex flex-col">
          <strong>Open Time :</strong> <span>{market.open_time}</span>
        </span>
        {market.marketType !== "Starline" ? (
          <span className="flex flex-col">
            <strong>Close Time :</strong>
            <span>{market.close_time}</span>
          </span>
        ) : (
          ""
        )}
        <span className="flex flex-col">
          <strong>Status:</strong>
          <span
            className={`font-bold rounded-full text-xs ${
              marketPlayable ? "text-green-600" : "text-red-600"
            }`}
          >
            {marketPlayable ? "Market Running" : "Market Closed"}
          </span>
        </span>
      </p>

      {!marketPlayable && (
        <div className="mx-3 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          Market Closed. Play is disabled after close time.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 px-4 pb-28 pt-3">
        {allGames.map((game, index) => (
          <a
            key={index}
            href={marketPlayable ? `/game/${marketId}/${createSlug(game.name)}` : undefined}
            aria-disabled={!marketPlayable}
            onClick={(e) => {
              if (!marketPlayable) e.preventDefault();
            }}
            className={`group flex min-h-[136px] flex-col items-center justify-center rounded-xl border bg-white px-3 py-4 text-center shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-200 ${
              marketPlayable
                ? "border-slate-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
                : "border-red-200 bg-red-50 opacity-70 cursor-not-allowed"
            }`}
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_8px_18px_rgba(15,23,42,0.22)]"
              style={{
                backgroundColor: marketPlayable ? game.color : "#cbd5e1",
                color: "#fff",
              }}
            >
              {React.cloneElement(game.icon, { strokeWidth: 2.2 })}
            </div>
            <span
              className="mb-3 h-1 w-24 rounded-full"
              style={{ backgroundColor: marketPlayable ? game.color : "#cbd5e1" }}
            />
            <p className={`text-[15px] font-semibold leading-snug ${
              marketPlayable ? "text-slate-950" : "text-slate-500"
            }`}>
              {game.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
