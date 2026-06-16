import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../api";
import AivanaChat from "../components/AivanaChat";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

// SVG icon helpers — no emojis
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconClock = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconBell = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const [familyName, setFamilyName] = useState("");
  const [familyEmail, setFamilyEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const famRes = await API.get("/family/profile", config);
        setFamilyName(famRes.data.familyName);
        setFamilyEmail(famRes.data.email);
        setMembers(famRes.data.members || []);

        const reminderPromises = (famRes.data.members || []).map(async (member) => {
          const res = await API.get(`/reminders/${member._id}`, config);
          return res.data.map((r) => ({ ...r, memberName: member.name }));
        });

        const remindersArrays = await Promise.all(reminderPromises);
        setAlerts(remindersArrays.flat());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddMember = async () => {
    const name = prompt("Enter member name:");
    const role = prompt("Enter member role:");
    if (!name || !role) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await API.post("/members", { name, role }, config);
      setMembers([...members, res.data]);
      toast.success("Member added successfully!");
    } catch (error) {
      console.error("Failed to add member", error);
      toast.error("Failed to add member");
    }
  };

  const handleAddDrugAlert = async () => {
    if (members.length === 0) return alert("No members available");
    const memberOptions = members.map((m, i) => `${i + 1}. ${m.name}`).join("\n");
    const selected = prompt(`Select member by number:\n${memberOptions}`);
    const memberIndex = parseInt(selected) - 1;
    const member = members[memberIndex];
    if (!member) return alert("Invalid member selected.");

    const medicine = prompt("Enter medicine name:");
    const dosage = prompt("Enter dosage:");
    const timeInput = prompt("Enter time (HH:MM, 24hr format):");
    if (!timeInput) return alert("Time is required.");

    const [hours, minutes] = timeInput.split(":");
    const now = new Date();
    const localTime = new Date(
      now.getFullYear(), now.getMonth(), now.getDate(),
      parseInt(hours), parseInt(minutes)
    );
    const note = prompt("Add note (optional):");

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await API.post(
        "/reminders/add",
        { memberId: member._id, medicine, dosage, time: localTime.toISOString(), note },
        config
      );
      toast.success("Drug reminder added successfully!");
      setAlerts([...alerts, { ...res.data.reminder, memberName: member.name }]);
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error("Error adding reminder");
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await API.delete(`/members/${memberId}`, config);
        toast.success("Member deleted successfully");
        setMembers(members.filter((m) => m._id !== memberId));
      } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting member");
      }
    }
  };

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const avatarColors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-purple-100 text-purple-700",
  ];

  const overdueCount = alerts.filter((a) => new Date(a.time) < Date.now()).length;
  const upcomingCount = alerts.filter((a) => new Date(a.time) >= Date.now()).length;

  return (
    <>
      {loading && <Spinner show={loading} />}

      <div className="min-h-screen flex flex-col bg-gray-50">

        {/* ── Header ── */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Profile pic → navigates to /settings */}
            <button
              onClick={() => navigate("/settings")}
              className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
              aria-label="Open settings"
            >
              <img
                src={localStorage.getItem("profilePhoto") || "/profile.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 hover:ring-blue-400 transition"
              />
            </button>

            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate leading-tight">
                {familyName ? `${familyName} Family` : "My Family"}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition relative"
              aria-label="Notifications"
            >
              <IconBell />
              {overdueCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
            >
              <IconChart /> Analytics
            </button>
          </div>
        </header>

        {/* ── Main grid ── */}
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Members", value: members.length, color: "text-blue-600 bg-blue-50" },
                { label: "Upcoming", value: upcomingCount, color: "text-emerald-600 bg-emerald-50" },
                { label: "Overdue", value: overdueCount, color: "text-rose-600 bg-rose-50" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${color.split(" ")[0]}`}>{label}</span>
                  <span className="text-3xl font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Family Members</h2>
                <button
                  onClick={handleAddMember}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                >
                  <IconPlus /> Add member
                </button>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No members yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {members.map((member, idx) => (
                    <div
                      key={member._id}
                      className="flex flex-col items-center text-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-4 transition group"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[idx % avatarColors.length]}`}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMember(member._id)}
                        className="mt-1 w-full text-xs text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 py-1.5 rounded-lg font-medium transition opacity-0 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Ghost add card */}
                  <button
                    onClick={handleAddMember}
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-gray-400 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/40 transition min-h-[120px]"
                  >
                    <IconPlus />
                    <span className="text-xs font-medium">Add member</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile analytics button */}
            <button
              onClick={() => navigate("/analytics")}
              className="sm:hidden w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-3.5 rounded-2xl transition"
            >
              <IconChart /> View health analytics
            </button>
          </div>

          {/* ── Right sidebar ── */}
          <div className="flex flex-col gap-5">

            {/* Drug Alerts */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Drug Alerts</h2>
                <button
                  onClick={handleAddDrugAlert}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                >
                  <IconPlus /> Add
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-8">No reminders yet</p>
                ) : (
                  alerts.map((alert) => {
                    const overdue = new Date(alert.time) < Date.now();
                    return (
                      <div
                        key={alert._id}
                        className={`flex flex-col gap-0.5 rounded-xl px-3.5 py-3 border-l-4 ${
                          overdue ? "bg-rose-50 border-rose-400" : "bg-emerald-50 border-emerald-400"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${overdue ? "text-rose-600" : "text-emerald-700"}`}>
                          {alert.memberName}
                        </span>
                        <span className="text-xs text-gray-700">{alert.medicine} · {alert.dosage}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <IconClock />
                          {new Date(alert.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {overdue && <span className="text-rose-400 font-medium">· overdue</span>}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Calendar</h2>
              <div className="calendar-wrap">
                <Calendar onChange={setDate} value={date} />
              </div>
            </div>

            {/* Emergency — inline button, NOT a FAB */}
            <Link
              to="/emergency"
              className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold py-3.5 rounded-2xl transition"
            >
              <IconAlert /> Emergency
            </Link>

            {/* Aivana chat */}
            <AivanaChat />
          </div>
        </main>

        <Footer />
      </div>

      <style>{`
        .calendar-wrap .react-calendar {
          width: 100%; border: none; font-family: inherit;
          background: transparent; font-size: 13px;
        }
        .calendar-wrap .react-calendar__navigation { margin-bottom: 4px; }
        .calendar-wrap .react-calendar__navigation button {
          background: none; border-radius: 8px; font-size: 13px;
          font-weight: 500; color: #374151; min-width: 32px;
        }
        .calendar-wrap .react-calendar__navigation button:hover { background: #f3f4f6; }
        .calendar-wrap .react-calendar__month-view__weekdays {
          color: #9ca3af; font-size: 11px; font-weight: 500;
          text-transform: uppercase;
        }
        .calendar-wrap .react-calendar__month-view__weekdays abbr { text-decoration: none; }
        .calendar-wrap .react-calendar__tile {
          border-radius: 8px; padding: 6px 4px;
          font-size: 12px; color: #374151; transition: background 0.15s;
        }
        .calendar-wrap .react-calendar__tile:hover { background: #eff6ff; color: #2563eb; }
        .calendar-wrap .react-calendar__tile--active {
          background: #2563eb !important; color: white !important; border-radius: 8px;
        }
        .calendar-wrap .react-calendar__tile--now {
          background: #eff6ff; color: #2563eb; font-weight: 600;
        }
        .calendar-wrap .react-calendar__tile--now.react-calendar__tile--active {
          background: #2563eb !important; color: white !important;
        }
      `}</style>
    </>
  );
}