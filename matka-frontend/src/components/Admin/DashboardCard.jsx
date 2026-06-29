import React from "react";

export default function DashboardCard({
  title,
  value,
  subtext,
  color,
  icon,
  link,
}) {
  return (
    <a
      href={link}
      className="rounded-2xl border border-emerald-700/10 bg-white p-4 flex justify-between items-center shadow-[0_14px_34px_rgba(9,78,36,0.09)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(9,78,36,0.13)]"
    >
      <div>
        <h3 className="text-slate-600 text-sm font-semibold">{title}</h3>
        <p className="text-2xl font-semibold mt-1 text-slate-950">{value}</p>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      </div>
      <div
        className={`w-10 h-10 flex mt-6 items-center justify-center rounded-full text-white`}
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    </a>
  );
}
