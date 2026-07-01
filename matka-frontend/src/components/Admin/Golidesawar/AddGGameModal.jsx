// src/components/Admin/GGame/AddGGameModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { X } from "lucide-react";

export default function AddGGameModal({ onClose, refresh, previewImage }) {
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({
    name: "",
    hindi: "",
    marketType: "Golidesawar",
    open_time: "", // 24h HH:MM
    close_time: "",
    is_active: true,
    status: true,
  });

  const to12Hour = (time) => {
    if (!time) return "";
    const [hhStr, mmStr] = time.split(":");
    let hh = parseInt(hhStr, 10);
    const mm = mmStr || "00";
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    return `${String(hh).padStart(2, "0")}:${mm} ${ampm}`;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.hindi || !form.open_time || !form.close_time) {
      alert("Please fill all required fields!");
      return;
    }

    const openFmt = to12Hour(form.open_time);
    const closeFmt = to12Hour(form.close_time);

    try {
      await axios.post(
        `${API_URL}/api/admin/Golidesawar/market/`,
        {
          name: form.name,
          hindi: form.hindi,
          marketType: form.marketType,
          open_time: openFmt,
          close_time: closeFmt,
          is_active: form.is_active,
          status: form.status,
        },
        { headers }
      );

      refresh();
      onClose();
    } catch (err) {
      console.error("Add game error:", err);
      alert(err.response?.data?.detail || "Error adding game");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-4 pt-24 overflow-auto">
      <div className="w-full lg:max-w-2xl md:max-w-2xl rounded-xl p-5 bg-white border border-emerald-700/10 text-slate-900 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Add Game</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="font-semibold">Game Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="font-semibold">Game Name Hindi</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg mt-1"
              value={form.hindi}
              onChange={(e) => setForm({ ...form, hindi: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={() => setForm({ ...form, is_active: !form.is_active })}
            />
            Is Active
          </label>

          <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Open Time</label>
              <input
                type="time"
                className="w-full p-3 border rounded-lg mt-1"
                value={form.open_time}
                onChange={(e) =>
                  setForm({ ...form, open_time: e.target.value })
                }
              />
            </div>

            <div>
              <label className="font-semibold">Close Time</label>
              <input
                type="time"
                className="w-full p-3 border rounded-lg mt-1"
                value={form.close_time}
                onChange={(e) =>
                  setForm({ ...form, close_time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-4 mt-5">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Submit
            </button>

            <button
              onClick={() =>
                setForm({
                  name: "",
                  hindi: "",
                  marketType: "Golidesawar",
                  open_time: "",
                  close_time: "",
                  is_active: true,
                  status: true,
                })
              }
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
