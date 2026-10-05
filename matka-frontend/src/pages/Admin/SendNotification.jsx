import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bell, Send, Trash2, Clock, Search } from "lucide-react";
import { API_URL } from "../../config";

export default function AdminSendNotification() {
  const token = (localStorage.getItem("adminAccessToken") || localStorage.getItem("accessToken"));
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [sent, setSent] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/users`, authHeader);
      const list = res.data.users || res.data.data || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      // fallback to old endpoint
      try {
        const res2 = await axios.get(`${API_URL}/admin/users`, authHeader);
        setUsers(res2.data.users || []);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSent = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/user-notifications`, authHeader);
      setSent(res.data.notifications || []);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchSent();
  }, [fetchUsers, fetchSent]);

  const getId = (u) => u?._id?.$oid || u?._id || u?.id;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.mobile || "").includes(q)
    );
  });

  const sendNotification = async () => {
    if (!selectedUser) {
      setMsg({ type: "error", text: "Pehle user select karo!" });
      return;
    }
    if (!message.trim()) {
      setMsg({ type: "error", text: "Message likhna zaroori hai!" });
      return;
    }
    setSending(true);
    setMsg(null);
    try {
      const res = await axios.post(
        `${API_URL}/admin/user-notifications/send`,
        { user_id: selectedUser, title: title.trim() || "Notification", message: message.trim() },
        authHeader
      );
      setMsg({ type: "success", text: res.data.message || "Notification sent!" });
      setMessage("");
      setTitle("");
      fetchSent();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.detail || "Send failed" });
    } finally {
      setSending(false);
    }
  };

  const deleteNotif = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await axios.delete(`${API_URL}/admin/user-notifications/${id}`, authHeader);
      setSent((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const fmt = (iso) =>
    iso
      ? new Date(iso.endsWith("Z") ? iso : iso + "Z").toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true,
        })
      : "";

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="text-blue-600" size={24} />
        <h1 className="text-xl font-bold">Send Notification to User</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-6xl">
        {/* ------- SEND FORM ------- */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select User</label>
          <div className="relative mb-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or mobile..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option value="">-- Choose User --</option>
            <option value="all">📢 All Users (sabko bhejo)</option>
            {filteredUsers.map((u) => (
              <option key={getId(u)} value={getId(u)}>
                {u.username} — {u.mobile}
              </option>
            ))}
          </select>

          <label className="block text-sm font-semibold text-slate-700 mt-4 mb-1.5">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder="Notification title..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <label className="block text-sm font-semibold text-slate-700 mt-4 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
            placeholder="Notification message likhe..."
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
          />
          <div className="text-right text-[11px] text-slate-400 mt-1">{message.length}/1000</div>

          {msg && (
            <div className={`mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-center ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {msg.text}
            </div>
          )}

          <button
            onClick={sendNotification}
            disabled={sending}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 py-3 font-bold text-white transition disabled:opacity-60"
          >
            <Send size={17} /> {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>

        {/* ------- SENT LIST ------- */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-3">
            Sent Notifications
            <span className="ml-2 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">{sent.length}</span>
          </h2>
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {sent.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">Abhi koi notification nahi bheja.</p>}
            {sent.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{n.title}</p>
                    <p className="text-[13px] text-slate-600 whitespace-pre-wrap">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      To: <span className="font-semibold">{n.username}</span> ({n.mobile})
                      {n.is_read ? " • ✓ Read" : " • Unread"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} /> {fmt(n.created_at)}
                    </p>
                  </div>
                  <button onClick={() => deleteNotif(n.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 shrink-0" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
