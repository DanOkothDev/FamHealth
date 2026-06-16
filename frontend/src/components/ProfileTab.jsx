import React, { useState } from "react";
import { LogOut, Edit2, Trash2, Lock, Upload, Check, X, Camera } from "lucide-react";
import API from "../api";

const ProfileTab = ({ family, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(family.familyName);
  const [newEmail, setNewEmail] = useState(family.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(family.profilePic);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState(null); // "password" | "danger" | null

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const handleUpload = async () => {
    if (!photo) return alert("Please select a photo first.");
    const formData = new FormData();
    formData.append("photo", photo);
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.post("/family/upload-profile", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data.photoUrl;
      setPhotoPreview(newUrl);
      localStorage.setItem("profilePhoto", newUrl);
      setPhoto(null);
      alert("Profile picture updated.");
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await API.put("/family/update", { familyName: newName, email: newEmail }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditing(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return alert("Please fill in both fields.");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await API.put("/family/change-password", { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOldPassword("");
      setNewPassword("");
      setSection(null);
      alert("Password changed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await API.delete("/family/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 pb-5 border-b border-gray-100">
        <div className="relative">
          {photoPreview || localStorage.getItem("profilePhoto") ? (
            <img
              src={photoPreview || localStorage.getItem("profilePhoto")}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold ring-2 ring-gray-200">
              {getInitials(family.familyName || family.name)}
            </div>
          )}
          <label
            htmlFor="profile-upload"
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition shadow-sm"
            title="Change photo"
          >
            <Camera size={13} className="text-gray-600" />
          </label>
          <input
            type="file"
            accept="image/*"
            id="profile-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setPhoto(file);
              setPhotoPreview(URL.createObjectURL(file));
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">{family.familyName || family.name}</p>
          <p className="text-xs text-gray-400">{family.email}</p>
        </div>

        {photo && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition"
          >
            <Upload size={13} />
            {loading ? "Uploading…" : "Save new photo"}
          </button>
        )}
      </div>

      {/* Profile info / edit */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
        {!editing ? (
          <div className="flex flex-col gap-3">
            <Row label="Family name" value={family.familyName || family.name} />
            <Row label="Email" value={family.email} />
            <button
              onClick={() => setEditing(true)}
              className="mt-1 self-start flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
            >
              <Edit2 size={13} /> Edit profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Field
              label="Family name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              type="text"
            />
            <Field
              label="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              type="email"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition"
              >
                <Check size={13} /> {loading ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition"
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => setSection(section === "password" ? null : "password")}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
        >
          <span className="flex items-center gap-2 text-sm">
            <Lock size={15} className="text-gray-500" /> Change password
          </span>
          <span className="text-gray-400 text-xs">{section === "password" ? "▲" : "▼"}</span>
        </button>

        {section === "password" && (
          <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
            <Field
              label="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              type="password"
            />
            <Field
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="self-start flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition mt-1"
            >
              <Lock size={13} /> {loading ? "Updating…" : "Update password"}
            </button>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl transition"
      >
        <LogOut size={15} /> Sign out
      </button>

      {/* Danger zone */}
      <div className="bg-rose-50 rounded-2xl border border-rose-100 overflow-hidden">
        <button
          onClick={() => setSection(section === "danger" ? null : "danger")}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-100 transition"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-rose-600">
            <Trash2 size={15} /> Danger zone
          </span>
          <span className="text-rose-400 text-xs">{section === "danger" ? "▲" : "▼"}</span>
        </button>

        {section === "danger" && (
          <div className="px-4 pb-4 border-t border-rose-100 pt-3 flex flex-col gap-2">
            <p className="text-xs text-rose-500">Deleting your account is permanent and cannot be undone.</p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="self-start flex items-center gap-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl transition"
            >
              <Trash2 size={13} /> {loading ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Small helpers
const Row = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800">{value || "—"}</span>
  </div>
);

const Field = ({ label, value, onChange, type }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
    />
  </div>
);

export default ProfileTab;