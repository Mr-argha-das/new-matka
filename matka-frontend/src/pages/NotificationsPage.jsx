import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ArrowLeft, Bell, BellOff, Clock } from "lucide-react";
import { API_URL } from "../config";

export default function NotificationsPage() {
  const token = localStorage.getItem("accessToken");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      // 1) personal notifications (admin -> specific user)
      let personal = [];
      try {
        const res = await axios.get(`${API_URL}/user/notifications`, authHeader);
        personal = res.data.notifications || [];
      } catch {}

      // 2) general/broadcast notifications (admin Notification List)
      let general = [];
      try {
        const res2 = await axios.get(`${API_URL}/notifications/all`);
        const seenAt = localStorage.getItem("generalNotifSeenAt") || "";
        general = (Array.isArray(res2.data) ? res2.data : []).map((n) => ({
          id: `gen-${n.id}`,
          title: "Announcement",
          message: n.title,
          created_at: n.created_at,
          is_read: seenAt ? new Date((n.created_at || "").endsWith("Z") ? n.created_at : n.created_at + "Z") <= new Date(seenAt) : false,
        }));
      } catch {}

      const all = [...personal, ...general].sort((a, b) => {
        const da = new Date((a.created_at || "").endsWith("Z") ? a.created_at : (a.created_at || "") + "Z");
        const db = new Date((b.created_at || "").endsWith("Z") ? b.created_at : (b.created_at || "") + "Z");
        return db - da;
      });
      setItems(all);

      // mark all as read after viewing
      axios.post(`${API_URL}/user/notifications/mark-read`, {}, authHeader).catch(() => {});
      localStorage.setItem("generalNotifSeenAt", new Date().toISOString());
    } catch {} finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };
  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-[#2E7BF6] to-[#0D3FB2] flex items-center px-3 py-3 shadow-md">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/20 text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10 flex items-center justify-center gap-2">
          <Bell size={20} /> Notifications
        </h2>
      </div>

      <div className="flex-1 px-4 py-4 pb-24 bg-[#F2F7FF]">
        {loading && <p className="text-center text-gray-500 py-12">Loading notifications...</p>}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BellOff size={48} className="mb-3" />
            <p className="font-semibold">Koi notification nahi hai</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(13,63,178,0.08)] border ${n.is_read ? "border-[#E5E7EB]" : "border-[#93C5FD]"}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2E7BF6] to-[#1565D8] text-white shadow-[0_2px_8px_rgba(21,101,216,0.3)]">
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14px] font-bold text-[#0A1F44] truncate">{n.title || "Notification"}</h3>
                    {!n.is_read && <span className="shrink-0 rounded-full bg-[#E8F1FF] px-2 py-0.5 text-[10px] font-bold text-[#1565D8]">NEW</span>}
                  </div>
                  <p className="mt-1 text-[13px] text-gray-600 whitespace-pre-wrap">{n.message}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={12} /> {fmtDate(n.created_at)} • {fmtTime(n.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
