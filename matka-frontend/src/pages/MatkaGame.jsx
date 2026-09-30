// src/pages/MatkaGame.jsx - Final Orange Theme + SP DP TP checkbox + Two Digit Pana 2 digits + SP Common 0-9 buttons + Odd Even radio
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader, ArrowLeft } from "lucide-react";
import { API_URL } from "../config";
import { isMarketPlayable } from "../utils/marketTime";
import { getPannaListByGameType } from "../utils/pannaLists";

const API_BASE = `${API_URL}`;

const slugToGameType = (slug = "") => {
  const s = slug.toLowerCase().replace(/[(),]/g, "").replace(/-/g, "_");
  if (["single_digit", "single"].includes(s)) return "single";
  if (["single_bulk_digit", "single_digit_bulk"].includes(s)) return "single_bulk";
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

const prettyName = (slug = "") => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const splitEntries = (value = "") => value.trim().split(/[\s,]+/).filter(Boolean);

const SINGLE_GAMES = new Set(["single", "single_bulk"]);
const JODI_GAMES = new Set(["jodi","jodi_bulk","red_jodi","digit_based_jodi","cycle_jodi","jodi_family"]);
const PANNA_GAMES = new Set(["single_panna","single_panna_bulk","double_panna","double_panna_bulk","triple_panna","sp","dp","tp","pana_family"]);
const TWO_DIGIT_PANA_GAMES = new Set(["two_digit_pana"]);
const MOTOR_GAMES = new Set(["sp_motor","dp_motor"]);
const SP_DP_TP_GAMES = new Set(["sp_dp_tp"]);
const SP_COMMON_GAMES = new Set(["sp_common","dp_common"]);
const ODD_EVEN_GAMES = new Set(["odd_even"]);
const HALF_SANGAM_GAMES = new Set(["half_sangam","half_sangam_a","half_sangam_b"]);
const BULK_GAMES = new Set(["single_bulk","jodi_bulk","single_panna_bulk","double_panna_bulk"]);

const inputHelpByGame = {
  single: { label: "Single Digit", placeholder: "Enter 0-9" },
  single_bulk: { label: "Single Bulk Digit", placeholder: "0, 1, 2", allowList: true },
  jodi: { label: "Jodi Digit", placeholder: "Enter 2 digits" },
  jodi_bulk: { label: "Jodi Digit Bulk", placeholder: "12, 34, 56", allowList: true },
  single_panna: { label: "Single Panna", placeholder: "Type any number e.g. 1" },
  single_panna_bulk: { label: "Single Panna Bulk", placeholder: "Type 1, then select", allowList: true },
  double_panna: { label: "Double Panna", placeholder: "Type any number e.g. 1" },
  double_panna_bulk: { label: "Double Panna Bulk", placeholder: "Type 1, then select", allowList: true },
  triple_panna: { label: "Triple Panna", placeholder: "Type any number e.g. 1" },
  dp_motor: { label: "DP Motor", placeholder: "Unique digits e.g. 1234567890 (1-10, no repeat)", allowList: false },
  sp_motor: { label: "SP Motor", placeholder: "Unique digits e.g. 1234567890 (1-10, no repeat)", allowList: false },
  sp_dp_tp: { label: "SP DP TP - Single Digit", placeholder: "Enter single digit 0-9", allowList: false },
  two_digit_pana: { label: "Two Digit Pana - Only 2 Digits", placeholder: "12, 32, 34", allowList: true },
  sp_common: { label: "SP Common - Click Digit", placeholder: "Click 0-9 button", allowList: false },
  odd_even: { label: "Odd Even - Choose Odd or Even", placeholder: "odd / even", allowList: false },
  dp_common: { label: "DP Common - Click Digit", placeholder: "Click 0-9 button", allowList: false },
  red_jodi: { label: "Red Jodi", placeholder: "05, 16", allowList: true },
  pana_family: { label: "Pana Family", placeholder: "123, 456", allowList: true },
  digit_based_jodi: { label: "Digit Based Jodi", placeholder: "12, 23, 34", allowList: true },
  cycle_jodi: { label: "Cycle Jodi", placeholder: "12, 24, 48", allowList: true },
  jodi_family: { label: "Jodi Family", placeholder: "12, 21, 34", allowList: true },
};

function extractMotorDigitsFrontend(value) {
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.includes(",") || trimmed.includes(" ")) {
    const parts = splitEntries(trimmed);
    const digits = [];
    for (const p of parts) {
      if (/^\d$/.test(p)) digits.push(p);
      else if (/^\d+$/.test(p)) digits.push(...p.split(""));
      else return null;
    }
    return digits;
  } else {
    if (!/^\d+$/.test(trimmed)) return null;
    return trimmed.split("");
  }
}

function validateDigitFrontend(game_type, digit) {
  if (!digit) throw new Error("Digit / panna is required.");
  const entries = splitEntries(digit);
  if (SINGLE_GAMES.has(game_type) && entries.some((e) => !/^\d$/.test(e))) throw new Error("Single entries must be exactly 1 digit.");
  if (JODI_GAMES.has(game_type) && entries.some((e) => !/^\d{2}$/.test(e))) throw new Error("Jodi entries must be exactly 2 digits.");
  if (MOTOR_GAMES.has(game_type)) {
    const motorDigits = extractMotorDigitsFrontend(digit);
    if (motorDigits === null) throw new Error("Motor: Only digits 0-9 allowed");
    if (motorDigits.length < 1 || motorDigits.length > 10) throw new Error("Motor: Length must be 1 to 10 digits");
    if (motorDigits.length !== new Set(motorDigits).size) throw new Error("Motor: Duplicate digits not allowed. 1234567890 valid, 1123456789 invalid");
    return;
  }
  if (SP_DP_TP_GAMES.has(game_type)) {
    const clean = digit.includes("|") ? digit.split("|")[0] : digit;
    if (!/^\d$/.test(clean)) throw new Error("SP DP TP: Enter only one digit 0-9");
    return;
  }
  if (TWO_DIGIT_PANA_GAMES.has(game_type) && entries.some((e) => !/^\d{2}$/.test(e))) throw new Error("Two Digit Pana: Enter exactly 2 digits like 12, 32, 34");
  if (SP_COMMON_GAMES.has(game_type) && entries.some((e) => !/^\d$/.test(e))) throw new Error("SP/DP Common: Enter single digit 0-9");
  if (ODD_EVEN_GAMES.has(game_type) && (entries.length !== 1 || !["odd","even"].includes(entries[0].toLowerCase()))) throw new Error("Odd Even: Choose odd or even");
  if (PANNA_GAMES.has(game_type) && entries.some((e) => !/^\d{3}$/.test(e))) throw new Error("Panna entries must be exactly 3 digits.");
  if (HALF_SANGAM_GAMES.has(game_type) && !/^\d{3}-\d$/.test(digit)) throw new Error("Half Sangam must be in format 123-4");
  if (game_type === "full_sangam" && !/^\d{3}-\d{3}$/.test(digit)) throw new Error("Full Sangam must be in format 123-456");
}

const Message = ({ type, text }) => {
  if (!text) return null;
  return (
    <div className={`p-3 mx-3 rounded-lg mb-4 flex items-center gap-3 text-sm ${type === "success" ? "bg-green-50 border border-green-200 text-green-700" : type === "error" ? "bg-red-50 border border-red-200 text-red-600" : "bg-orange-50 border border-orange-200 text-orange-700"}`}>
      {type === "success" && <CheckCircle size={18} />} {type === "error" && <XCircle size={18} />} {type === "info" && <Loader className="animate-spin" size={18} />} {text}
    </div>
  );
};

const PannaSuggestions = ({ pannaMeta, digit, setDigit, gameType }) => {
  const isBulk = BULK_GAMES.has(gameType);
  const currentToken = useMemo(() => {
    const tokens = splitEntries(digit);
    if (isBulk) {
      if (digit.endsWith(",") || digit.endsWith(" ") || digit.endsWith(", ")) return "";
      return tokens.length ? tokens[tokens.length - 1] : "";
    }
    return digit.trim();
  }, [digit, isBulk]);
  const filtered = useMemo(() => {
    if (!currentToken) return [];
    return pannaMeta.list.filter((p) => p.includes(currentToken)).slice(0, 20);
  }, [pannaMeta.list, currentToken]);
  if (!currentToken || filtered.length === 0) return null;
  const handleSelect = (panna) => {
    if (isBulk) {
      const tokens = splitEntries(digit);
      if (tokens.length && tokens[tokens.length - 1] === currentToken && currentToken.length < 3) {
        tokens[tokens.length - 1] = panna;
        setDigit(tokens.join(", ") + ", ");
      } else if (tokens.includes(panna)) return;
      else {
        const base = tokens.length ? tokens.join(", ") + ", " : "";
        setDigit(base + panna + ", ");
      }
    } else setDigit(panna);
  };
  return (
    <div className="mt-2">
      <div className="text-[11px] text-gray-500 mb-1.5 px-1">Suggestions for "{currentToken}" - {filtered.length} found:</div>
      <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-[#F5F5F5] border border-gray-200">
        {filtered.map((panna) => (
          <button key={panna} type="button" onClick={() => handleSelect(panna)} className="px-3 py-1.5 rounded-full text-sm font-mono bg-white border border-gray-200 hover:bg-[#FF9800] hover:text-white hover:border-[#FF9800] text-black transition">{panna}</button>
        ))}
      </div>
    </div>
  );
};

const MotorSuggestions = ({ digit, setDigit }) => {
  const digits = useMemo(() => extractMotorDigitsFrontend(digit) || [], [digit]);
  const remaining = useMemo(() => ["0","1","2","3","4","5","6","7","8","9"].filter(d => !digits.includes(d)), [digits]);
  if (digit.length === 0) return null;
  return (
    <div className="mt-2">
      <div className="text-[11px] text-gray-500 mb-1.5 px-1">{digits.length}/10 Unique: {digits.join("") || "none"} - No repeat.</div>
      <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-[#F5F5F5] border border-gray-200">
        {remaining.slice(0,10).map((d) => (
          <button key={d} type="button" onClick={() => {
            if (digits.length >= 10) return;
            setDigit((prev) => {
              const cleaned = prev.replace(/[^0-9]/g, "");
              return [...new Set((cleaned + d).split(""))].join("").slice(0,10);
            });
          }} className="px-3 py-1.5 rounded-full text-sm font-mono bg-white border border-gray-200 hover:bg-[#00A651] hover:text-white text-black transition">{d}</button>
        ))}
        <button type="button" onClick={() => setDigit("")} className="px-3 py-1.5 rounded-full text-xs bg-red-50 border border-red-200 text-red-600 hover:bg-red-100">Clear</button>
      </div>
    </div>
  );
};

const SpDpTpSelector = ({ selected, setSelected }) => {
  const options = [
    { id: "sp", label: "SP", desc: "Single Pana", color: "bg-orange-500" },
    { id: "dp", label: "DP", desc: "Double Pana", color: "bg-green-500" },
    { id: "tp", label: "TP", desc: "Triple Pana", color: "bg-yellow-500" },
  ];
  const toggle = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedList = Object.keys(selected).filter(k => selected[k]);
  return (
    <div className="mt-3 p-3 rounded-xl bg-[#F5F5F5] border border-gray-200">
      <div className="text-sm font-bold text-black mb-2">Choose Pana Type (Checkbox):</div>
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => (
          <label key={opt.id} className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition ${selected[opt.id] ? "bg-[#FFF3E0] border-[#FF9800] text-black" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
            <input type="checkbox" checked={selected[opt.id]} onChange={() => toggle(opt.id)} className="absolute top-2 right-2 accent-[#FF8C00]" />
            <div className={`h-8 w-8 rounded-full ${opt.color} flex items-center justify-center font-bold text-sm text-white`}>{opt.label}</div>
            <span className="text-xs font-bold">{opt.label}</span>
            <span className="text-[10px]">{opt.desc}</span>
          </label>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-gray-500">Selected: {selectedList.length ? selectedList.join(", ").toUpperCase() : "None"} - Can select multiple</div>
    </div>
  );
};

const SpCommonDigitButtons = ({ onDigitClick, points }) => {
  const digits = ["1","2","3","4","5","6","7","8","9","0"];
  return (
    <div className="mt-3">
      <div className="text-sm font-bold text-black mb-3">Select Digit (0-9) - Click to Bid:</div>
      <div className="grid grid-cols-3 gap-3">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDigitClick(d)}
            className="h-[56px] rounded-[14px] bg-[#E0E0E0] hover:bg-[#FF9800] hover:text-white active:scale-95 text-black font-bold text-[20px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-[#FF9800]"
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-gray-500 text-center">
        {points ? `Points: ${points} - Click any digit 0-9 to place bid` : "Enter Points above, then click digit 0-9 to bid"}
      </div>
    </div>
  );
};

const OddEvenSelector = ({ selected, setSelected }) => {
  return (
    <div className="mt-3">
      <div className="text-sm font-bold text-black mb-3">Choose Odd or Even (Radio):</div>
      <div className="grid grid-cols-2 gap-4">
        <label className={`relative flex flex-col items-center gap-2 p-5 rounded-[16px] border-2 cursor-pointer transition-all ${selected === "odd" ? "bg-[#FFF3E0] border-[#FF9800] shadow-md" : "bg-[#E0E0E0] border-gray-200 hover:bg-[#D5D5D5]"}`}>
          <input type="radio" name="odd_even" value="odd" checked={selected === "odd"} onChange={() => setSelected("odd")} className="absolute top-3 right-3 accent-[#FF8C00] w-5 h-5" />
          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${selected === "odd" ? "bg-[#FF9800] text-white" : "bg-white text-black"}`}>O</div>
          <span className="text-[16px] font-bold text-black">ODD</span>
          <span className="text-[11px] text-gray-600">1,3,5,7,9</span>
        </label>
        <label className={`relative flex flex-col items-center gap-2 p-5 rounded-[16px] border-2 cursor-pointer transition-all ${selected === "even" ? "bg-[#E8F5E9] border-[#00A651] shadow-md" : "bg-[#E0E0E0] border-gray-200 hover:bg-[#D5D5D5]"}`}>
          <input type="radio" name="odd_even" value="even" checked={selected === "even"} onChange={() => setSelected("even")} className="absolute top-3 right-3 accent-[#00A651] w-5 h-5" />
          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${selected === "even" ? "bg-[#00A651] text-white" : "bg-white text-black"}`}>E</div>
          <span className="text-[16px] font-bold text-black">EVEN</span>
          <span className="text-[11px] text-gray-600">0,2,4,6,8</span>
        </label>
      </div>
    </div>
  );
};

export default function MatkaGame() {
  const { marketId, gameId } = useParams();
  const gameType = useMemo(() => slugToGameType(gameId), [gameId]);
  const displayGame = prettyName(gameId);
  const inputHelp = inputHelpByGame[gameType] || { label: "Digit / Panna", placeholder: "Enter Digit" };

  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [session, setSession] = useState("open");
  const [points, setPoints] = useState("");
  const [digit, setDigit] = useState("");
  const [openPanna, setOpenPanna] = useState("");
  const [closePanna, setClosePanna] = useState("");
  const [openDigit, setOpenDigit] = useState("");
  const [closeDigit, setCloseDigit] = useState("");
  const [msg, setMsg] = useState(null);
  const [spDpTpSelected, setSpDpTpSelected] = useState({ sp: false, dp: false, tp: false });
  const [oddEvenSelected, setOddEvenSelected] = useState("");
  const token = localStorage.getItem("accessToken");
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const pannaMeta = useMemo(() => getPannaListByGameType(gameType), [gameType]);

  const fetchMarket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/market`, { headers: authHeader });
      const list = res.data.data;
      const found = list.find((m) => m._id?.$oid === marketId);
      setMarket(found || null);
    } catch { setMarket(null); }
    setLoading(false);
  }, [marketId, authHeader]);

  useEffect(() => { fetchMarket(); }, [fetchMarket]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);

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
    if (SP_DP_TP_GAMES.has(gameType)) {
      const selected = Object.keys(spDpTpSelected).filter(k => spDpTpSelected[k]);
      if (selected.length === 0) return digit;
      return `${digit}|${selected.join(",")}`;
    }
    if (ODD_EVEN_GAMES.has(gameType)) {
      return oddEvenSelected;
    }
    return digit;
  };

  const marketPlayable = isMarketPlayable(market, now);

  const handleMotorInput = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    const unique = [];
    const seen = new Set();
    for (const ch of cleaned) {
      if (!seen.has(ch)) { seen.add(ch); unique.push(ch); }
    }
    setDigit(unique.join("").slice(0,10));
  };

  const placeBid = async (e, overrideDigit) => {
    if (e) e.preventDefault();
    setMsg(null);
    try {
      if (!marketPlayable) throw new Error("Market Closed");
      if (!points || Number(points) <= 0) throw new Error("Points must be greater than 0 - Enter points first");
      if (SP_DP_TP_GAMES.has(gameType)) {
        const selected = Object.keys(spDpTpSelected).filter(k => spDpTpSelected[k]);
        if (selected.length === 0) throw new Error("Select at least one: SP, DP, TP");
        if (!/^\d$/.test(overrideDigit || digit)) throw new Error("SP DP TP: Enter only one digit 0-9");
      }
      if (ODD_EVEN_GAMES.has(gameType)) {
        if (!oddEvenSelected) throw new Error("Odd Even: Choose odd or even");
      }
      const finalDigit = overrideDigit ? overrideDigit : assembledDigit();
      validateDigitFrontend(gameType, finalDigit);
      const payload = { market_id: marketId, game_type: gameType, session, points: Number(points), digit: finalDigit };
      if (gameType === "full_sangam") {
        const [o, c] = finalDigit.split("-");
        payload.open_panna = o; payload.close_panna = c; delete payload.digit;
      } else if (HALF_SANGAM_GAMES.has(gameType)) {
        if (openPanna && closeDigit) { payload.open_panna = openPanna; payload.close_digit = closeDigit; delete payload.digit; }
        else if (closePanna && openDigit) { payload.close_panna = closePanna; payload.open_digit = openDigit; delete payload.digit; }
      }
      await axios.post(`${API_BASE}/user/bid/place`, {}, { params: payload, headers: authHeader });
      setMsg({ type: "success", text: `Bid placed! ${gameType === "odd_even" ? oddEvenSelected.toUpperCase() : `Digit: ${finalDigit}`} Points: ${points}` });
      if (!overrideDigit) setDigit("");
      setOpenPanna(""); setClosePanna(""); setOpenDigit(""); setCloseDigit("");
      if (!SP_COMMON_GAMES.has(gameType) && !ODD_EVEN_GAMES.has(gameType)) setPoints("");
      setSpDpTpSelected({ sp: false, dp: false, tp: false });
      if (ODD_EVEN_GAMES.has(gameType)) { setOddEvenSelected(""); setPoints(""); }
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.detail || err.message || "Bid failed." });
    }
  };

  const handleSpCommonDigitClick = (d) => {
    placeBid(null, d);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-black"><Loader className="animate-spin" /> Loading...</div>;
  if (!market) return <div className="text-center text-red-600 p-6 bg-white min-h-screen">Market Not Found</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-black pb-10">
      <div className="w-full bg-[#FF9800] flex items-center px-3 py-3 shadow-md">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/20 text-white"><ArrowLeft size={22} /></button>
        <h2 className="flex-1 text-center text-[16px] font-bold text-white uppercase pr-10">{market.name} — {displayGame}</h2>
      </div>
      <div className="bg-[#F5F5F5] border-b border-gray-200 px-3 py-2.5 flex justify-between text-[12px]">
        <span className="flex flex-col"><span className="text-gray-500">Open:</span><span className="font-bold text-black">{market.open_time}</span></span>
        <span className="flex flex-col"><span className="text-gray-500">Close:</span><span className="font-bold text-black">{market.close_time}</span></span>
        <span className={`font-bold ${marketPlayable ? "text-green-600" : "text-red-600"}`}>{marketPlayable ? "Running" : "Closed"}</span>
      </div>
      <Message type={msg?.type} text={msg?.text} />
      <form onSubmit={placeBid} className="bg-white p-4 mx-3 mt-4 rounded-[16px] border border-gray-200 shadow-sm">
        <div className="mb-3 text-sm text-black">
          <label className="mr-4"><input type="radio" value="open" checked={session === "open"} onChange={() => setSession("open")} className="accent-[#FF8C00] mr-1.5" />Open</label>
          <label><input type="radio" value="close" checked={session === "close"} onChange={() => setSession("close")} className="accent-[#FF8C00] mr-1.5" />Close</label>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold text-black mb-1.5">{inputHelp.label}</label>
          {HALF_SANGAM_GAMES.has(gameType) && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Open Panna" value={openPanna} onChange={(e) => setOpenPanna(e.target.value.replace(/\D/g, "").slice(0,3))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
                <input placeholder="Close Digit" value={closeDigit} onChange={(e) => setCloseDigit(e.target.value.replace(/\D/g, "").slice(0,1))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Close Panna" value={closePanna} onChange={(e) => setClosePanna(e.target.value.replace(/\D/g, "").slice(0,3))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
                <input placeholder="Open Digit" value={openDigit} onChange={(e) => setOpenDigit(e.target.value.replace(/\D/g, "").slice(0,1))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
              </div>
              <input placeholder="OR Combined (123-4)" value={digit} onChange={(e) => setDigit(e.target.value.replace(/[^\d-]/g, ""))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
            </>
          )}
          {gameType === "full_sangam" && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Open Panna" value={openPanna} onChange={(e) => setOpenPanna(e.target.value.replace(/\D/g, "").slice(0,3))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
                <input placeholder="Close Panna" value={closePanna} onChange={(e) => setClosePanna(e.target.value.replace(/\D/g, "").slice(0,3))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
              </div>
              <input placeholder="OR Combined (123-456)" value={digit} onChange={(e) => setDigit(e.target.value.replace(/[^\d-]/g, ""))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
            </>
          )}
          {!HALF_SANGAM_GAMES.has(gameType) && gameType !== "full_sangam" && (
            <>
              {MOTOR_GAMES.has(gameType) ? (
                <>
                  <input placeholder={inputHelp.placeholder} value={digit} onChange={(e) => handleMotorInput(e.target.value)} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
                  <MotorSuggestions digit={digit} setDigit={setDigit} />
                </>
              ) : SP_DP_TP_GAMES.has(gameType) ? (
                <>
                  <SpDpTpSelector selected={spDpTpSelected} setSelected={setSpDpTpSelected} />
                  <div className="mt-3">
                    <input placeholder="Single digit 0-9 only" value={digit} onChange={(e) => setDigit(e.target.value.replace(/\D/g, "").slice(0,1))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black text-center text-lg font-bold focus:border-[#FF8C00] focus:outline-none" />
                    <div className="text-[11px] text-gray-500 mt-1">Only one digit (0-9). Choose SP/DP/TP above - can select multiple</div>
                  </div>
                </>
              ) : TWO_DIGIT_PANA_GAMES.has(gameType) ? (
                <>
                  <input placeholder="12, 32, 34" value={digit} onChange={(e) => setDigit(e.target.value.replace(/[^\d,\s]/g, ""))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
                  <div className="text-[11px] text-gray-500 mt-1">Only 2 digits per entry, e.g. 12, 32, 34 - separated by comma</div>
                </>
              ) : ODD_EVEN_GAMES.has(gameType) ? (
                <>
                  <div className="mb-2 text-[12px] text-gray-600 bg-[#FFF3E0] border border-orange-200 rounded-lg p-2.5">
                    <span className="font-bold text-[#E65100]">Odd Even:</span> Sirf Points field hoga aur 2 radio button Odd/Even - ek choose karo, points add karo, bid place ho jayegi
                  </div>
                  <OddEvenSelector selected={oddEvenSelected} setSelected={setOddEvenSelected} />
                </>
              ) : SP_COMMON_GAMES.has(gameType) ? (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-bold text-black mb-1.5">Points</label>
                    <input placeholder="Enter Points" value={points} onChange={(e) => setPoints(e.target.value.replace(/\D/g, ""))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none text-center text-lg font-bold" />
                  </div>
                  <div className="mb-2 text-[12px] text-gray-600 bg-[#FFF3E0] border border-orange-200 rounded-lg p-2.5">
                    <span className="font-bold text-[#E65100]">SP/DP Common:</span> Points enter karo, phir niche 0-9 me se kisi ek digit pe click karo - bid lag jayegi.
                  </div>
                  <SpCommonDigitButtons onDigitClick={handleSpCommonDigitClick} points={points} />
                </>
              ) : (
                <>
                  <input placeholder={inputHelp.placeholder} value={digit} onChange={(e) => setDigit(e.target.value.replace(inputHelp.allowList ? /[^\d,\s]/g : /\D/g, ""))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
                  {pannaMeta && <PannaSuggestions pannaMeta={pannaMeta} digit={digit} setDigit={setDigit} gameType={gameType} />}
                </>
              )}
            </>
          )}
        </div>
        {!SP_COMMON_GAMES.has(gameType) && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-bold text-black mb-1.5">Points</label>
              <input placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value.replace(/\D/g, ""))} className="p-2.5 bg-white rounded-xl border border-gray-300 w-full text-black focus:border-[#FF8C00] focus:outline-none" />
            </div>
            <button disabled={!marketPlayable} className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition ${marketPlayable ? "bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>{marketPlayable ? "Place Bid" : "Market Closed"}</button>
          </>
        )}
        {SP_COMMON_GAMES.has(gameType) && (
          <div className="text-center text-[11px] text-gray-500 mt-3">Points enter karke 0-9 button pe click karo, bid direct lag jayegi</div>
        )}
      </form>
    </div>
  );
}
