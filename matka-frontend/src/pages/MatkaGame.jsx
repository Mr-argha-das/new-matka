// src/pages/MatkaGame.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader, ArrowLeft, Search, X } from "lucide-react";
import { API_URL } from "../config";
import { isMarketPlayable } from "../utils/marketTime";
import { getPannaListByGameType } from "../utils/pannaLists";

const API_BASE = `${API_URL}`;

// ======================= HELPERS =======================
const slugToGameType = (slug = "") => {
  const s = slug
    .toLowerCase()
    .replace(/[(),]/g, "")
    .replace(/-/g, "_");

  if (["single_digit", "single"].includes(s)) return "single";
  if (["single_bulk_digit", "single_digit_bulk"].includes(s))
    return "single_bulk";
  if (["jodi_digit", "jodi"].includes(s)) return "jodi";
  if (["jodi_digit_bulk", "jodi_bulk"].includes(s)) return "jodi_bulk";
  if (["single_panna"].includes(s)) return "single_panna";
  if (["single_panna_bulk"].includes(s)) return "single_panna_bulk";
  if (["double_panna"].includes(s)) return "double_panna";
  if (["double_panna_bulk"].includes(s)) return "double_panna_bulk";
  if (["triple_panna"].includes(s)) return "triple_panna";
  if (["sp"].includes(s)) return "sp";
  if (["dp"].includes(s)) return "dp";
  if (["tp"].includes(s)) return "tp";
  if (["half_sangam"].includes(s)) return "half_sangam";
  if (["half_sangama"].includes(s)) return "half_sangam_a";
  if (["half_sangamb"].includes(s)) return "half_sangam_b";
  if (["full_sangam"].includes(s)) return "full_sangam";
  if (["dp_motor"].includes(s)) return "dp_motor";
  if (["sp_motor"].includes(s)) return "sp_motor";
  if (["sp_dp_tp"].includes(s)) return "sp_dp_tp";
  if (["two_digit_pana"].includes(s)) return "two_digit_pana";
  if (["sp_common"].includes(s)) return "sp_common";
  if (["odd_even"].includes(s)) return "odd_even";
  if (["dp_common"].includes(s)) return "dp_common";
  if (["red_jodi"].includes(s)) return "red_jodi";
  if (["pana_family"].includes(s)) return "pana_family";
  if (["digit_based_jodi"].includes(s)) return "digit_based_jodi";
  if (["cycle_jodi"].includes(s)) return "cycle_jodi";
  if (["jodi_family"].includes(s)) return "jodi_family";

  return s;
};

const prettyName = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const splitEntries = (value = "") =>
  value.trim().split(/[\s,]+/).filter(Boolean);

const SINGLE_GAMES = new Set(["single", "single_bulk"]);
const JODI_GAMES = new Set([
  "jodi",
  "jodi_bulk",
  "odd_even",
  "red_jodi",
  "digit_based_jodi",
  "cycle_jodi",
  "jodi_family",
]);
const PANNA_GAMES = new Set([
  "single_panna",
  "single_panna_bulk",
  "double_panna",
  "double_panna_bulk",
  "triple_panna",
  "sp",
  "dp",
  "tp",
  "dp_motor",
  "sp_motor",
  "sp_dp_tp",
  "two_digit_pana",
  "sp_common",
  "dp_common",
  "pana_family",
]);
const HALF_SANGAM_GAMES = new Set([
  "half_sangam",
  "half_sangam_a",
  "half_sangam_b",
]);

const BULK_GAMES = new Set([
  "single_bulk",
  "jodi_bulk",
  "single_panna_bulk",
  "double_panna_bulk",
]);

const inputHelpByGame = {
  single: { label: "Single Digit", placeholder: "Enter 0-9" },
  single_bulk: {
    label: "Single Bulk Digit",
    placeholder: "0, 1, 2",
    allowList: true,
  },
  jodi: { label: "Jodi Digit", placeholder: "Enter 2 digits" },
  jodi_bulk: {
    label: "Jodi Digit Bulk",
    placeholder: "12, 34, 56",
    allowList: true,
  },
  single_panna: { label: "Single Panna", placeholder: "Enter 3 digits - e.g. 123" },
  single_panna_bulk: {
    label: "Single Panna Bulk",
    placeholder: "123, 456, 789",
    allowList: true,
  },
  double_panna: { label: "Double Panna", placeholder: "Enter 3 digits - e.g. 112" },
  double_panna_bulk: {
    label: "Double Panna Bulk",
    placeholder: "112, 224, 668",
    allowList: true,
  },
  triple_panna: { label: "Triple Panna", placeholder: "Enter 3 digits - e.g. 111" },
  dp_motor: { label: "DP Motor", placeholder: "112, 224", allowList: true },
  sp_motor: { label: "SP Motor", placeholder: "123, 147", allowList: true },
  sp_dp_tp: { label: "SP DP TP", placeholder: "123, 112, 777", allowList: true },
  two_digit_pana: {
    label: "Two Digit Pana",
    placeholder: "123, 456",
    allowList: true,
  },
  sp_common: { label: "SP Common", placeholder: "123, 147", allowList: true },
  odd_even: { label: "Odd Even", placeholder: "12, 34", allowList: true },
  dp_common: { label: "DP Common", placeholder: "112, 224", allowList: true },
  red_jodi: { label: "Red Jodi", placeholder: "05, 16", allowList: true },
  pana_family: {
    label: "Pana Family",
    placeholder: "123, 456",
    allowList: true,
  },
  digit_based_jodi: {
    label: "Digit Based Jodi",
    placeholder: "12, 23, 34",
    allowList: true,
  },
  cycle_jodi: { label: "Cycle Jodi", placeholder: "12, 24, 48", allowList: true },
  jodi_family: {
    label: "Jodi Family",
    placeholder: "12, 21, 34",
    allowList: true,
  },
};

function validateDigitFrontend(game_type, digit) {
  if (!digit) throw new Error("Digit / panna is required.");

  const entries = splitEntries(digit);

  if (SINGLE_GAMES.has(game_type) && entries.some((entry) => !/^\d$/.test(entry)))
    throw new Error("Single entries must be exactly 1 digit.");

  if (JODI_GAMES.has(game_type) && entries.some((entry) => !/^\d{2}$/.test(entry)))
    throw new Error("Jodi entries must be exactly 2 digits.");

  if (PANNA_GAMES.has(game_type) && entries.some((entry) => !/^\d{3}$/.test(entry)))
    throw new Error("Panna entries must be exactly 3 digits.");

  if (HALF_SANGAM_GAMES.has(game_type) && !/^\d{3}-\d$/.test(digit))
    throw new Error("Half Sangam must be in format 123-4");

  if (game_type === "full_sangam" && !/^\d{3}-\d{3}$/.test(digit))
    throw new Error("Full Sangam must be in format 123-456");
}

const Message = ({ type, text }) => {
  if (!text) return null;
  return (
    <div
      className={`p-3 mx-3 rounded-lg mb-4 flex items-center gap-3 ${
        type === "success"
          ? "bg-green-900 text-green-200"
          : type === "error"
          ? "bg-red-900 text-red-200"
          : "bg-blue-900 text-blue-200"
      }`}
    >
      {type === "success" && <CheckCircle />}
      {type === "error" && <XCircle />}
      {type === "info" && <Loader className="animate-spin" />}
      {text}
    </div>
  );
};

// ======================= PANNA SUGGESTION COMPONENT =======================
const PannaSuggestionBox = ({ pannaMeta, digit, setDigit, gameType }) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  const isBulk = BULK_GAMES.has(gameType);

  // Filter logic: search in input + local search box
  const filteredList = useMemo(() => {
    const all = pannaMeta.list;
    // Use last token from digit input for auto-filter if no manual search
    const tokens = splitEntries(digit);
    const lastToken = tokens.length ? tokens[tokens.length - 1] : "";
    
    const filterText = search.trim() || lastToken;
    
    if (!filterText) return all;
    
    return all.filter((p) => p.includes(filterText));
  }, [pannaMeta.list, digit, search]);

  const displayList = showAll ? filteredList : filteredList.slice(0, 30);

  const handleSelect = (panna) => {
    if (isBulk) {
      const entries = splitEntries(digit);
      if (entries.includes(panna)) {
        // Remove if already selected
        const newEntries = entries.filter((e) => e !== panna);
        setDigit(newEntries.join(", "));
        return;
      }
      // If last token is partial (1-2 chars) and we filtered, replace it
      const tokens = splitEntries(digit);
      const last = tokens[tokens.length - 1] || "";
      if (last && last.length < 3 && panna.includes(last) && !pannaMeta.list.includes(last)) {
        tokens[tokens.length - 1] = panna;
        setDigit(tokens.join(", "));
      } else {
        const newValue = tokens.length ? `${tokens.join(", ")}, ${panna}` : panna;
        setDigit(newValue);
      }
    } else {
      setDigit(panna);
    }
  };

  const selectedEntries = useMemo(() => splitEntries(digit), [digit]);

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: pannaMeta.color }} />
          <span className="text-sm font-semibold text-white">
            {pannaMeta.label} Suggestions
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {filteredList.length}/{pannaMeta.count}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isBulk && selectedEntries.length > 0 && (
            <span className="text-[11px] text-emerald-300 font-medium">
              {selectedEntries.length} selected
            </span>
          )}
          <button
            type="button"
            onClick={() => setDigit("")}
            className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${pannaMeta.label} e.g. 12...`}
            value={search}
            onChange={(e) => setSearch(e.target.value.replace(/\D/g, "").slice(0,3))}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>
        {isBulk && (
          <p className="text-[11px] text-gray-400 mt-1.5 px-1">
            Tip: Click panna to add. Click again to remove. Type to filter.
          </p>
        )}
      </div>

      {/* Selected Preview for Bulk */}
      {isBulk && selectedEntries.length > 0 && (
        <div className="px-3 py-2 bg-emerald-950/30 border-b border-white/5">
          <div className="flex flex-wrap gap-1.5">
            {selectedEntries.map((entry, idx) => (
              <span
                key={`${entry}-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/30 text-[11px] text-emerald-200"
              >
                {entry}
                <button
                  type="button"
                  onClick={() => {
                    const newEntries = selectedEntries.filter((_, i) => i !== idx);
                    setDigit(newEntries.join(", "));
                  }}
                  className="ml-1 hover:text-white"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="p-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
        {displayList.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            No panna found for &quot;{search || splitEntries(digit).pop()}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {displayList.map((panna) => {
              const isSelected = selectedEntries.includes(panna);
              return (
                <button
                  key={panna}
                  type="button"
                  onClick={() => handleSelect(panna)}
                  className={`relative group px-2 py-2.5 rounded-lg text-sm font-mono font-semibold transition-all duration-150 border
                    ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
                    }
                  `}
                >
                  {panna}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 text-[9px] flex items-center justify-center text-black font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-white/[0.03] border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {isBulk ? "Bulk mode - select multiple" : "Single mode - click to fill"} • Source: matkabook.com
        </span>
        {filteredList.length > 30 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
          >
            {showAll ? `Show Less` : `Show All ${filteredList.length}`}
          </button>
        )}
      </div>
    </div>
  );
};

// ======================= MAIN =======================
export default function MatkaGame() {
  const { marketId, gameId } = useParams();
  const gameType = useMemo(() => slugToGameType(gameId), [gameId]);
  const displayGame = prettyName(gameId);
  const inputHelp = inputHelpByGame[gameType] || {
    label: "Digit / Panna",
    placeholder: "Enter Digit",
  };

  // Market info
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  // Form
  const [session, setSession] = useState("open");
  const [points, setPoints] = useState("");

  // Digit fields
  const [digit, setDigit] = useState("");
  const [openPanna, setOpenPanna] = useState("");
  const [closePanna, setClosePanna] = useState("");
  const [openDigit, setOpenDigit] = useState("");
  const [closeDigit, setCloseDigit] = useState("");

  const [msg, setMsg] = useState(null);
  const token = localStorage.getItem("accessToken");

  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Panna suggestion meta
  const pannaMeta = useMemo(() => getPannaListByGameType(gameType), [gameType]);

  // ======================= FETCH MARKET =======================
  const fetchMarket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/market`, {
        headers: authHeader,
      });

      const list = res.data.data;
      const found = list.find((m) => m._id?.$oid === marketId);

      setMarket(found || null);
    } catch {
      setMarket(null);
    }
    setLoading(false);
  }, [marketId, authHeader]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // ======================= ASSEMBLE SANGAM =======================
  const assembledDigit = () => {
    if (HALF_SANGAM_GAMES.has(gameType)) {
      if (openPanna && closeDigit) return `${openPanna}-${closeDigit}`;
      if (closePanna && openDigit) return `${closePanna}-${openDigit}`;
      return digit;
    }
    if (gameType === "full_sangam") {
      if (openPanna && closePanna) return `${openPanna}-${closePanna}`;
      return digit;
    }
    return digit;
  };

  function getISTISOString() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    return istTime.toISOString().replace("Z", "+05:30");
  }

  const marketPlayable = isMarketPlayable(market, now);

  // ======================= PLACE BID =======================
  const placeBid = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      if (!marketPlayable) throw new Error("Market Closed. Play is disabled after close time.");

      if (!points || Number(points) <= 0)
        throw new Error("Points must be greater than 0");

      const finalDigit = assembledDigit();
      validateDigitFrontend(gameType, finalDigit);

      const payload = {
        market_id: marketId,
        game_type: gameType,
        session,
        points: Number(points),
      };

      if (gameType === "full_sangam") {
        const [o, c] = finalDigit.split("-");
        payload.open_panna = o;
        payload.close_panna = c;
      } else if (gameType === "half_sangam") {
        if (openPanna && closeDigit) {
          payload.open_panna = openPanna;
          payload.close_digit = closeDigit;
        } else if (closePanna && openDigit) {
          payload.close_panna = closePanna;
          payload.open_digit = openDigit;
        } else {
          payload.digit = finalDigit;
        }
      } else if (HALF_SANGAM_GAMES.has(gameType)) {
        payload.digit = finalDigit;
      } else {
        payload.digit = finalDigit;
      }

      const res = await axios.post(
        `${API_BASE}/user/bid/place`,
        {},
        {
          params: payload,
          headers: authHeader,
        }
      );

      setMsg({ type: "success", text: "Bid placed successfully!" });

      setDigit("");
      setOpenPanna("");
      setClosePanna("");
      setOpenDigit("");
      setCloseDigit("");
      setPoints("");
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || "Bid failed.";
      setMsg({ type: "error", text: errMsg });
    }
  };

  // ======================= UI =======================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader className="animate-spin" /> Loading...
      </div>
    );

  if (!market)
    return <div className="text-center text-red-400 p-6">Market Not Found</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen text-white pb-10">
      <div className="w-full relative bg-gradient-to-b from-black to-black/0 py-2 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="p-2 pl-4 z-10 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-md z-0 w-full absolute justify-between font-bold bg-gradient-to-b from-black to-black/0 px-4 py-2 flex justify-center items-center gap-2">
          <span className="flex gap-2 items-center uppercase">
            {market.name} — {displayGame}
          </span>
        </h2>
        <a className="pr-4 z-10"></a>
      </div>
      <p className="text-xs bg-white/5 flex justify-between px-3 py-3 rounded-b-lg text-gray-300 mb-4">
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
            className={`${
              marketPlayable ? "text-green-400" : "text-red-400"
            }`}
          >
            {marketPlayable ? "Market Running" : "Market Closed"}
          </span>
        </span>
      </p>

      <Message type={msg?.type} text={msg?.text} />

      {!marketPlayable && (
        <div className="mx-3 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          Market Closed. Play is disabled after close time.
        </div>
      )}

      <form
        onSubmit={placeBid}
        className={`bg-white/5 p-4 mx-3 mt-3 rounded-lg border border-gray-800 ${
          !marketPlayable ? "opacity-75" : ""
        }`}
      >
        {/* SESSION */}
        <div className="mb-3 text-sm text-gray-300">
          <label className="mr-3">
            <input
              type="radio"
              value="open"
              checked={session === "open"}
              onChange={() => setSession("open")}
              className="accent-purple-600 mr-1"
            />
            Open
          </label>

          {market.marketType !== "Starline" ? (
            <label className="ml-3">
              <input
                type="radio"
                value="close"
                checked={session === "close"}
                onChange={() => setSession("close")}
                className="accent-purple-600 mr-1"
              />
              Close
            </label>
          ) : (
            ""
          )}
        </div>

        {/* DIGIT INPUTS */}
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">
            {inputHelp.label}
          </label>

          {/* HALF SANGAM */}
          {HALF_SANGAM_GAMES.has(gameType) && (
            <>
              {gameType !== "half_sangam_b" && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    placeholder="Open Panna (123)"
                    value={openPanna}
                    onChange={(e) =>
                      setOpenPanna(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    className="p-2 bg-black/30 rounded border text-white"
                  />
                  <input
                    placeholder="Close Digit (4)"
                    value={closeDigit}
                    onChange={(e) =>
                      setCloseDigit(e.target.value.replace(/\D/g, "").slice(0, 1))
                    }
                    className="p-2 bg-black/30 rounded border text-white"
                  />
                </div>
              )}

              {gameType !== "half_sangam_a" && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    placeholder="Close Panna (123)"
                    value={closePanna}
                    onChange={(e) =>
                      setClosePanna(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    className="p-2 bg-black/30 rounded border text-white"
                  />
                  <input
                    placeholder="Open Digit (4)"
                    value={openDigit}
                    onChange={(e) =>
                      setOpenDigit(e.target.value.replace(/\D/g, "").slice(0, 1))
                    }
                    className="p-2 bg-black/30 rounded border text-white"
                  />
                </div>
              )}

              <input
                placeholder="OR Combined (123-4)"
                value={digit}
                onChange={(e) =>
                  setDigit(e.target.value.replace(/[^\d-]/g, ""))
                }
                className="p-2 bg-black/30 rounded border w-full text-white"
              />
            </>
          )}

          {/* FULL SANGAM */}
          {gameType === "full_sangam" && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  placeholder="Open Panna (123)"
                  value={openPanna}
                  onChange={(e) =>
                    setOpenPanna(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  className="p-2 bg-black/30 rounded border text-white"
                />

                <input
                  placeholder="Close Panna (456)"
                  value={closePanna}
                  onChange={(e) =>
                    setClosePanna(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  className="p-2 bg-black/30 rounded border text-white"
                />
              </div>

              <input
                placeholder="OR Combined (123-456)"
                value={digit}
                onChange={(e) =>
                  setDigit(e.target.value.replace(/[^\d-]/g, ""))
                }
                className="p-2 bg-black/30 rounded border w-full text-white"
              />
            </>
          )}

          {/* NORMAL GAMES */}
          {!HALF_SANGAM_GAMES.has(gameType) && gameType !== "full_sangam" && (
            <>
              <input
                placeholder={inputHelp.placeholder}
                value={digit}
                onChange={(e) =>
                  setDigit(
                    e.target.value.replace(
                      inputHelp.allowList ? /[^\d,\s]/g : /\D/g,
                      ""
                    )
                  )
                }
                className="p-2 bg-black/30 rounded border w-full text-white focus:border-purple-500/50 focus:outline-none"
              />
              
              {/* PANNA SUGGESTION BOX - Only for SP/DP/TP */}
              {pannaMeta && (
                <PannaSuggestionBox
                  pannaMeta={pannaMeta}
                  digit={digit}
                  setDigit={setDigit}
                  gameType={gameType}
                />
              )}
            </>
          )}
        </div>

        {/* POINTS */}
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">Points</label>
          <input
            placeholder="Points"
            value={points}
            onChange={(e) => setPoints(e.target.value.replace(/\D/g, ""))}
            className="p-2 bg-black/30 rounded border w-full text-white focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <button
          disabled={!marketPlayable}
          className={`w-full py-3 rounded-lg font-semibold ${
            marketPlayable
              ? "bg-gradient-to-r from-purple-700 to-purple-900"
              : "bg-slate-300 text-slate-600 cursor-not-allowed"
          }`}
        >
          {marketPlayable ? "Place Bid" : "Market Closed"}
        </button>
      </form>
    </div>
  );
}
