import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AivanaChat from "../components/AivanaChat";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const diseases = [
  { id: "hiv", name: "HIV", category: "Bloodborne", data: [5, 7, 6, 8, 9, 10, 8, 7, 6, 8, 9, 11], color: "#dc2626" },
  { id: "malaria", name: "Malaria", category: "Vector-borne", data: [15, 20, 25, 30, 40, 45, 38, 30, 28, 25, 20, 18], color: "#d97706" },
  { id: "typhoid", name: "Typhoid", category: "Waterborne", data: [12, 10, 15, 18, 20, 25, 22, 19, 15, 13, 10, 8], color: "#7c3aed" },
  { id: "cholera", name: "Cholera", category: "Waterborne", data: [8, 6, 5, 9, 12, 15, 14, 10, 8, 7, 5, 4], color: "#0891b2" },
  { id: "covid", name: "COVID-19", category: "Respiratory", data: [2, 3, 4, 6, 7, 10, 9, 8, 5, 4, 3, 2], color: "#2563eb" },
  { id: "tb", name: "Tuberculosis", category: "Respiratory", data: [9, 10, 11, 13, 15, 17, 14, 13, 12, 11, 9, 8], color: "#be185d" },
  { id: "diabetes", name: "Diabetes", category: "Chronic", data: [20, 21, 23, 25, 28, 30, 29, 27, 26, 25, 24, 23], color: "#0d9488" },
  { id: "hypertension", name: "Hypertension", category: "Chronic", data: [18, 20, 22, 24, 26, 28, 27, 25, 24, 22, 21, 20], color: "#ea580c" },
  { id: "asthma", name: "Asthma", category: "Respiratory", data: [6, 8, 10, 12, 13, 15, 14, 13, 10, 9, 8, 7], color: "#16a34a" },
  { id: "pneumonia", name: "Pneumonia", category: "Respiratory", data: [10, 12, 15, 18, 20, 22, 21, 19, 16, 14, 12, 10], color: "#4f46e5" },
];

const categories = [...new Set(diseases.map((d) => d.category))];

function buildSeries(selectedIds) {
  return months.map((month, i) => {
    const row = { month };
    diseases.forEach((d) => {
      if (selectedIds.includes(d.id)) row[d.id] = d.data[i];
    });
    return row;
  });
}

function peakIndex(d) {
  return d.data.indexOf(Math.max(...d.data));
}

function intensity(value, max) {
  // returns 0-4 bucket for heat-strip shading
  const ratio = value / max;
  if (ratio > 0.85) return 4;
  if (ratio > 0.65) return 3;
  if (ratio > 0.45) return 2;
  if (ratio > 0.25) return 1;
  return 0;
}

const heatShade = [
  "bg-stone-100 dark:bg-stone-800",
  "bg-blue-100 dark:bg-blue-900/40",
  "bg-blue-300 dark:bg-blue-700/60",
  "bg-blue-500 dark:bg-blue-600",
  "bg-blue-700 dark:bg-blue-500",
];

const DiseaseTrendsPage = () => {
  const [selected, setSelected] = useState(["malaria", "diabetes", "covid"]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const visible = useMemo(
    () => (categoryFilter === "All" ? diseases : diseases.filter((d) => d.category === categoryFilter)),
    [categoryFilter]
  );

  const series = useMemo(() => buildSeries(selected), [selected]);
  const selectedDiseases = diseases.filter((d) => selected.includes(d.id));

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 5 ? prev : [...prev, id]
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-['Inter',sans-serif]">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10 border-b border-stone-200 dark:border-stone-800 pb-7">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-[0.16em] uppercase mb-3">
                Public health surveillance — 2026
              </p>
              <h1 className="text-3xl md:text-[2.5rem] font-semibold text-stone-900 dark:text-stone-50 font-['Source_Serif_4',serif] tracking-tight leading-tight">
                Disease trends report
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 max-w-lg leading-relaxed">
                Monthly case patterns across {diseases.length} tracked conditions, January through December 2026.
              </p>
            </div>
            <div className="flex gap-7 text-sm shrink-0">
              <div>
                <div className="text-stone-400 dark:text-stone-500 text-xs uppercase tracking-wide mb-1">Tracked</div>
                <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50 font-['Source_Serif_4',serif]">
                  {diseases.length}
                </div>
              </div>
              <div>
                <div className="text-stone-400 dark:text-stone-500 text-xs uppercase tracking-wide mb-1">Comparing</div>
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 font-['Source_Serif_4',serif]">
                  {selected.length}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7">
            {/* Sidebar — collapses to horizontal chip rows on mobile */}
            <aside className="lg:border-r lg:border-stone-200 dark:lg:border-stone-800 lg:pr-6">
              <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-3">
                Category
              </h2>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1">
                {["All", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 text-left px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                      categoryFilter === cat
                        ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-transparent border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mt-7 mb-3">
                Conditions <span className="text-stone-400 dark:text-stone-600">({selected.length}/5)</span>
              </h2>
              <div className="flex lg:flex-col flex-wrap gap-2">
                {visible.map((d) => {
                  const active = selected.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggle(d.id)}
                      disabled={!active && selected.length >= 5}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        active
                          ? "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                          : "bg-transparent border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: active ? d.color : "#D6D3CD" }}
                      />
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main panel */}
            <div>
              {/* Comparison chart */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 font-['Source_Serif_4',serif]">
                    Overlay comparison
                  </h2>
                  <span className="text-xs text-stone-400 dark:text-stone-500">Cases per 1,000</span>
                </div>

                {selectedDiseases.length === 0 ? (
                  <div className="h-[320px] flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
                    Select a condition from the list to plot it here.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" vertical={false} />
                      <XAxis dataKey="month" stroke="#A8A29E" tick={{ fontSize: 12, fill: "#78716C" }} />
                      <YAxis stroke="#A8A29E" tick={{ fontSize: 12, fill: "#78716C" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E7E5E0",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                        labelStyle={{ color: "#57534E" }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
                        formatter={(value) => diseases.find((d) => d.id === value)?.name || value}
                      />
                      {selectedDiseases.map((d) => (
                        <Line
                          key={d.id}
                          type="monotone"
                          dataKey={d.id}
                          name={d.id}
                          stroke={d.color}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: d.color, strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Outbreak calendar — heat strip per disease */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 font-['Source_Serif_4',serif]">
                    Outbreak calendar
                  </h2>
                  <span className="text-xs text-stone-400 dark:text-stone-500">Relative intensity by month</span>
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-4">
                  Darker cells mark months closer to each condition's annual peak.
                </p>

                <div className="overflow-x-auto -mx-1 px-1">
                  <div className="min-w-[640px]">
                    <div className="grid gap-y-2" style={{ gridTemplateColumns: "120px repeat(12, 1fr)" }}>
                      <div />
                      {months.map((m) => (
                        <div key={m} className="text-[11px] text-stone-400 dark:text-stone-500 text-center pb-1">
                          {m}
                        </div>
                      ))}
                      {diseases.map((d) => {
                        const max = Math.max(...d.data);
                        return (
                          <React.Fragment key={d.id}>
                            <div className="text-xs text-stone-600 dark:text-stone-300 font-medium pr-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                              <span className="truncate">{d.name}</span>
                            </div>
                            {d.data.map((v, i) => (
                              <div
                                key={i}
                                title={`${d.name} — ${months[i]}: ${v}`}
                                className={`h-5 mx-0.5 rounded-sm ${heatShade[intensity(v, max)]}`}
                              />
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual cards grid */}
              <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-3">
                All conditions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visible.map((d) => {
                  const chartData = months.map((m, i) => ({ month: m, value: d.data[i] }));
                  const avg = (d.data.reduce((a, b) => a + b, 0) / d.data.length).toFixed(1);
                  const peak = months[peakIndex(d)];
                  return (
                    <div
                      key={d.id}
                      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{d.name}</h3>
                          <p className="text-xs text-stone-400 dark:text-stone-500">{d.category}</p>
                        </div>
                        <button
                          onClick={() => toggle(d.id)}
                          className={`text-xs px-2.5 py-1 rounded-md border shrink-0 transition-colors ${
                            selected.includes(d.id)
                              ? "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950"
                              : "border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                          }`}
                        >
                          {selected.includes(d.id) ? "Comparing" : "Compare"}
                        </button>
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <YAxis hide domain={["auto", "auto"]} />
                          <XAxis dataKey="month" hide />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E7E5E0",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                            labelStyle={{ color: "#57534E" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={d.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex justify-between text-xs mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-stone-400 dark:text-stone-500">
                          Peak <span className="text-stone-700 dark:text-stone-300 font-medium">{peak}</span>
                        </span>
                        <span className="text-stone-400 dark:text-stone-500">
                          Avg <span className="text-stone-700 dark:text-stone-300 font-medium">{avg}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <AivanaChat />
    </>
  );
};

export default DiseaseTrendsPage;