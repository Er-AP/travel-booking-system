import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const url = `${import.meta.env.VITE_API_URL}/api`;

/* ─── DESTINATIONS DATA ─── */
const DESTINATIONS = [
  { id:1, name:"Paris",       country:"France",      emoji:"🗼", tags:["Romantic","Culture","Food"],     price:"₹45,000", rating:"⭐ 4.9" },
  { id:2, name:"Bali",        country:"Indonesia",   emoji:"🌴", tags:["Beach","Nature","Spiritual"],    price:"₹28,000", rating:"⭐ 4.8" },
  { id:3, name:"Dubai",       country:"UAE",         emoji:"🏙", tags:["Luxury","Shopping","Desert"],    price:"₹52,000", rating:"⭐ 4.7" },
  { id:4, name:"Tokyo",       country:"Japan",       emoji:"🗾", tags:["Culture","Tech","Food"],         price:"₹65,000", rating:"⭐ 4.9" },
  { id:5, name:"Maldives",    country:"Maldives",    emoji:"🏝", tags:["Beach","Luxury","Honeymoon"],   price:"₹85,000", rating:"⭐ 5.0" },
  { id:6, name:"New York",    country:"USA",         emoji:"🗽", tags:["City","Shopping","Culture"],     price:"₹75,000", rating:"⭐ 4.8" },
  { id:7, name:"Santorini",   country:"Greece",      emoji:"🇬🇷", tags:["Romantic","Beach","Views"],     price:"₹55,000", rating:"⭐ 4.9" },
  { id:8, name:"Singapore",   country:"Singapore",   emoji:"🦁", tags:["City","Food","Shopping"],       price:"₹35,000", rating:"⭐ 4.7" },
  { id:9, name:"Manali",      country:"India",       emoji:"🏔", tags:["Mountains","Adventure","Snow"], price:"₹12,000", rating:"⭐ 4.6" },
  { id:10,name:"Goa",         country:"India",       emoji:"🌊", tags:["Beach","Party","Chill"],        price:"₹8,000",  rating:"⭐ 4.5" },
  { id:11,name:"Swiss Alps",  country:"Switzerland", emoji:"🏔", tags:["Snow","Luxury","Adventure"],    price:"₹95,000", rating:"⭐ 4.9" },
  { id:12,name:"Rajasthan",   country:"India",       emoji:"🏰", tags:["Heritage","Desert","Culture"],  price:"₹15,000", rating:"⭐ 4.7" },
];

/* ─── STATUS CONFIG ─── */
const STATUS = {
  Pending:   { bg:"rgba(212,168,67,.12)",  color:"#d4a843",  dot:"#d4a843" },
  Confirmed: { bg:"rgba(62,207,142,.12)",  color:"#3ecf8e",  dot:"#3ecf8e" },
  Cancelled: { bg:"rgba(224,92,92,.12)",   color:"#e05c5c",  dot:"#e05c5c" },
};

/* ─── TOAST ─── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast toast-${type}`}>
      {type === "success" ? "✓" : "✕"} {msg}
    </div>
  );
}

/* ─── TOGGLE ─── */
function Toggle({ on, onClick }) {
  return (
    <div className={`toggle ${on ? "on" : ""}`} onClick={onClick}>
      <div className="toggle-knob" />
    </div>
  );
}

/* ═══════════════════════════════
   PAGES
═══════════════════════════════ */

/* Dashboard home page */
function DashboardHome({ bookings, loading, onNewBooking, onConfirm, onDelete, confirmingId, deletingId }) {
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("All");

  const filtered = bookings.filter(b => {
    const ms = b.destination?.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === "All" || b.bookingStatus === filterStatus;
    return ms && mf;
  });

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === "Confirmed").length,
    pending:   bookings.filter(b => b.bookingStatus === "Pending").length,
    revenue:   bookings.reduce((s,b) => s + Number(b.price||0), 0),
  };

  const fmt  = d => { try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); } catch { return d||"—"; } };
  const fmtP = p => Number(p||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        {[
          { lbl:"Total Bookings", val:stats.total,          icon:"📋", col:"#d4a843" },
          { lbl:"Confirmed",      val:stats.confirmed,      icon:"✅", col:"#3ecf8e" },
          { lbl:"Pending",        val:stats.pending,        icon:"⏳", col:"#d4a843" },
          { lbl:"Total Revenue",  val:fmtP(stats.revenue),  icon:"💰", col:"#2dd4bf" },
        ].map(({ lbl,val,icon,col }) => (
          <div className="stat-card" key={lbl}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-val" style={{ color:col }}>{val}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="icon">🔍</span>
          <input placeholder="Search destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-btns">
          {["All","Pending","Confirmed"].map(s => (
            <button key={s} className={`filter-btn ${filterStatus===s?"active":""}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <button className="btn-new" style={{ marginLeft:"auto" }} onClick={onNewBooking}>+ New Booking</button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="loading-state">
          <div className="big-spinner" />
          <span style={{ color:"var(--grey2)", fontSize:"14px" }}>Loading your trips...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <h3 className="empty-title">No trips found</h3>
          <p className="empty-sub">Create your first booking to get started</p>
          <button className="btn-empty" onClick={onNewBooking}>+ Book a Trip</button>
        </div>
      ) : (
        <div className="bookings-grid">
          {filtered.map((item, idx) => {
            const st = STATUS[item.bookingStatus] || STATUS.Pending;
            const pkg = item.packageType?.toLowerCase() || "silver";
            return (
              <div className="booking-card" key={item._id} style={{ animationDelay:`${idx*50}ms` }}>
                <div className="card-head">
                  <div className="card-dest">{item.destination}</div>
                  <div className="status-badge" style={{ background:st.bg, color:st.color }}>
                    <span className="status-dot" style={{ background:st.dot }} />
                    {item.bookingStatus || "Pending"}
                  </div>
                </div>
                <div className={`pkg-badge pkg-${pkg}`}>{item.packageType || "—"} Package</div>
                <div className="card-divider" />
                <div className="card-details">
                  <div className="detail-row"><span className="detail-icon">📅</span><span className="detail-lbl">Date</span><span className="detail-val">{fmt(item.travelDate)}</span></div>
                  <div className="detail-row"><span className="detail-icon">👥</span><span className="detail-lbl">Travellers</span><span className="detail-val">{item.travelers || "—"}</span></div>
                  <div className="detail-row"><span className="detail-icon">💳</span><span className="detail-lbl">Price</span><span className="detail-val" style={{ color:"var(--gold)" }}>{fmtP(item.price)}</span></div>
                  <div className="detail-row"><span className="detail-icon">📍</span><span className="detail-lbl">Contact</span><span className="detail-val">{item.address || "—"}</span></div>
                </div>
                <div className="card-actions">
                  {item.bookingStatus !== "Confirmed" && (
                    <button className="btn-confirm" onClick={() => onConfirm(item._id)} disabled={confirmingId===item._id}>
                      {confirmingId===item._id ? "..." : "✓ Confirm"}
                    </button>
                  )}
                  <button className="btn-cancel" onClick={() => onDelete(item._id)} disabled={deletingId===item._id}>
                    {deletingId===item._id ? "..." : "✕ Cancel"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* My Bookings page — table view */
function MyBookingsPage({ bookings, onConfirm, onDelete, confirmingId, deletingId }) {
  const fmt  = d => { try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); } catch { return d||"—"; } };
  const fmtP = p => Number(p||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

  return (
    <div className="section-page">
      <div className="section-header">
        <h2 className="section-title">My Bookings</h2>
        <p className="section-sub">Full list of all your travel bookings</p>
      </div>
      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">No bookings yet</h3>
          <p className="empty-sub">Switch to Dashboard to add a booking</p>
        </div>
      ) : (
        <div className="bookings-table-wrap">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Destination</th>
                <th>Date</th>
                <th>Travellers</th>
                <th>Package</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const st = STATUS[b.bookingStatus] || STATUS.Pending;
                return (
                  <tr key={b._id}>
                    <td style={{ color:"var(--grey2)", fontSize:"12px" }}>{i+1}</td>
                    <td style={{ fontWeight:600 }}>{b.destination}</td>
                    <td style={{ color:"var(--grey)" }}>{fmt(b.travelDate)}</td>
                    <td>{b.travelers}</td>
                    <td>
                      <span className={`pkg-badge pkg-${(b.packageType||"silver").toLowerCase()}`} style={{ marginBottom:0 }}>
                        {b.packageType}
                      </span>
                    </td>
                    <td style={{ color:"var(--gold)", fontWeight:600 }}>{fmtP(b.price)}</td>
                    <td>
                      <span className="status-badge" style={{ background:st.bg, color:st.color }}>
                        <span className="status-dot" style={{ background:st.dot }} />
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:"8px" }}>
                        {b.bookingStatus !== "Confirmed" && (
                          <button className="btn-confirm" style={{ padding:"7px 14px", fontSize:"12px" }}
                            onClick={() => onConfirm(b._id)} disabled={confirmingId===b._id}>
                            {confirmingId===b._id ? "..." : "✓"}
                          </button>
                        )}
                        <button className="btn-cancel" style={{ padding:"7px 14px", fontSize:"12px" }}
                          onClick={() => onDelete(b._id)} disabled={deletingId===b._id}>
                          {deletingId===b._id ? "..." : "✕"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* Destinations page */
function DestinationsPage({ onBook }) {
  return (
    <div className="section-page">
      <div className="section-header">
        <h2 className="section-title">Popular Destinations</h2>
        <p className="section-sub">Explore our curated list of top travel destinations worldwide</p>
      </div>
      <div className="dest-grid">
        {DESTINATIONS.map((d, i) => (
          <div className="dest-card" key={d.id} style={{ animationDelay:`${i*40}ms` }}>
            <div className="dest-img" style={{ background:`linear-gradient(135deg, var(--bg4), var(--bg3))` }}>
              <span style={{ fontSize:"60px", position:"relative", zIndex:1 }}>{d.emoji}</span>
              <div className="dest-img-overlay" />
            </div>
            <div className="dest-info">
              <div className="dest-name">{d.name}</div>
              <div className="dest-country">📍 {d.country}</div>
              <div className="dest-tags">
                {d.tags.map(t => <span className="dest-tag" key={t}>{t}</span>)}
              </div>
              <div className="dest-footer">
                <div>
                  <div className="dest-price">From {d.price}</div>
                  <div className="dest-rating">{d.rating}</div>
                </div>
                <button className="dest-book-btn" onClick={() => onBook(d.name)}>Book Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Settings page */
function SettingsPage({ onToast }) {
  const [notifs, setNotifs]   = useState(true);
  const [emails, setEmails]   = useState(false);
  const [dark, setDark]       = useState(true);
  const [currency, setCurrency] = useState("INR");

  return (
    <div className="section-page">
      <div className="section-header">
        <h2 className="section-title">Settings</h2>
        <p className="section-sub">Manage your account preferences</p>
      </div>
      <div className="settings-grid">

        {/* Profile */}
        <div className="settings-card">
          <div className="settings-card-title">👤 Profile Information</div>
          <div className="settings-card-sub">Update your personal details</div>
          <div className="settings-field"><label>Full Name</label><input placeholder="Your name" /></div>
          <div className="settings-field"><label>Email</label><input type="email" placeholder="your@email.com" /></div>
          <div className="settings-field"><label>Mobile</label><input type="tel" placeholder="+91 ..." /></div>
          <button className="btn-save" onClick={() => onToast("Profile updated!", "success")}>Save Changes</button>
        </div>

        {/* Password */}
        <div className="settings-card">
          <div className="settings-card-title">🔒 Security</div>
          <div className="settings-card-sub">Change your password</div>
          <div className="settings-field"><label>Current Password</label><input type="password" placeholder="••••••••" /></div>
          <div className="settings-field"><label>New Password</label><input type="password" placeholder="••••••••" /></div>
          <div className="settings-field"><label>Confirm New Password</label><input type="password" placeholder="••••••••" /></div>
          <button className="btn-save" onClick={() => onToast("Password updated!", "success")}>Update Password</button>
        </div>

        {/* Preferences */}
        <div className="settings-card">
          <div className="settings-card-title">⚙️ Preferences</div>
          <div className="settings-card-sub">Customize your experience</div>
          <div className="settings-field">
            <label>Default Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ padding:"12px 16px", width:"100%", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r2)", color:"var(--white)", fontFamily:"var(--font-b)", outline:"none" }}>
              <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </div>
          <div className="toggle-row">
            <div className="toggle-info"><p>Dark Mode</p><span>Use dark theme throughout</span></div>
            <Toggle on={dark} onClick={() => setDark(p => !p)} />
          </div>
          <div className="toggle-row">
            <div className="toggle-info"><p>Push Notifications</p><span>Booking confirmations & alerts</span></div>
            <Toggle on={notifs} onClick={() => setNotifs(p => !p)} />
          </div>
          <div className="toggle-row">
            <div className="toggle-info"><p>Email Updates</p><span>Deals and offers by email</span></div>
            <Toggle on={emails} onClick={() => setEmails(p => !p)} />
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-card">
          <div className="settings-card-title" style={{ color:"var(--red)" }}>⚠️ Danger Zone</div>
          <div className="settings-card-sub">Irreversible actions — proceed with caution</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginTop:"8px" }}>
            <button className="btn-cancel" style={{ padding:"12px", borderRadius:"var(--r2)", fontSize:"14px" }}
              onClick={() => onToast("All bookings cleared.", "error")}>
              Clear All Bookings
            </button>
            <button className="btn-cancel" style={{ padding:"12px", borderRadius:"var(--r2)", fontSize:"14px" }}
              onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>
              Delete Account & Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════
   BOOKING MODAL
═══════════════════════════════ */
function BookingModal({ onClose, onSuccess, prefillDest="" }) {
  const [destination, setDestination] = useState(prefillDest);
  const [travelDate, setTravelDate]   = useState("");
  const [travelers, setTravelers]     = useState("");
  const [packageType, setPackageType] = useState("");
  const [price, setPrice]             = useState("");
  const [address, setAddress]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const token = localStorage.getItem("token");

  const submit = async () => {
    if (!destination||!travelDate||!travelers||!packageType||!price||!address) {
      setError("Please fill in all fields."); return;
    }
    setError(""); setLoading(true);
    try {
      await axios.post(`${API_URL}/bookings`,
        { destination, travelDate, travelers, packageType, price, address },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">✈ New Booking</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-grid">
          <div className="field">
            <label>Destination</label>
            <div className="input-wrap">
              <span className="icon">🌍</span>
              <input type="text" placeholder="e.g. Paris, France" value={destination} onChange={e=>setDestination(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Travel Date</label>
            <div className="input-wrap">
              <span className="icon">📅</span>
              <input type="date" value={travelDate} onChange={e=>setTravelDate(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>No. of Travellers</label>
            <div className="input-wrap">
              <span className="icon">👥</span>
              <input type="number" min="1" placeholder="e.g. 2" value={travelers} onChange={e=>setTravelers(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Package Type</label>
            <div className="input-wrap">
              <span className="icon">💎</span>
              <select value={packageType} onChange={e=>setPackageType(e.target.value)}>
                <option value="">Select package...</option>
                <option>Silver</option>
                <option>Gold</option>
                <option>Platinum</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Price (₹)</label>
            <div className="input-wrap">
              <span className="icon">💳</span>
              <input type="number" placeholder="e.g. 25000" value={price} onChange={e=>setPrice(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Contact / Address</label>
            <div className="input-wrap">
              <span className="icon">📍</span>
              <input type="text" placeholder="Email or address" value={address} onChange={e=>setAddress(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={submit} disabled={loading}>
            {loading ? "Booking..." : "✈ Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════ */
const NAV = [
  { id:"dashboard",    icon:"🗺",  label:"Dashboard" },
  { id:"my-bookings",  icon:"📋",  label:"My Bookings" },
  { id:"destinations", icon:"📍",  label:"Destinations" },
  { id:"settings",     icon:"⚙️",  label:"Settings" },
];

export default function Dashboard() {
  const [page, setPage]           = useState("dashboard");
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [prefill, setPrefill]     = useState("");
  const [deletingId, setDel]      = useState(null);
  const [confirmingId, setCon]    = useState(null);
  const [toast, setToast]         = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization:`Bearer ${token}` };

  const showToast = (msg, type="success") => setToast({ msg, type });

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`, { headers });
      setBookings(res.data);
    } catch { showToast("Failed to fetch bookings.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (token) fetchBookings(); }, [fetchBookings]);

  const handleConfirm = async id => {
    setCon(id);
    try {
      await axios.put(`${API_URL}/bookings/${id}`, { bookingStatus:"Confirmed" }, { headers });
      setBookings(prev => prev.map(b => b._id===id ? {...b, bookingStatus:"Confirmed"} : b));
      showToast("Booking confirmed! ✓");
    } catch { showToast("Update failed.", "error"); }
    finally { setCon(null); }
  };

  const handleDelete = async id => {
    setDel(id);
    try {
      await axios.delete(`${API_URL}/bookings/${id}`, { headers });
      setBookings(prev => prev.filter(b => b._id!==id));
      showToast("Booking cancelled.");
    } catch { showToast("Delete failed.", "error"); }
    finally { setDel(null); }
  };

  const handleBookSuccess = () => {
    setShowModal(false);
    setPrefill("");
    showToast("Booking added! ✓");
    fetchBookings();
  };

  const openBookModal = (dest="") => { setPrefill(dest); setShowModal(true); };

  const logout = () => { localStorage.removeItem("token"); window.location.reload(); };

  return (
    <div className="dash-root">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">✈</span>
          <span className="sidebar-logo-text">Voyage</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ id, icon, label }) => (
            <div key={id} className={`nav-item ${page===id?"active":""}`} onClick={() => setPage(id)}>
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {page===id && <div className="nav-dot" />}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">U</div>
            <div>
              <div className="sidebar-user-name">My Account</div>
              <div className="sidebar-user-role">Premium Traveller</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>⏻ &nbsp;Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">

        {/* Top bar for non-dashboard pages */}
        {page !== "dashboard" && (
          <div className="topbar">
            <div>
              <div className="topbar-greet">
                {NAV.find(n=>n.id===page)?.icon}&nbsp; {NAV.find(n=>n.id===page)?.label}
              </div>
              <div className="topbar-sub">
                {page==="my-bookings"  && "View and manage all your bookings in one place"}
                {page==="destinations" && "Discover amazing places around the world"}
                {page==="settings"     && "Customize your account and preferences"}
              </div>
            </div>
            {page !== "settings" && (
              <button className="btn-new" onClick={() => openBookModal()}>+ New Booking</button>
            )}
          </div>
        )}

        {/* Dashboard home top bar */}
        {page === "dashboard" && (
          <div className="topbar">
            <div>
              <div className="topbar-greet">Good day, Traveller 👋</div>
              <div className="topbar-sub">Manage your bookings and upcoming trips</div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        {page === "dashboard" && (
          <DashboardHome
            bookings={bookings} loading={loading}
            onNewBooking={() => openBookModal()}
            onConfirm={handleConfirm} onDelete={handleDelete}
            confirmingId={confirmingId} deletingId={deletingId}
          />
        )}
        {page === "my-bookings" && (
          <MyBookingsPage
            bookings={bookings}
            onConfirm={handleConfirm} onDelete={handleDelete}
            confirmingId={confirmingId} deletingId={deletingId}
          />
        )}
        {page === "destinations" && (
          <DestinationsPage onBook={dest => { openBookModal(dest); setPage("dashboard"); }} />
        )}
        {page === "settings" && (
          <SettingsPage onToast={showToast} />
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <BookingModal
          onClose={() => { setShowModal(false); setPrefill(""); }}
          onSuccess={handleBookSuccess}
          prefillDest={prefill}
        />
      )}

      {/* TOAST */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}