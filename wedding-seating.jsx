import { useState, useCallback, useRef } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@200;300;400&display=swap');
`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body, #root {
  min-height: 100vh;
  background: #0e0c09;
  font-family: 'Jost', sans-serif;
  color: #e8dfc8;
}

:root {
  --gold: #c9a96e;
  --gold-light: #e8d5a3;
  --gold-dim: #8a6f43;
  --cream: #f5edd8;
  --dark: #0e0c09;
  --dark2: #1a1710;
  --dark3: #252218;
  --border: rgba(201,169,110,0.2);
  --border-strong: rgba(201,169,110,0.45);
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.orb-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%);
  top: -100px; left: -100px;
}

.orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%);
  bottom: -80px; right: -80px;
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 560px;
}

/* ── Ornament ── */
.ornament {
  text-align: center;
  color: var(--gold-dim);
  font-size: 11px;
  letter-spacing: 0.3em;
  margin-bottom: 1.5rem;
}

.ornament-line {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ornament-line::before,
.ornament-line::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
}

/* ── Headings ── */
.couple-names {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.8rem, 8vw, 4.5rem);
  font-weight: 300;
  color: var(--gold-light);
  text-align: center;
  line-height: 1.1;
  letter-spacing: 0.02em;
  margin-bottom: 0.4rem;
}

.couple-names em {
  font-style: italic;
  color: var(--cream);
}

.date-line {
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-bottom: 2.5rem;
}

/* ── Card ── */
.card {
  background: var(--dark2);
  border: 0.5px solid var(--border-strong);
  border-radius: 2px;
  padding: 2.5rem;
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 0.5px solid var(--border);
  border-radius: 1px;
  pointer-events: none;
}

.card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--gold-light);
  text-align: center;
  margin-bottom: 0.4rem;
}

.card-sub {
  font-size: 11.5px;
  color: var(--gold-dim);
  text-align: center;
  letter-spacing: 0.12em;
  margin-bottom: 2rem;
}

/* ── Input ── */
.field-wrap {
  position: relative;
  margin-bottom: 1.25rem;
}

.field-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold-dim);
  margin-bottom: 0.5rem;
}

.field-input {
  width: 100%;
  background: var(--dark3);
  border: 0.5px solid var(--border-strong);
  border-radius: 1px;
  padding: 0.85rem 1rem;
  font-family: 'Jost', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: var(--cream);
  outline: none;
  transition: border-color 0.2s;
}

.field-input::placeholder { color: rgba(201,169,110,0.25); }
.field-input:focus { border-color: var(--gold); }

/* ── Button ── */
.btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 0.5px solid var(--gold);
  border-radius: 1px;
  font-family: 'Jost', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-light);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-top: 0.5rem;
}

.btn:hover { background: rgba(201,169,110,0.08); }
.btn:active { background: rgba(201,169,110,0.14); }
.btn:disabled { opacity: 0.35; cursor: default; }

.btn-secondary {
  border-color: var(--border-strong);
  color: var(--gold-dim);
  margin-top: 0.75rem;
  font-size: 10px;
}

/* ── Result ── */
.result-box {
  text-align: center;
  padding: 2rem 1rem;
  animation: fadeUp 0.5s ease;
}

.result-intro {
  font-size: 11px;
  letter-spacing: 0.25em;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.result-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 6vw, 2.8rem);
  font-weight: 300;
  font-style: italic;
  color: var(--cream);
  margin-bottom: 1.5rem;
}

.result-divider {
  width: 40px;
  height: 0.5px;
  background: var(--gold);
  margin: 0 auto 1.5rem;
}

.result-table-label {
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.result-table-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 12vw, 5.5rem);
  font-weight: 300;
  color: var(--gold-light);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.result-meal {
  display: inline-block;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  color: var(--gold-dim);
  border: 0.5px solid var(--border);
  padding: 0.3rem 1rem;
  border-radius: 1px;
  margin-top: 0.5rem;
}

.error-msg {
  text-align: center;
  color: #c07a6a;
  font-size: 13px;
  letter-spacing: 0.05em;
  padding: 1rem 0;
  animation: fadeUp 0.3s ease;
}

/* ── Drop zone ── */
.drop-zone {
  border: 0.5px dashed var(--border-strong);
  border-radius: 1px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  margin-bottom: 1.5rem;
  position: relative;
}

.drop-zone:hover, .drop-zone.drag-over {
  background: rgba(201,169,110,0.04);
  border-color: var(--gold);
}

.drop-zone input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.drop-icon {
  font-size: 28px;
  margin-bottom: 0.75rem;
  color: var(--gold-dim);
}

.drop-text {
  font-size: 12px;
  color: var(--gold-dim);
  letter-spacing: 0.15em;
}

.drop-hint {
  font-size: 10.5px;
  color: rgba(201,169,110,0.4);
  margin-top: 0.4rem;
  letter-spacing: 0.1em;
}

/* ── Stats bar ── */
.stats-bar {
  display: flex;
  gap: 1px;
  margin-bottom: 1.5rem;
}

.stat {
  flex: 1;
  background: var(--dark3);
  border: 0.5px solid var(--border);
  padding: 0.75rem;
  text-align: center;
}

.stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  font-weight: 300;
  color: var(--gold-light);
  line-height: 1;
}

.stat-lbl {
  font-size: 9.5px;
  letter-spacing: 0.2em;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-top: 0.2rem;
}

/* ── Nav ── */
.nav-switch {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.nav-item {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-dim);
  cursor: pointer;
  padding-bottom: 0.3rem;
  border-bottom: 0.5px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-family: 'Jost', sans-serif;
}

.nav-item.active {
  color: var(--gold-light);
  border-bottom-color: var(--gold);
}

/* ── Footer ── */
.footer-note {
  text-align: center;
  font-size: 10px;
  color: rgba(201,169,110,0.25);
  letter-spacing: 0.15em;
  margin-top: 2rem;
}

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-up { animation: fadeUp 0.6s ease both; }
.fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
.fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }

/* ── Guest list table ── */
.guest-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 1rem;
  max-height: 220px;
  overflow-y: auto;
  display: block;
}

.guest-table thead { position: sticky; top: 0; background: var(--dark2); }

.guest-table th {
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold-dim);
  padding: 0.5rem 0.75rem;
  border-bottom: 0.5px solid var(--border);
  text-align: left;
  font-weight: 400;
}

.guest-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 0.5px solid rgba(201,169,110,0.08);
  color: rgba(232,223,200,0.7);
}

.guest-table tr:last-child td { border-bottom: none; }

.tag {
  display: inline-block;
  font-size: 9px;
  letter-spacing: 0.15em;
  padding: 0.15rem 0.5rem;
  border: 0.5px solid var(--border);
  border-radius: 1px;
  color: var(--gold-dim);
  text-transform: uppercase;
}

/* Admin password */
.admin-gate {
  text-align: center;
}
`;

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return obj;
  }).filter(r => r[headers[0]]);
}

function normalise(str) {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function findGuest(guests, query) {
  const q = normalise(query);
  // Try exact
  let match = guests.find(g => {
    const fullName = normalise([g.first_name, g.last_name, g.name, g.full_name].filter(Boolean).join(" "));
    const altName = normalise(g.name || g.full_name || "");
    return fullName === q || altName === q;
  });
  if (match) return match;
  // Try partial
  match = guests.find(g => {
    const fullName = normalise([g.first_name, g.last_name, g.name, g.full_name].filter(Boolean).join(" "));
    return fullName.includes(q) || q.includes(fullName.split(" ")[0]);
  });
  return match || null;
}

function getGuestDisplay(g) {
  const name = g.name || g.full_name || [g.first_name, g.last_name].filter(Boolean).join(" ") || "Guest";
  const table = g.table || g.table_number || g.table_no || g.seat || "—";
  const meal = g.meal || g.meal_choice || g.dietary || g.menu || "";
  return { name, table, meal };
}

function getTableKey(g) {
  return g.table || g.table_number || g.table_no || g.seat || "—";
}

function uniqueTables(guests) {
  return [...new Set(guests.map(getTableKey))].filter(t => t && t !== "—").length;
}

// ── Ornament SVG ──
function Diamond() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="none" stroke="#8a6f43" strokeWidth="0.5"/>
      <path d="M6 3L9 6L6 9L3 6L6 3Z" fill="#8a6f43"/>
    </svg>
  );
}

// ── Admin view ──
function AdminView({ onSave, savedGuests }) {
  const [guests, setGuests] = useState(savedGuests || []);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [coupleName, setCoupleName] = useState(localStorage.getItem("wf_couple") || "");
  const [weddingDate, setWeddingDate] = useState(localStorage.getItem("wf_date") || "");
  const [saved, setSaved] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file"); return; }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      if (parsed.length === 0) { setError("No valid data found. Check your CSV format."); return; }
      setGuests(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSave = () => {
    localStorage.setItem("wf_couple", coupleName);
    localStorage.setItem("wf_date", weddingDate);
    localStorage.setItem("wf_guests", JSON.stringify(guests));
    onSave(guests, coupleName, weddingDate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="card fade-up-2">
        <p className="card-title">Couple Details</p>
        <p className="card-sub">How guests will see your wedding</p>

        <div className="field-wrap">
          <label className="field-label">Your names (e.g. Isabella & James)</label>
          <input className="field-input" value={coupleName} onChange={e => setCoupleName(e.target.value)} placeholder="Isabella & James" />
        </div>
        <div className="field-wrap">
          <label className="field-label">Wedding date</label>
          <input className="field-input" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} placeholder="21st June 2026" />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <p className="card-title" style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>Guest List CSV</p>
          <p className="card-sub" style={{ marginBottom: "1.25rem" }}>
            Columns: <span style={{ color: "var(--gold-dim)", letterSpacing: "0.05em" }}>name, table, meal</span> (or first_name / last_name)
          </p>

          <div
            className={`drop-zone ${drag ? "drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
          >
            <input type="file" accept=".csv" onChange={e => processFile(e.target.files[0])} />
            <div className="drop-icon">⬆</div>
            <p className="drop-text">{fileName || "Drop your CSV here or click to browse"}</p>
            <p className="drop-hint">Supports .csv files · UTF-8 encoded</p>
          </div>

          {error && <p className="error-msg">{error}</p>}
        </div>

        {guests.length > 0 && (
          <div className="fade-up">
            <div className="stats-bar">
              <div className="stat"><div className="stat-val">{guests.length}</div><div className="stat-lbl">Guests</div></div>
              <div className="stat"><div className="stat-val">{uniqueTables(guests)}</div><div className="stat-lbl">Tables</div></div>
              <div className="stat"><div className="stat-val">{[...new Set(guests.map(g => g.meal || g.meal_choice || ""))].filter(Boolean).length || "—"}</div><div className="stat-lbl">Menus</div></div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="guest-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Table</th>
                    <th>Meal</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.slice(0, 12).map((g, i) => {
                    const { name, table, meal } = getGuestDisplay(g);
                    return (
                      <tr key={i}>
                        <td>{name}</td>
                        <td><span className="tag">{table}</span></td>
                        <td style={{ color: "rgba(201,169,110,0.5)", fontSize: "11px" }}>{meal}</td>
                      </tr>
                    );
                  })}
                  {guests.length > 12 && (
                    <tr><td colSpan={3} style={{ color: "rgba(201,169,110,0.3)", fontSize: "11px", textAlign: "center", padding: "0.75rem" }}>+{guests.length - 12} more guests</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button className="btn" onClick={handleSave} disabled={guests.length === 0 && !coupleName} style={{ marginTop: "1.5rem" }}>
          {saved ? "✓ Saved" : "Save & Publish"}
        </button>
        {saved && <p style={{ textAlign: "center", fontSize: "11px", color: "var(--gold-dim)", marginTop: "0.75rem", letterSpacing: "0.15em" }}>Guests can now find their seats</p>}
      </div>

      <p className="footer-note" style={{ marginTop: "1.5rem" }}>Share the guest link from the Guest tab · Data is stored locally</p>
    </div>
  );
}

// ── Guest lookup view ──
function GuestView({ guests, coupleName, weddingDate }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | found | notfound
  const inputRef = useRef(null);

  const handleSearch = () => {
    if (!name.trim()) return;
    const found = findGuest(guests, name);
    if (found) {
      setResult(getGuestDisplay(found));
      setStatus("found");
    } else {
      setResult(null);
      setStatus("notfound");
    }
  };

  const handleReset = () => { setName(""); setStatus("idle"); setResult(null); setTimeout(() => inputRef.current?.focus(), 50); };

  if (guests.length === 0) {
    return (
      <div className="card fade-up-2" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--gold-dim)", fontSize: "13px", letterSpacing: "0.1em" }}>The guest list has not been published yet.</p>
        <p style={{ color: "rgba(201,169,110,0.35)", fontSize: "11px", marginTop: "0.5rem", letterSpacing: "0.1em" }}>Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className="card fade-up-2">
      {status === "idle" && (
        <>
          <p className="card-title">Find Your Seat</p>
          <p className="card-sub">Enter your name exactly as it appears on your invitation</p>
          <div className="field-wrap">
            <label className="field-label">Your full name</label>
            <input
              ref={inputRef}
              className="field-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Catherine Osei"
              autoFocus
            />
          </div>
          <button className="btn" onClick={handleSearch} disabled={!name.trim()}>Find My Seat</button>
        </>
      )}

      {status === "found" && result && (
        <div className="result-box fade-up">
          <p className="result-intro">Welcome to the celebration</p>
          <p className="result-name">{result.name}</p>
          <div className="result-divider" />
          <p className="result-table-label">You are seated at</p>
          <p className="result-table-number">{result.table}</p>
          {result.meal && <span className="result-meal">{result.meal}</span>}
          <div style={{ marginTop: "2rem" }}>
            <button className="btn btn-secondary" onClick={handleReset}>Search Another Guest</button>
          </div>
        </div>
      )}

      {status === "notfound" && (
        <div className="result-box">
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", color: "var(--gold-dim)", fontStyle: "italic", marginBottom: "1rem" }}>Name not found</p>
          <p style={{ fontSize: "12px", color: "rgba(201,169,110,0.45)", letterSpacing: "0.1em", lineHeight: 1.8, marginBottom: "1.5rem" }}>
            Please check the spelling or try a variation of your name.<br />If the issue persists, please speak to a member of staff.
          </p>
          <button className="btn" onClick={handleReset}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ── Root ──
export default function App() {
  const [view, setView] = useState("guest");
  const [guests, setGuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wf_guests") || "[]"); } catch { return []; }
  });
  const [coupleName, setCoupleName] = useState(() => localStorage.getItem("wf_couple") || "");
  const [weddingDate, setWeddingDate] = useState(() => localStorage.getItem("wf_date") || "");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const ADMIN_PW = "couple2026"; // changeable

  const handleSave = (g, name, date) => {
    setGuests(g);
    setCoupleName(name);
    setWeddingDate(date);
  };

  const displayCouple = coupleName || "Your Names";
  const displayDate = weddingDate || "Your Wedding Date";

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="grain" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="page">
        <div className="content">
          <div className="ornament fade-up">
            <div className="ornament-line"><Diamond /><span style={{ letterSpacing: "0.3em" }}>Wedding Reception</span><Diamond /></div>
          </div>

          <h1 className="couple-names fade-up">
            <em>{displayCouple.includes("&") ? displayCouple.split("&")[0].trim() : displayCouple}</em>
            {displayCouple.includes("&") && <><br /><span style={{ fontSize: "0.5em", color: "var(--gold-dim)", fontStyle: "normal", letterSpacing: "0.15em" }}>&amp;</span><br /><em>{displayCouple.split("&")[1].trim()}</em></>}
          </h1>

          <p className="date-line fade-up-2">{displayDate}</p>

          <div className="nav-switch fade-up-3">
            <button className={`nav-item ${view === "guest" ? "active" : ""}`} onClick={() => setView("guest")}>Find My Seat</button>
            <button className={`nav-item ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>Couple's Portal</button>
          </div>

          {view === "guest" && <GuestView guests={guests} coupleName={displayCouple} weddingDate={displayDate} />}

          {view === "admin" && !adminUnlocked && (
            <div className="card fade-up-2 admin-gate">
              <p className="card-title">Couple's Access</p>
              <p className="card-sub">Enter your portal password</p>
              <div className="field-wrap" style={{ maxWidth: 280, margin: "0 auto 1rem" }}>
                <input
                  className="field-input"
                  type="password"
                  value={adminPw}
                  onChange={e => { setAdminPw(e.target.value); setPwError(false); }}
                  onKeyDown={e => { if (e.key === "Enter") { adminPw === ADMIN_PW ? setAdminUnlocked(true) : setPwError(true); }}}
                  placeholder="Password"
                  style={{ textAlign: "center", letterSpacing: "0.2em" }}
                />
              </div>
              {pwError && <p className="error-msg">Incorrect password</p>}
              <button className="btn" style={{ maxWidth: 280, margin: "0 auto" }} onClick={() => { adminPw === ADMIN_PW ? setAdminUnlocked(true) : setPwError(true); }}>Enter Portal</button>
              <p style={{ fontSize: "10px", color: "rgba(201,169,110,0.25)", marginTop: "1rem", letterSpacing: "0.1em" }}>Default password: couple2026</p>
            </div>
          )}

          {view === "admin" && adminUnlocked && (
            <AdminView onSave={handleSave} savedGuests={guests} />
          )}
        </div>
      </div>
    </>
  );
}
