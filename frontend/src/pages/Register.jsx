import { useState } from "react";
import axios from "axios";

const url = `${import.meta.env.VITE_API_URL}/api`;

export default function Register({ setIsLogin }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const register = async () => {
    if (!name || !email || !password || !mobile) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await axios.post(`${API_URL}/register`, { name, email, password, mobile });
      alert("Account created! Please sign in.");
      setIsLogin(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label:"Full Name",     icon:"👤", type:"text",     ph:"John Doe",          val:name,     set:setName,     auto:"name" },
    { label:"Mobile Number", icon:"📱", type:"tel",      ph:"+91 98765 43210",   val:mobile,   set:setMobile,   auto:"tel" },
    { label:"Email Address", icon:"@",  type:"email",    ph:"you@example.com",   val:email,    set:setEmail,    auto:"email" },
    { label:"Password",      icon:"🔒", type:"password", ph:"Min. 6 characters", val:password, set:setPassword, auto:"new-password" },
  ];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-badge">✦ Join the Journey</div>
          <h1 className="auth-heading">
            Explore the<br />
            <span className="gold">World</span><br />
            With Us.
          </h1>
          <p className="auth-sub">
            Create your free account and unlock curated travel packages designed for every dream destination.
          </p>
          <div className="auth-features">
            {[
              "Exclusive member-only deals",
              "Real-time booking management",
              "24/7 travel concierge support",
            ].map(f => (
              <div className="auth-feature" key={f}>
                <div className="auth-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <div className="auth-form-logo">✈</div>
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-sub">Start your journey in seconds</p>

          {error && <div className="auth-error">{error}</div>}

          {fields.map(({ label, icon, type, ph, val, set, auto }) => (
            <div className="field" key={label}>
              <label>{label}</label>
              <div className="input-wrap">
                <span className="icon">{icon}</span>
                <input type={type} placeholder={ph} value={val}
                  onChange={e => set(e.target.value)} autoComplete={auto} />
              </div>
            </div>
          ))}

          <button className="btn-gold" onClick={register} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <div className="auth-divider">Already have an account?</div>

          <div className="auth-switch">
            <span onClick={() => setIsLogin(true)}>← Back to Sign In</span>
          </div>
        </div>
      </div>
    </div>
  );
}