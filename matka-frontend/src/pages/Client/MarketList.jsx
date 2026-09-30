import React, { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";
import { FaChartLine } from "react-icons/fa6";
import { isMarketPlayable } from "../../utils/marketTime";

export default function MarketList({ markets }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3">
      {markets.map((mkt) => {
        const marketPlayable = isMarketPlayable(mkt, now);
        return (
          <div key={mkt.id} className="w-full rounded-[16px] bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-bold uppercase tracking-wide text-black">{mkt.name}</h2>
                  <Info size={16} className="rounded-full bg-orange-100 text-[#FF8C00] p-0.5" />
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${marketPlayable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {marketPlayable ? "Running" : "Closed"}
                </span>
              </div>

              <div className="my-2 border-b border-dashed border-gray-300"></div>

              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="mb-2 text-[20px] font-extrabold tracking-wider text-[#FF8C00]">
                    <span>{mkt.open_panna}-{mkt.open_digit}</span>
                    <span className="mx-1 text-gray-400">|</span>
                    <span>{mkt.close_digit}-{mkt.close_panna}</span>
                  </h3>
                  <div className="flex gap-6 text-[11px]">
                    <p><span className="text-gray-500">Open:</span><span className="block font-bold text-black">{mkt.openTime}</span></p>
                    <p><span className="text-gray-500">Close:</span><span className="block font-bold text-black">{mkt.closeTime}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-3">
                  <a href={`/charts/${mkt.id}`} className="text-gray-400 hover:text-[#FF8C00] transition">
                    <FaChartLine size={22} />
                  </a>
                  <div className="flex flex-col items-center gap-1">
                    <a
                      href={marketPlayable ? `/play/${mkt.id}` : undefined}
                      aria-disabled={!marketPlayable}
                      onClick={(e) => { if (!marketPlayable) e.preventDefault(); }}
                      className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md transition ${marketPlayable ? "bg-gradient-to-br from-[#FF9800] to-[#F57C00] text-white hover:scale-105" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                      <Play size={18} fill="white" />
                    </a>
                    <span className={`text-[12px] font-bold ${marketPlayable ? "text-black" : "text-gray-400"}`}>{marketPlayable ? "Play" : "Closed"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
