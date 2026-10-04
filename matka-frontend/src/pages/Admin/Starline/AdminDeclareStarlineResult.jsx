import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { API_URL } from "../../../config";

const API_BASE = `${API_URL}/starline_jackpot`;

export default function AdminDeclareStarlineResult() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [panna, setPanna] = useState("");
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem("accessToken");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ----------------------------------------------------
  // LOAD STARLINE SLOT LIST
  // ----------------------------------------------------
  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/starline/list`, authHeader);
      setSlots(res.data);
    } catch (err) {
      console.error("Error loading slots:", err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // ----------------------------------------------------
  // DECLARE RESULT
  // ----------------------------------------------------
  const declareResult = async () => {
    setMessage(null);

    if (!selectedSlot || !panna) {
      setMessage({
        type: "error",
        text: "Please select slot and enter panna.",
      });
      return;
    }

    if (panna.length !== 3 || isNaN(panna)) {
      setMessage({
        type: "error",
        text: "Panna must be 3 digits (e.g., 123).",
      });
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/starline/result/declare`,
        {
          slot_id: selectedSlot,
          panna: panna,
        },
        authHeader
      );

      setMessage({ type: "success", text: res.data.msg });
      setPanna("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to declare result.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#2E7BF6] to-[#0D3FB2] p-4">
          <h1 className="text-lg font-bold text-white">Declare Starline Result</h1>
          <p className="text-xs text-blue-100 mt-0.5">Select slot and enter the winning panna</p>
        </div>

        <div className="p-5 space-y-4">
          {/* SLOT DROPDOWN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Slot
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Starline Slot --</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.name} ({slot.start_time} - {slot.end_time})
                </option>
              ))}
            </select>
          </div>

          {/* PANNA INPUT */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Enter Panna (3 digits)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength="3"
              value={panna}
              onChange={(e) => setPanna(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g., 123"
              className="w-full p-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold tracking-widest"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={declareResult}
            className="w-full bg-gradient-to-r from-[#2E7BF6] to-[#0D3FB2] text-white py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition"
          >
            Declare Result
          </button>

          {/* MESSAGE */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
