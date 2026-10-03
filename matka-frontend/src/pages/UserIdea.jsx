import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ArrowLeft, Lightbulb, Send, Clock } from "lucide-react";
import { API_URL } from "../config";

export default function UserIdea() {
  const token = localStorage.getItem("accessToken");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ideas, setIdeas] = useState([]);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/user/ideas`, authHeader);
      setIdeas(res.data.ideas || []);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const submit = async () => {
    const t = text.trim();
    if (!t) {
      setMsg({ type: "error", text: "Pehle apna idea likho!" });
      return;
    }
    setSending(true);
    setMsg(null);
    try {
      await axios.post(`${API_URL}/user/ideas`, { text: t }, authHeader);
      setMsg({ type: "success", text: "Idea submit ho gaya! Thank you 🙏" });
      setText("");
      fetchIdeas();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.detail || "Submit failed. Try again." });
    } finally {
      setSending(false);
    }
  };

  const fmtTime = (iso) =>
    iso
      ? new Date(iso.endsWith("Z") ? iso : iso + "Z").toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true,
        })
      : "";

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-[#2E7BF6] to-[#0D3FB2] flex items-center px-3 py-3 shadow-md">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/20 text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-[18px] font-bold text-white uppercase pr-10 flex items-center justify-center gap-2">
          <Lightbulb size={20} /> User's Idea
        </h2>
      </div>

      <div className="flex-1 px-4 py-5 pb-24">
        <div className="rounded-2xl bg-[#E8F1FF] border border-[#C7DDFF] p-4 mb-4">
          <p className="text-[13px] text-[#0A3796] font-medium">
            Aapka koi idea ya suggestion hai app ke liye? Yahan likho — hum zaroor padhenge! 💡
          </p>
        </div>

        <label className="block text-sm font-semibold text-gray-700 mb-2">Apna Idea Likhe</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          placeholder="Apna idea / suggestion yahan likhe..."
          rows={8}
          className="w-full rounded-2xl border border-gray-300 bg-white p-4 text-[15px] text-[#0A1F44] outline-none focus:border-[#1565D8] focus:shadow-[0_0_0_3px_rgba(21,101,216,0.15)] resize-none"
        />
        <div className="text-right text-[11px] text-gray-400 mt-1">{text.length}/2000</div>

        {msg && (
          <div className={`mt-2 mb-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-center ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        <button
          onClick={submit}
          disabled={sending}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2E7BF6] to-[#0D3FB2] py-3.5 font-bold text-white shadow-md hover:shadow-lg transition disabled:opacity-60"
        >
          <Send size={18} /> {sending ? "Submitting..." : "Submit Idea"}
        </button>

        {/* My previous ideas */}
        {ideas.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[15px] font-bold text-[#0A1F44] mb-3">Aapke Pichhle Ideas</h3>
            <div className="space-y-3">
              {ideas.map((i) => (
                <div key={i.id} className="rounded-2xl bg-white border border-[#DBEAFE] shadow-[0_2px_8px_rgba(13,63,178,0.08)] p-4">
                  <p className="text-[14px] text-[#0A1F44] whitespace-pre-wrap">{i.text}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={12} /> {fmtTime(i.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
