import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Lightbulb, Trash2, Clock, User as UserIcon } from "lucide-react";
import { API_URL } from "../../config";

export default function AdminUserIdeas() {
  const token = localStorage.getItem("accessToken");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/ideas`, authHeader);
      setIdeas(res.data.ideas || []);
    } catch (err) {
      console.log("Ideas load error:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const deleteIdea = async (id) => {
    if (!window.confirm("Delete this idea?")) return;
    try {
      await axios.delete(`${API_URL}/admin/ideas/${id}`, authHeader);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
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
        <Lightbulb className="text-amber-500" size={24} />
        <h1 className="text-xl font-bold">User Ideas</h1>
        <span className="ml-2 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {ideas.length}
        </span>
      </div>

      {loading && <p className="text-slate-500 py-10 text-center">Loading ideas...</p>}

      {!loading && ideas.length === 0 && (
        <p className="text-slate-500 py-10 text-center">Abhi tak koi idea submit nahi hua.</p>
      )}

      <div className="space-y-3 max-w-3xl">
        {ideas.map((i) => (
          <div key={i.id} className="rounded-xl bg-white border border-slate-200 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <UserIcon size={15} />
                </span>
                {i.username}
                <span className="font-normal text-slate-400">({i.mobile})</span>
              </div>
              <button
                onClick={() => deleteIdea(i.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="mt-2 text-[14px] text-slate-700 whitespace-pre-wrap">{i.text}</p>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={12} /> {fmt(i.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
