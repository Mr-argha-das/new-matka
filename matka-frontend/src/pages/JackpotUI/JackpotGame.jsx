import React, { useEffect, useState } from "react";
import axios from "axios";
import { Play, Info, ArrowLeft } from "lucide-react";
import { FaChartLine } from "react-icons/fa6";
import { API_URL } from "../../config";

export default function JackpotGame() {
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const getId = (obj) => {
    if (!obj) return null;
    if (obj._id?.$oid) return obj._id.$oid;
    if (typeof obj._id === "string") return obj._id;
    if (obj.id) return obj.id;
    return null;
  };

  const fetchMarkets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/Golidesawar/market`, { headers });
      const list = (res.data?.data || []).map((m) => ({
        id: getId(m),
        name: m.name,
        openTime: m.open_time,
        closeTime: m.close_time,
        status: m.status,
        today_result: m.today_result || null,
      }));
      setMarkets(list);
    } catch (err) { console.log("Golidesawar load error:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchMarkets(); }, []);

  if (loading) return <div className="flex justify-center items-center h-[60vh] bg-white text-black">Loading Markets…</div>;

  return (
    <div className="space-y-3 mx-auto max-w-md font-sans pb-20 bg-white min-h-screen">
      <div className="w-full bg-[#2E7BF6] flex items-center px-3 py-3 shadow-md">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/20 text-white"><ArrowLeft size={22} /></button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10">Golidesawar</h2>
      </div>

      <div className="px-3">
        <div className="w-full bg-[#F0F6FF] border border-gray-200 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center"><span className="font-semibold text-black text-[13px]">Left Digit</span><span className="font-bold text-black text-[13px]">10–100</span></div>
          <div className="flex justify-between items-center"><span className="font-semibold text-black text-[13px]">Right Digit</span><span className="font-bold text-black text-[13px]">10–100</span></div>
          <div className="flex justify-between items-center"><span className="font-semibold text-black text-[13px]">Jodi Digit</span><span className="font-bold text-black text-[13px]">10–1000</span></div>
        </div>
      </div>

      <div className="w-full flex gap-3 px-3">
        <a href="/king-bids-history" className="bg-[#E8F1FF] hover:bg-[#D6E6FF] flex items-center justify-center font-bold rounded-xl py-2.5 px-3 w-full text-black text-sm">Bids History</a>
        <a href="/king-win-history" className="bg-[#E8F1FF] hover:bg-[#D6E6FF] flex items-center justify-center font-bold rounded-xl py-2.5 px-3 w-full text-black text-sm">Win History</a>
      </div>

      <div className="px-3 flex flex-col gap-3">
        {markets.map((mkt) => {
          const openDigit = mkt.today_result?.open_digit || "X";
          const closeDigit = mkt.today_result?.close_digit || "X";
          return (
            <div key={mkt.id} className="w-full rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1">
                    <h2 className="text-[15px] font-bold uppercase text-black">{mkt.name}</h2>
                    <Info size={16} className="bg-blue-100 text-[#1565D8] rounded-full p-0.5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${mkt.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{mkt.status ? "Running" : "Closed"}</span>
                </div>
                <div className="border-b border-dashed border-gray-300 mb-2"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl mb-1 font-bold text-[#1565D8]">{openDigit}-{closeDigit}</h3>
                    <div className="flex gap-6 text-[11px]">
                      <p><span className="text-gray-500">Open:</span><span className="block font-bold text-black">{mkt.openTime}</span></p>
                      <p><span className="text-gray-500">Close:</span><span className="block font-bold text-black">{mkt.closeTime}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`/GCharts/${mkt.id}`} className="text-gray-400 hover:text-[#1565D8]"><FaChartLine size={22} /></a>
                    <div className="flex flex-col items-center gap-1">
                      <a href={mkt.status ? `/king/${mkt.id}` : ""} className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md ${mkt.status ? "bg-gradient-to-br from-[#2E7BF6] to-[#0D3FB2] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}><Play size={18} fill="white" /></a>
                      <span className="text-[12px] font-bold text-black">Play</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
