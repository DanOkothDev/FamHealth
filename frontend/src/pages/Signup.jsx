import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import { useSocialAuth } from "../utils/socialAuth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap');

  .su-wrap {
    display: flex;
    min-height: 100vh;
  }

  /* ── Left brand panel ── */
  .su-panel {
    width: 320px;
    flex-shrink: 0;
    background: #0F4C35;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .su-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 3rem;
  }

  .su-logo-icon {
    width: 38px;
    height: 38px;
    background: #22C55E;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .su-logo-icon svg {
    width: 20px;
    height: 20px;
    fill: #fff;
  }

  .su-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .su-headline {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    line-height: 1.25;
    color: #fff;
    margin-bottom: 1rem;
  }

  .su-headline em {
    color: #86EFAC;
    font-style: italic;
  }

  .su-tagline {
    font-family: Inter, sans-serif;
    font-size: 13.5px;
    color: #B8D4C8;
    line-height: 1.65;
    margin-bottom: 2.5rem;
  }

  .su-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .su-feat {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .su-feat-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22C55E;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .su-feat-text {
    font-family: Inter, sans-serif;
    font-size: 13px;
    color: #B8D4C8;
    line-height: 1.55;
  }

  .su-panel-footer {
    font-family: Inter, sans-serif;
    font-size: 11px;
    color: #6B9E8A;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin-top: 2rem;
  }

  /* ── Right form side ── */
  .su-form-side {
    flex: 1;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    overflow-y: auto;
  }

  .su-form-inner {
    width: 100%;
    max-width: 420px;
  }

  .su-eyebrow {
    font-family: Inter, sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    color: #22C55E;
    margin-bottom: 8px;
  }

  .su-form-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    line-height: 1.2;
    color: #111;
    margin-bottom: 6px;
  }

  .su-form-sub {
    font-family: Inter, sans-serif;
    font-size: 13.5px;
    color: #6B7280;
    margin-bottom: 2rem;
  }

  .su-field {
    margin-bottom: 1.1rem;
  }

  .su-label {
    display: block;
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
    letter-spacing: 0.1px;
  }

  .su-input-wrap {
    position: relative;
  }

  .su-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: #9CA3AF;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .su-input {
    width: 100%;
    height: 44px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    background: #F9FAFB;
    font-family: Inter, sans-serif;
    font-size: 14px;
    color: #111;
    padding: 0 12px 0 38px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .su-input:focus {
    border-color: #22C55E;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
  }

  .su-input::placeholder {
    color: #9CA3AF;
  }

  .su-check-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 1.25rem;
  }

  .su-check {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
    accent-color: #0F4C35;
    cursor: pointer;
  }

  .su-check-label {
    font-family: Inter, sans-serif;
    font-size: 12.5px;
    color: #6B7280;
    line-height: 1.55;
  }

  .su-check-label a {
    color: #0F4C35;
    font-weight: 600;
    text-decoration: underline;
  }

  .su-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: Inter, sans-serif;
    font-size: 13px;
    color: #DC2626;
    margin-bottom: 1rem;
  }

  .su-btn {
    width: 100%;
    height: 46px;
    background: #0F4C35;
    color: #fff;
    font-family: Inter, sans-serif;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.2px;
    transition: background 0.15s, transform 0.1s;
  }

  .su-btn:hover:not(:disabled) {
    background: #0a3826;
  }

  .su-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .su-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .su-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 1.5rem 0;
  }

  .su-divider-line {
    flex: 1;
    height: 1px;
    background: #E5E7EB;
  }

  .su-divider-text {
    font-family: Inter, sans-serif;
    font-size: 11px;
    color: #9CA3AF;
    font-weight: 500;
    white-space: nowrap;
  }

  .su-socials {
    display: flex;
    gap: 10px;
  }

  .su-social-btn {
    flex: 1;
    height: 42px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    background: #fff;
    font-family: Inter, sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, border-color 0.15s;
  }

  .su-social-btn:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
  }

  .su-social-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .su-login {
    font-family: Inter, sans-serif;
    font-size: 13px;
    color: #6B7280;
    text-align: center;
    margin-top: 1.5rem;
  }

  .su-login a {
    color: #0F4C35;
    font-weight: 600;
    text-decoration: none;
  }

  .su-login a:hover {
    text-decoration: underline;
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .su-wrap {
      flex-direction: column;
      min-height: 100vh;
    }

    .su-panel {
      width: 100%;
      height: auto;
      position: static;
      padding: 2rem 1.5rem 1.75rem;
    }

    .su-headline {
      font-size: 22px;
    }

    .su-tagline {
      font-size: 13px;
      margin-bottom: 0;
    }

    .su-features {
      display: none;
    }

    .su-panel-footer {
      display: none;
    }

    .su-form-side {
      padding: 2rem 1.25rem 2.5rem;
      align-items: flex-start;
    }

    .su-form-inner {
      max-width: 100%;
    }

    .su-form-title {
      font-size: 24px;
    }
  }
`;

// SVG icons — inline so no extra deps needed
const IconHeart = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconGoogle = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const IconApple = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
  </svg>
);

export default function Signup() {
  const [form, setForm] = useState({ familyName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { googleReady, appleReady, signInWithGoogle, signInWithApple } = useSocialAuth();

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError("");

    try {
      let idToken;
      if (provider === "google") {
        const response = await signInWithGoogle();
        idToken = response?.credential;
      } else {
        const response = await signInWithApple();
        idToken = response?.authorization?.id_token || response?.authorization?.idToken;
      }

      if (!idToken) throw new Error("Unable to read social login response.");

      const url = provider === "google" ? "/auth/google" : "/auth/apple";
      const res = await API.post(url, { idToken });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("familyName", res.data.familyName);
      navigate("/profile");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Social sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/family/register", form);
      navigate("/");
    } catch {
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      {loading && <Spinner show={loading} />}

      <div className="su-wrap">

        {/* ── Left brand panel ── */}
        <aside className="su-panel">
          <div>
            <div className="su-logo">
              <div className="su-logo-icon">
                <IconHeart />
              </div>
              <span className="su-logo-text">FamHealth</span>
            </div>

            <h2 className="su-headline">
              Your family's health,{" "}
              <em>all in one place.</em>
            </h2>
            <p className="su-tagline">
              Track health records, appointments, and wellness goals for every member of your household.
            </p>

            <div className="su-features">
              <div className="su-feat">
                <div className="su-feat-dot" />
                <p className="su-feat-text">Centralised health records for the whole family</p>
              </div>
              <div className="su-feat">
                <div className="su-feat-dot" />
                <p className="su-feat-text">Appointment reminders and medication alerts</p>
              </div>
              <div className="su-feat">
                <div className="su-feat-dot" />
                <p className="su-feat-text">Private, encrypted, and always accessible</p>
              </div>
            </div>
          </div>

          <p className="su-panel-footer">End-to-end encrypted &nbsp;·&nbsp; HIPAA aligned</p>
        </aside>

        {/* ── Right form side ── */}
        <main className="su-form-side">
          <div className="su-form-inner">

            <p className="su-eyebrow">Get started</p>
            <h1 className="su-form-title">Create your account</h1>
            <p className="su-form-sub">Free forever for families up to 6 members.</p>

            <form onSubmit={handleSubmit}>

              {/* Family name */}
              <div className="su-field">
                <label className="su-label" htmlFor="familyName">Family name</label>
                <div className="su-input-wrap">
                  <span className="su-input-icon"><IconUser /></span>
                  <input
                    className="su-input"
                    type="text"
                    id="familyName"
                    name="familyName"
                    placeholder="e.g. The Kamaus"
                    value={form.familyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="su-field">
                <label className="su-label" htmlFor="email">Email address</label>
                <div className="su-input-wrap">
                  <span className="su-input-icon"><IconMail /></span>
                  <input
                    className="su-input"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="family@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="su-field">
                <label className="su-label" htmlFor="password">Password</label>
                <div className="su-input-wrap">
                  <span className="su-input-icon"><IconLock /></span>
                  <input
                    className="su-input"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="8+ characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="su-check-row">
                <input className="su-check" type="checkbox" id="terms" required />
                <label className="su-check-label" htmlFor="terms">
                  I agree to the{" "}
                  <Link to="/terms">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="su-error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button className="su-btn" type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            {/* Divider */}
            <div className="su-divider">
              <div className="su-divider-line" />
              <span className="su-divider-text">or continue with</span>
              <div className="su-divider-line" />
            </div>

            {/* Social buttons */}
            <div className="su-socials">
              <button
                className="su-social-btn"
                type="button"
                disabled={!googleReady || loading}
                onClick={() => handleSocialLogin("google")}
              >
                <span className="su-social-icon"><IconGoogle /></span>
                Google
              </button>
              <button
                className="su-social-btn"
                type="button"
                disabled={!appleReady || loading}
                onClick={() => handleSocialLogin("apple")}
              >
                <span className="su-social-icon" style={{ color: "#000" }}><IconApple /></span>
                Apple
              </button>
            </div>

            {/* Login link */}
            <p className="su-login">
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
            </p>
          </div>
        </main>

      </div>
    </>
  );
}