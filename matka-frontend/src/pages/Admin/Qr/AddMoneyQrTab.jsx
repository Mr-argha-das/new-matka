// src/pages/Admin/Qr/AddMoneyQrTab.jsx
import { Copy } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

const API_BASE = `${API_URL}/user-deposit-withdrawal`;

const AddMoneyQrTab = () => {
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("accessToken");

  const [currentQR, setCurrentQR] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [amount, setAmount] = useState(
    () => localStorage.getItem("add_amount") || ""
  );
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API_URL}/settings/get`);
        const sited = await axios.get(`${API_URL}/sitedata/get`);

        console.log("siteed", sited);
        setSiteData(sited?.data);
        setSettings(res?.data);
      } catch (error) {
        console.log("Settings API Error:", error);
      }
    }

    load();
  }, []);

  // ------------------------------------------------------------
  // FETCH CURRENT QR FROM SERVER
  // ------------------------------------------------------------
  const fetchCurrentQR = async () => {
    try {
      const res = await axios.get(`${API_URL}/image/get`);

      if (res.data?.image_url) {
        setCurrentQR(
          `${API_URL}${res.data.image_url}?t=${new Date().getTime()}`
        );
      } else {
        setCurrentQR(null);
      }
    } catch (error) {
      console.log("QR FETCH ERROR:", error);
      setCurrentQR(null);
    }
  };

  useEffect(() => {
    fetchCurrentQR();
  }, []);

  // ------------------------------------------------------------
  // FILE PICKER
  // ------------------------------------------------------------
  const openPicker = () => fileInputRef.current?.click();

  const onSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setSelectedFile(f);
    setPreviewImage(URL.createObjectURL(f));
  };

  const uploadNow = async () => {
    const amount = localStorage.getItem("add_amount") || "";

    if (!amount || Number(amount) < settings?.min_deposit) {
      alert(`Please enter minimum amount: ₹${settings?.min_deposit}`);
      return;
    }

    if (!selectedFile) {
      alert("Please upload a screenshot");
      return;
    }

    const fd = new FormData();
    fd.append("image", selectedFile);
    fd.append("amount", amount);
    fd.append("method", localStorage.getItem("add_method") || "UPI QR");

    try {
      const res = await axios.post(`${API_BASE}/upload`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("UPLOAD SUCCESS:", res.data);

      // CLEAR LOCAL STORAGE
      localStorage.removeItem("add_amount");
      localStorage.removeItem("add_method");

      setPreviewImage(null);
      setSelectedFile(null);
      setShowSuccess(true);
      fetchCurrentQR();

      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      alert(err.response?.data?.detail || "Screenshot upload failed");
    }
  };

  return (
    <div className="theme-panel w-[93%] mx-auto max-w-md rounded-[24px] p-4 mt-4">
      {/* -------------------- UPI COPY -------------------- */}
      <div className="w-full flex items-center justify-between border border-green-600/15 bg-emerald-50 rounded-[18px] px-3 py-2 mb-4">
        <p className="text-slate-800 text-sm">{siteData?.upi_id}</p>

        <Copy
          size={18}
          className="text-emerald-700 cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(siteData?.upi_id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        />
      </div>

      {/* -------------------- QR IMAGE -------------------- */}
      <img
        src={currentQR || "/assets/logo.png"}
        className="w-48 h-48 mx-auto my-4 rounded-lg shadow-lg"
        alt="UPI QR"
      />

      <input
        type="number"
        placeholder={`Add amount (Min Rs ${settings?.min_deposit})`}
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          localStorage.setItem("add_amount", e.target.value);
        }}
        className="theme-input py-2 px-4 mb-3 text-slate-900"
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[300, 500, 1000, 2000, 5000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => {
              setAmount(amt);
              localStorage.setItem("add_amount", amt);
            }}
            className="border border-green-600/15 bg-emerald-50 text-emerald-800 py-2 rounded-[18px] font-semibold hover:bg-emerald-100 transition"
          >
            {amt}
          </button>
        ))}
      </div>

      {siteData?.add_money_html ? (
        <div
          className="text-slate-700 mt-5 text-sm"
          dangerouslySetInnerHTML={{
            __html: siteData?.add_money_html,
          }}
        />
      ) : (
        <div className="mt-4 mx-5 text-center max-w-md text-sm text-slate-700 leading-6">
          <p>
            UPI पर पेमेंट करके नीचे स्क्रीनशॉट upload करें।
          </p>
          <p className="mt-2 text-slate-600">
            Screenshot admin panel me pending deposit request ke andar jayega.
          </p>

          <p className="mt-2 font-semibold text-slate-700">
            Payment will be added within 2 minutes.
          </p>
        </div>
      )}
      {/* -------------------- INFO -------------------- */}
      <div className="text-slate-700 text-sm leading-6 mb-6 text-center">
        <p className="text-emerald-700 font-bold">
          Minimum Payment: ₹{settings?.min_deposit}
        </p>
      </div>

      {/* FILE PICKER */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onSelect}
        className="hidden"
      />

      <button
        onClick={openPicker}
        disabled={!amount || Number(amount) < (settings?.min_deposit || 0)}
        className={`theme-button w-full text-white font-semibold py-2 rounded-[20px] shadow-md
    ${
      !amount || Number(amount) < (settings?.min_deposit || 0)
        ? "opacity-40 cursor-not-allowed"
        : ""
    }`}
      >
        Upload Payment Screenshot
      </button>

      {/* ---------------- SUCCESS POPUP ---------------- */}
      {showSuccess && (
        <div className="fixed bottom-40 left-1/2 text-sm font-medium  animate-fadeIn -translate-x-1/2 bg-green-700 text-white px-4 py-2 rounded-full shadow-lg">
          Uploaded Successfully!
        </div>
      )}

      {/* ---------------- COPY POPUP ---------------- */}
      {copied && (
        <div className="fixed bottom-40 left-1/2 text-sm font-medium  animate-fadeIn -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full shadow-lg">
          Copied!
        </div>
      )}

      {/* ---------------- PREVIEW MODAL ---------------- */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl w-[320px] shadow-xl">
            <img src={previewImage} className="w-full rounded-lg mb-4" />

            <div className="flex gap-3">
              <button
                className="w-1/2 py-2 bg-red-500/40 text-white rounded-lg"
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </button>

              <button
                className="w-1/2 py-2 bg-green-500/40 text-white rounded-lg"
                onClick={uploadNow}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMoneyQrTab;
