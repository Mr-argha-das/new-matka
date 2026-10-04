import React, { useState, useEffect, useCallback } from "react";
import { Wallet, WalletCards, Star, Trophy } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { API_URL, SUPPORT_PHONE } from "../config";
import axios from "axios";
import MarketList from "./Client/MarketList";
import { fetchSiteData } from "../components/layout/fetchSiteData";
import NotificationModal from "../components/layout/NotificationModal";

export default function Dashboard() {
  const token = localStorage.getItem("accessToken");
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) window.location.href = "/login";
  }, [token]);

  const displayDigit = (v) => (!v || v === "-" ? "X" : v);
  const displayPanna = (v) => (!v || v === "-" ? "XXX" : v);

  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/user/markets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.data.map((m) => {
        const today = m.today_result || {};
        return {
          id: m._id?.$oid,
          name: m.name,
          openTime: m.open_time,
          closeTime: m.close_time,
          status: m.status,
          result: m.final_result || "xxx-x-xxx",
          open_digit: displayDigit(today.open_digit),
          close_digit: displayDigit(today.close_digit),
          open_panna: displayPanna(today.open_panna),
          close_panna: displayPanna(today.close_panna),
        };
      });
      setMarkets(list);
    } catch (err) {
      setError("Failed to load markets");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMarkets(); }, [fetchMarkets]);

  const [site, setSite] = useState(null);
  useEffect(() => {
    (async () => {
      const data = await fetchSiteData();
      setSite(data);
    })();
  }, []);

  const [siteData, setSiteData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/sitedata/get`);
        setSiteData(res.data);
        const alreadyShown = localStorage.getItem("notice_shown");
        if (res.data.notice_board_html && !alreadyShown) setShowModal(true);
      } catch {}
    };
    fetchData();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem("notice_shown", "true");
  };

  return (
    <div className="font-sans bg-white min-h-screen text-black">
      <div className="flex flex-col max-w-md mx-auto min-h-screen bg-white">
        {/* Top Action Bar - White with blue buttons */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3 items-center">
            <a href="/add-points" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E8F1FF] hover:bg-[#D6E6FF] px-4 py-2.5 text-sm font-bold text-black transition">
              <Wallet size={18} className="text-[#0D3FB2]" /> Add Funds
            </a>
            <a href="/withdrawal-request" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E8F1FF] hover:bg-[#D6E6FF] px-4 py-2.5 text-sm font-bold text-black transition">
              <WalletCards size={18} className="text-[#0D3FB2]" /> Withdraw
            </a>
          </div>

          <div className="mt-3 w-full overflow-hidden rounded-full bg-[#E8F1FF] border border-blue-200 p-2 text-center">
            <p className="text-sm text-[#0A3796] font-medium animate-marquee whitespace-nowrap">
              {site?.dashboard_notification_line ||
                "✨ Welcome to Sridevimatka — India's most trusted online matka platform! Fast withdrawal • Best rates • 24x7 support ✨"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full mt-3">
            <a href={`/starline`} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E8F1FF] hover:bg-[#D6E6FF] px-4 py-2.5 text-sm font-bold text-black transition">
              <Star size={18} className="text-[#FBBF24]" fill="#FBBF24" /> Starline
            </a>
            <a href={`/jackpot-play`} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E8F1FF] hover:bg-[#D6E6FF] px-4 py-2.5 text-sm font-bold text-black transition">
              <Trophy size={18} className="text-[#1565D8]" /> Jackpot
            </a>
            <a href={`https://wa.me/${SUPPORT_PHONE}`} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E8F1FF] hover:bg-[#D6E6FF] px-4 py-2.5 text-sm font-bold text-black transition">
              <BsWhatsapp size={18} className="text-[#25D366]" /> Whatsapp
            </a>
          </div>
        </div>

        <main className="flex-1 px-3 py-3 pb-24 bg-[#F2F7FF]">
          {isLoading && <p className="text-center text-gray-500 py-10">Loading markets...</p>}
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">{error}</div>}
          {!isLoading && !error && <MarketList markets={markets} />}
        </main>
      </div>

      {showModal && <NotificationModal html={siteData?.notice_board_html} onClose={handleClose} />}
    </div>
  );
}
