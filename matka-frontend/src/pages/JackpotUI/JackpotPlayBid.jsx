import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../../config";

const API_BASE = `${API_URL}/starline_jackpot`;

export default function JackpotPlayBid() {
  const { marketId, gameId } = useParams();

  const [market, setMarket] = useState(null);
  const [digit, setDigit] = useState("");
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("accessToken");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const formatGameName = (str) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const gameName = formatGameName(gameId);
  const apiGameName = gameId.replace(/-/g, "_"); // required for API

  const fetchMarket = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jackpot/${marketId}`, authHeader);
      setMarket(res.data);
    } catch (err) {
      console.error("Error loading market:", err);
    }
  };

  const maxDigits =
    apiGameName === "single_digit" ? 1 : apiGameName === "jodi" ? 2 : 3;

  const handleDigitChange = (value) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= maxDigits) setDigit(clean);
  };

  const fetchResult = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jackpot/result/get`, {
        params: { slot_id: marketId },
        ...authHeader,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Error loading result:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jackpot/bid/history`, authHeader);
      setHistory((res.data || []).filter((b) => b.slot_id === marketId));
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchMarket();
      await fetchResult();
      await fetchHistory();
      setLoading(false);
    })();
  }, [marketId]);

  const placeBid = async () => {
    setMessage(null);

    if (!digit || !points) {
      setMessage({ type: "error", text: "Please enter digit and points." });
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/jackpot/bid`,
        {},
        {
          params: {
            slot_id: marketId,
            game_type: apiGameName,
            digit: digit,
            points: Number(points),
          },
          ...authHeader,
        }
      );

      setMessage({ type: "success", text: res.data.msg });
      setDigit("");
      setPoints("");
      fetchHistory();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Error placing bid",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-white text-black">
        Loading…
      </div>
    );
  }

  const isLive = market?.status === "Market Running";

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 bg-white font-sans">
      {/* HEADER */}
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-white/20 text-white"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="flex-1 text-center text-[16px] font-bold text-white uppercase pr-10">
          {market?.name} - {gameName}
        </h2>
      </div>

      {/* MARKET INFO */}
      <div className="bg-[#E8F1FF] text-xs py-2.5 px-4 flex justify-around items-center text-gray-700 border-b border-blue-100">
        <p>
          Open: <span className="font-bold text-black">{market?.start_time || "—"}</span>
        </p>
        <p>
          Close: <span className="font-bold text-black">{market?.end_time || "—"}</span>
        </p>
        <span
          className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
            isLive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {isLive ? "LIVE" : "CLOSED"}
        </span>
      </div>

      {/* RESULT BOX */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-[#0A3796] text-sm">Latest Result</h2>
        {result?.panna ? (
          <div className="mt-2 text-center">
            <p className="text-xl font-bold text-[#1565D8]">{result.panna}</p>
            <p className="text-xs text-gray-500">{result.date}</p>
          </div>
        ) : (
          <p className="text-gray-500 mt-2 text-sm">No result yet</p>
        )}
      </div>

      {/* BID FORM */}
      <div className="p-4">
        <h2 className="text-md font-bold mb-3 text-black">Place Your Bid</h2>

        <input
          type="text"
          inputMode="numeric"
          placeholder={
            apiGameName === "single_digit"
              ? "Enter Digit (0-9)"
              : apiGameName === "jodi"
              ? "Enter Jodi (00-99)"
              : "Enter Panna (3 digits)"
          }
          value={digit}
          disabled={!isLive}
          onChange={(e) => handleDigitChange(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 mb-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          maxLength={maxDigits}
        />
        <input
          type="number"
          disabled={!isLive}
          placeholder="Enter Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 mb-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />

        <button
          disabled={!isLive}
          onClick={placeBid}
          className={`${
            !isLive ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          } w-full bg-gradient-to-r from-[#2E7BF6] to-[#0D3FB2] text-white py-3 rounded-lg font-bold shadow-md transition`}
        >
          {isLive ? "Submit Bid" : "Market Closed"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center font-semibold text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* BID HISTORY */}
      <div className="p-4 border-t border-gray-200 mt-2">
        <h2 className="text-md font-bold mb-3 text-black">Your Bid History</h2>

        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No bidding history found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((b, i) => (
              <div
                key={i}
                className="bg-[#F2F7FF] border border-blue-100 p-3 rounded-lg"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-black">
                    {formatGameName((b.game || "").replace(/_/g, " "))}
                  </span>
                  <span className="font-bold text-[#1565D8]">{b.digit}</span>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-600">
                  <span>Points: {b.points}</span>
                  <span>{b.time ? new Date(b.time).toLocaleString() : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
