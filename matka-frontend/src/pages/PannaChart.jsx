import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Copy, Check, BookOpenText } from "lucide-react";
import { API_URL } from "../config";
import {
  PANNA_22_CHART,
  SINGLE_PANNA_LIST,
  DOUBLE_PANNA_LIST,
  TRIPLE_PANNA_LIST,
  getAnk,
  getPannaType,
  PANNA_TYPE_LABEL,
} from "../data/pannaCharts";

const TABS = [
  { id: "sp", label: "Single Panna", hindi: "सिंगल पाना", count: SINGLE_PANNA_LIST.length },
  { id: "dp", label: "Double Panna", hindi: "डबल पाना", count: DOUBLE_PANNA_LIST.length },
  { id: "tp", label: "Triple Panna", hindi: "ट्रिपल पाना", count: TRIPLE_PANNA_LIST.length },
  { id: "all", label: "22 Panna Chart", hindi: "22 पाना चार्ट", count: 220 },
];

const CHIP_STYLE = {
  SP: "border-emerald-200 bg-emerald-50 text-emerald-800",
  DP: "border-amber-200 bg-amber-50 text-amber-800",
  TP: "border-purple-200 bg-purple-50 text-purple-800",
};

export default function PannaChart() {
  const [searchParams] = useSearchParams();
  const initialTab = ["sp", "dp", "tp", "all"].includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "sp";

  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const [rates, setRates] = useState({ sp: 150, dp: 300, tp: 700 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const token = localStorage.getItem("accessToken") || "";
        const res = await axios.get(`${API_URL}/api/admin/rate/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const c = res.data || {};
        const per1 = (v2, v1, fallback) =>
          v2 && v1 ? Math.round(Number(v2) / Number(v1)) : fallback;
        setRates({
          sp: per1(c.single_pana_2, c.single_pana_1, 150),
          dp: per1(c.double_pana_2, c.double_pana_1, 300),
          tp: per1(c.tripple_pana_2, c.tripple_pana_1, 700),
        });
      } catch {
        // keep fallback rates
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(""), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const copyPanna = async (panna) => {
    try {
      await navigator.clipboard.writeText(panna);
    } catch {
      // clipboard not available — ignore
    }
    setCopied(panna);
  };

  const q = query.replace(/\D/g, "").slice(0, 3);
  const searchInfo = useMemo(() => {
    if (q.length !== 3) return null;
    const type = getPannaType(q);
    return { panna: q, type, label: PANNA_TYPE_LABEL[type], ank: getAnk(q) };
  }, [q]);

  const matchQuery = (panna) => !q || panna.includes(q);

  const ankGroups = useMemo(
    () => [...PANNA_22_CHART].sort((a, b) => a.ank - b.ank),
    []
  );

  const renderChips = (list, type) => {
    const filtered = list.filter(matchQuery);
    if (!filtered.length)
      return <p className="py-2 text-sm text-slate-400">No panna found</p>;
    return (
      <div className="grid grid-cols-4 gap-2">
        {filtered.map((p) => (
          <button
            key={p}
            onClick={() => copyPanna(p)}
            title={`${PANNA_TYPE_LABEL[type]} • Ank ${getAnk(p)} (tap to copy)`}
            className={`flex items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[15px] font-bold tracking-widest transition active:scale-95 ${CHIP_STYLE[type]}`}
          >
            {p}
            {copied === p ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              <Copy size={11} className="opacity-40" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-md pb-28 font-sans text-slate-900">
      {/* HEADER */}
      <div className="relative flex items-center bg-gradient-to-b from-black to-black/0 py-4">
        <button
          onClick={() => window.history.back()}
          className="absolute left-3 rounded-full p-2 text-white hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="w-full text-center text-lg font-semibold text-white">
          Panna Chart
        </h1>
        <span className="absolute right-3 rounded-full p-2 text-white">
          <BookOpenText size={20} />
        </span>
      </div>

      <div className="px-3">
        {/* TITLE */}
        <div className="theme-card mt-3 px-4 py-4 text-center">
          <h2 className="text-lg font-extrabold leading-snug text-emerald-900">
            Single Panna, Double Panna,
            <br />
            Triple Panna List
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Complete SP, DP, TP reference chart with all 220 Panna combinations
          </p>
        </div>

        {/* RATE CARDS */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="theme-panel px-2 py-3 text-center">
            <p className="text-[11px] font-bold uppercase text-emerald-700">Single Panna</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">₹{rates.sp}</p>
            <p className="text-[10px] text-slate-500">per ₹1 bet</p>
          </div>
          <div className="theme-panel px-2 py-3 text-center">
            <p className="text-[11px] font-bold uppercase text-amber-700">Double Panna</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">₹{rates.dp}</p>
            <p className="text-[10px] text-slate-500">per ₹1 bet</p>
          </div>
          <div className="theme-panel px-2 py-3 text-center">
            <p className="text-[11px] font-bold uppercase text-purple-700">Triple Panna</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">₹{rates.tp}</p>
            <p className="text-[10px] text-slate-500">per ₹1 bet</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="theme-panel mt-3 flex items-center gap-2 px-3 py-2.5">
          <Search size={18} className="shrink-0 text-emerald-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="Panna search karein… (e.g. 123)"
            inputMode="numeric"
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500"
            >
              Clear
            </button>
          )}
        </div>

        {searchInfo && (
          <div className="theme-green-bar mt-2 flex items-center justify-between rounded-[22px] px-4 py-3">
            <div>
              <p className="text-2xl font-extrabold tracking-[0.3em]">{searchInfo.panna}</p>
              <p className="text-xs opacity-90">
                {searchInfo.label} • Ank {searchInfo.ank}
              </p>
            </div>
            <button
              onClick={() => copyPanna(searchInfo.panna)}
              className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold"
            >
              {copied === searchInfo.panna ? <Check size={14} /> : <Copy size={14} />}
              {copied === searchInfo.panna ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        {/* TABS */}
        <div className="sticky top-0 z-10 -mx-3 mt-3 bg-[#f4fbf6]/95 px-3 py-2 backdrop-blur">
          <div className="grid grid-cols-4 gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-2xl border px-1 py-2 text-center transition ${
                  tab === t.id
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_10px_24px_rgba(22,163,74,0.3)]"
                    : "theme-pill"
                }`}
              >
                <span className="block text-[11px] font-extrabold leading-tight">
                  {t.id === "all" ? "22 Chart" : t.label.replace(" Panna", "")}
                </span>
                <span
                  className={`block text-[10px] font-semibold ${
                    tab === t.id ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  {t.count} Total
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SINGLE / DOUBLE LIST — grouped by Ank */}
        {(tab === "sp" || tab === "dp") && (
          <div className="mt-2 space-y-3">
            <div className="theme-card px-4 py-3 text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                {tab === "sp" ? "Single Panna List (सिंगल पाना)" : "Double Panna List (डबल पाना)"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {tab === "sp"
                  ? "All 3 digits are different (सभी 3 अंक अलग-अलग)"
                  : "2 digits are same (2 अंक एक जैसे)"}
              </p>
            </div>

            {ankGroups.map((g) => {
              const list = (tab === "sp" ? g.singlePannas : g.doublePannas).filter(matchQuery);
              if (q && !list.length) return null;
              return (
                <div key={g.ank} className="theme-panel overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-600/10 bg-emerald-50/70 px-4 py-2">
                    <span className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white">
                        {g.ank}
                      </span>
                      Ank {g.ank}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {tab === "sp" ? "12 Panna" : "9 Panna"}
                    </span>
                  </div>
                  <div className="p-3">{renderChips(tab === "sp" ? g.singlePannas : g.doublePannas, tab === "sp" ? "SP" : "DP")}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* TRIPLE LIST */}
        {tab === "tp" && (
          <div className="mt-2 space-y-3">
            <div className="theme-card px-4 py-3 text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                Triple Panna List (ट्रिपल पाना)
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                All 3 digits are same (सभी 3 अंक एक जैसे) — Highest Payout!
              </p>
            </div>
            <div className="theme-panel p-3">
              <div className="grid grid-cols-2 gap-2">
                {TRIPLE_PANNA_LIST.filter(matchQuery).map((p) => (
                  <button
                    key={p}
                    onClick={() => copyPanna(p)}
                    title={`Triple Panna • Ank ${getAnk(p)} (tap to copy)`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition active:scale-95 ${CHIP_STYLE.TP}`}
                  >
                    <span className="text-xl font-extrabold tracking-[0.25em]">{p}</span>
                    <span className="text-[11px] font-bold opacity-70">Ank {getAnk(p)}</span>
                  </button>
                ))}
              </div>
              {q && !TRIPLE_PANNA_LIST.filter(matchQuery).length && (
                <p className="py-2 text-center text-sm text-slate-400">No panna found</p>
              )}
            </div>
          </div>
        )}

        {/* 22 PANNA CHART — all digits */}
        {tab === "all" && (
          <div className="mt-2 space-y-3">
            <div className="theme-card px-4 py-3 text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                All 22 Panna Chart (सभी 22 पाना)
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Har ank ke 22 panna — 12 Single + 9 Double + 1 Triple
              </p>
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Single
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Double
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Triple
                </span>
              </div>
            </div>

            {ankGroups.map((g) => {
              const sp = g.singlePannas.filter(matchQuery);
              const dp = g.doublePannas.filter(matchQuery);
              const tp = matchQuery(g.triple) ? [g.triple] : [];
              if (q && !sp.length && !dp.length && !tp.length) return null;
              return (
                <div key={g.ank} className="theme-panel overflow-hidden">
                  <div className="theme-green-bar flex items-center justify-between px-4 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-extrabold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-sm font-extrabold">
                        {g.ank}
                      </span>
                      Ank {g.ank} — 22 Panna
                    </span>
                    <button
                      onClick={() => copyPanna(g.triple)}
                      className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold tracking-widest"
                    >
                      {g.triple}
                      {copied === g.triple ? <Check size={12} /> : <Copy size={11} />}
                    </button>
                  </div>
                  <div className="space-y-3 p-3">
                    <div>
                      <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                        Single Panna (12)
                      </p>
                      {renderChips(g.singlePannas, "SP")}
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                        Double Panna (9)
                      </p>
                      {renderChips(g.doublePannas, "DP")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* HOW TO IDENTIFY */}
        <div className="theme-panel mt-3 p-4">
          <h3 className="text-center text-base font-extrabold text-slate-900">
            📖 Panna Type Kaise Pehchane?
          </h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="font-extrabold text-emerald-800">Single Panna (SP):</p>
              <p className="mt-0.5 text-slate-700">
                <b>123</b> → 1, 2, 3 sabhi alag ✓<br />
                <b>456</b> → 4, 5, 6 sabhi alag ✓
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <p className="font-extrabold text-amber-800">Double Panna (DP):</p>
              <p className="mt-0.5 text-slate-700">
                <b>112</b> → 1 repeat hai ✓<br />
                <b>556</b> → 5 repeat hai ✓
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-3">
              <p className="font-extrabold text-purple-800">Triple Panna (TP):</p>
              <p className="mt-0.5 text-slate-700">
                <b>111</b> → sabhi 1 ✓<br />
                <b>777</b> → sabhi 7 ✓
              </p>
            </div>
            <p className="rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              <b>Ank nikalna:</b> teeno digits jodein, aakhri digit hi Ank hai.
              Jaise <b>234</b> → 2+3+4 = 9, to Ank = <b>9</b>. Har panna hamesha
              apne Ank se juda hota hai.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Tap any panna to copy • 220 Panna Chart
        </p>
      </div>
    </div>
  );
}
