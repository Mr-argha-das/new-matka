import { X } from "lucide-react";
import React from "react";

export default function NotificationModal({ html, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white backdrop-blur-2xl mx-3 border border-emerald-700/10 rounded-xl shadow-xl w-full max-w-md p-6 relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-black"
        >
          <X />
        </button>

        {/* <h2 className="text-xl font-bold mb-3 text-center">Notification</h2> */}

        {/* Render HTML from backend */}
        <div
          className="text-slate-700 text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* <button
          onClick={onClose}
          className="w-full mt-5 border border-gray-50/20 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Close
        </button> */}
      </div>
    </div>
  );
}
