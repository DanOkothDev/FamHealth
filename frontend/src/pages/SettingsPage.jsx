import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import ProfileTab from "../components/ProfileTab";
import Spinner from "../components/Spinner";

export default function SettingsPage() {
    const navigate = useNavigate();
    const [family, setFamily] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await API.get("/family/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFamily({
                    familyName: res.data.familyName,
                    email: res.data.email,
                    profilePic: res.data.profilePic || localStorage.getItem("profilePhoto") || "/profile.png",
                });
                // keep localStorage in sync for the header avatar
                localStorage.setItem("familyName", res.data.familyName);
                localStorage.setItem("familyEmail", res.data.email);
                if (res.data.profilePic) {
                    localStorage.setItem("profilePhoto", res.data.profilePic);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {loading && <Spinner show />}

            <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                    aria-label="Go back"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-base font-semibold text-gray-900">Settings</h1>
            </header>

            <main className="flex-grow w-full max-w-lg mx-auto px-4 py-6">
                {!loading && family && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <ProfileTab
                            family={family}
                            onLogout={handleLogout}
                            onProfilePhotoUpdate={(newUrl) => {
                                setFamily((prev) => ({ ...prev, profilePic: newUrl }));
                                localStorage.setItem("profilePhoto", newUrl);
                            }}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}