import { useState } from "react";
import axios from "axios";

const url = `${import.meta.env.VITE_API_URL}/api`;
export default function Login({ setIsLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const login = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await axios.post(`${url}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch (err) {

  console.log(err);

  setError(
    err?.response?.data?.msg ||
    "Login Failed"
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-badge">✦ Premium Travel</div>
          <h1 className="auth-heading">
            Your Next<br />
            <span className="gold">Adventure</span><br />
            Awaits.
          </h1>
          <p className="auth-sub">
            Curated journeys, seamless bookings, and unforgettable experiences — all in one place.
          </p>
          <div className="auth-stats">
            {[["12K+","Trips Booked"],["98%","Satisfaction"],["150+","Destinations"]].map(([n,l]) => (
              <div key={l}>
                <span className="auth-stat-num">{n}</span>
                <span className="auth-stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <div className="auth-form-logo">✈</div>
          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-sub">Sign in to manage your journeys</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="field">
            <label>Email Address</label>
            <div className="input-wrap">
              <span className="icon">@</span>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                autoComplete="email" />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <span className="icon">🔒</span>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                autoComplete="current-password" />
            </div>
          </div>

          <button className="btn-gold" onClick={login} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="auth-divider">— or —</div>

          <div className="auth-switch">
            Don't have an account?{" "}
            <span onClick={() => setIsLogin(false)}>Create one free →</span>
          </div>
        </div>
      </div>
    </div>
  );
}