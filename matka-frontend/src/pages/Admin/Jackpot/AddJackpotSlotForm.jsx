import axios from "axios";
import React, { useState } from "react";
import { API_URL } from "../../../config";

// Convert "14:30" (24h from <input type="time">) to "02:30 PM" (backend format)
const to12Hour = (t) => {
  if (!t) return t;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const API_BASE = `${API_URL}/starline_jackpot`;

const AddSlotForm = ({ onSlotAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/jackpot/add`, {
        name: formData.name,
        start_time: to12Hour(formData.start_time),
        end_time: to12Hour(formData.end_time),
      });

      setMessage(`✅ Success! Slot Added (ID: ${res.data.slot_id})`);
      setFormData({ name: "", start_time: "", end_time: "" }); // Reset form
      onSlotAdded(); // Trigger refresh on the main page
    } catch (error) {
      console.error("Error adding slot:", error);
      setMessage(
        `❌ Error: ${error.response?.data?.detail || "Failed to add slot."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
        ➕ Add New Slot
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Slot Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Slot Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Start Time */}
        <div>
          <label
            htmlFor="start_time"
            className="block text-sm font-medium text-gray-700"
          >
            Start Time (HH:MM)
          </label>
          <input
            type="time" // Use 'time' input for browser validation/picker
            name="start_time"
            id="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* End Time */}
        <div>
          <label
            htmlFor="end_time"
            className="block text-sm font-medium text-gray-700"
          >
            End Time (HH:MM)
          </label>
          <input
            type="time"
            name="end_time"
            id="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Starline Slot"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddSlotForm;
