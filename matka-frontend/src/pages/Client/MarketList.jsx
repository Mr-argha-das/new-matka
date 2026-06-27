import React from "react";
import { Play, Info } from "lucide-react";
import { FaChartLine } from "react-icons/fa6";

export default function MarketList({ markets }) {
  console.log(markets);
  return (
    <div className="space-y-3">
      {markets.map((mkt) => (
        <div
          key={mkt.id}
          className="theme-panel w-full rounded-[26px] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(9,78,36,0.14)]"
        >
          <div className="rounded-[26px] p-4 text-slate-900">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1">
                <h2 className="text-base font-semibold uppercase tracking-wide">
                  {mkt.name}
                </h2>
                <Info
                  size={18}
                  className="rounded-full bg-emerald-100 text-emerald-700"
                />
              </div>

              <span
                className={`text-xs font-semibold ${
                  mkt.status === true ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {mkt.status === true ? "Market Running" : "Market Closed"}
              </span>
            </div>

            {/* RESULT */}
            <div className="mb-3 border-b border-dashed border-emerald-500/20"></div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <div>
                <h3 className="mb-2 text-2xl font-extrabold tracking-wider text-emerald-700">
                  <span>
                    {mkt.open_panna}-{mkt.open_digit}
                  </span>
                  <span>
                    {mkt.close_digit}-{mkt.close_panna}
                  </span>
                </h3>

                <div className="flex gap-7">
                  <p>
                    <span className="text-slate-500">Open Time:</span>
                    <span className="block text-slate-900 font-medium">
                      {mkt.openTime}
                    </span>
                  </p>

                  <p>
                    <span className="text-slate-500">Close Time:</span>
                    <span className="block text-slate-900 font-medium">
                      {mkt.closeTime}
                    </span>
                  </p>
                </div>
              </div>

              <a href={`/charts/${mkt.id}`} className="text-amber-500 transition hover:text-amber-600">
                <FaChartLine size={26} />
              </a>

              <div className="flex flex-col items-center gap-1">
                <a
                  href={mkt.status === true ? `/play/${mkt.id}` : ""}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    mkt.status === true
                      ? "border-emerald-500 bg-emerald-100 shadow-[0_8px_18px_rgba(22,163,74,0.16)]"
                      : "border-red-400 cursor-not-allowed"
                  }`}
                >
                  <Play
                    className={
                      mkt.status === true ? "text-emerald-600" : "text-red-400"
                    }
                    size={18}
                  />
                </a>
                <span className={`text-[14px] font-semibold text-slate-700`}>Play</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
