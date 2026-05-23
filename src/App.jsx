import { useState, useEffect, useRef, useMemo } from "react";
import { fetchWeddingData, publishWedding } from "./lib/supabase.js";
import { sharePreviewText } from "./config/env.js";
import { ENV_DEFAULTS } from "../env.defaults.js";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@200;300;400&display=swap');
`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body, #root {
  min-height: 100vh;
  background: #faf7f2;
  font-family: 'Jost', sans-serif;
  color: #3d3428;
}

:root {
  --gold: #9a7340;
  --gold-light: #c4a066;
  --gold-dim: #6b5d4a;
  --cream: #faf7f2;
  --text: #3d3428;
  --text-muted: #6b5d4a;
  --text-soft: #8a7962;
  --heading: #2c2418;
  --surface: rgba(255, 252, 247, 0.94);
  --surface-muted: rgba(255, 255, 255, 0.78);
  --input-bg: rgba(255, 255, 255, 0.98);
  --border: rgba(154, 115, 64, 0.18);
  --border-strong: rgba(154, 115, 64, 0.32);
  --shadow: 0 12px 40px rgba(44, 36, 24, 0.12);
  --shadow-soft: 0 4px 20px rgba(44, 36, 24, 0.06);
}

.page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: url("/images/couple-bg.png");
  background-size: cover;
  background-position: center 18%;
  background-repeat: no-repeat;
}

.page-bg-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg,
      rgba(28, 22, 16, 0.28) 0%,
      rgba(28, 22, 16, 0.08) 32%,
      rgba(250, 245, 235, 0.52) 68%,
      rgba(255, 252, 247, 0.92) 100%
    ),
    radial-gradient(ellipse 90% 60% at 50% 22%, transparent 0%, rgba(28, 22, 16, 0.18) 100%);
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem 1.25rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
}

.hero {
  text-align: center;
  margin-bottom: 1.25rem;
}

.ornament {
  text-align: center;
  color: var(--text-soft);
  font-size: 10px;
  letter-spacing: 0.38em;
  margin-bottom: 1rem;
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
  background: linear-gradient(to right, transparent, var(--border-strong), transparent);
}

.couple-names {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.4rem, 8vw, 3.6rem);
  font-weight: 400;
  color: var(--heading);
  text-align: center;
  line-height: 1.05;
  letter-spacing: 0.01em;
  margin-bottom: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 0.2em 0.45em;
}

.couple-names em {
  font-style: italic;
  font-weight: 300;
}

.couple-amp {
  font-family: 'Jost', sans-serif;
  font-size: 0.42em;
  font-style: normal;
  font-weight: 300;
  color: var(--gold);
  letter-spacing: 0.15em;
}

.date-line {
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.38em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0;
}

.card {
  background: var(--surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 0.5px solid rgba(255, 255, 255, 0.65);
  border-radius: 6px;
  padding: 2rem 1.75rem;
  position: relative;
  box-shadow: var(--shadow);
}

.card::before {
  display: none;
}

.card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.55rem;
  font-weight: 400;
  color: var(--heading);
  text-align: center;
  margin-bottom: 0.35rem;
}

.card-sub {
  font-size: 11.5px;
  color: var(--text-muted);
  text-align: center;
  letter-spacing: 0.12em;
  margin-bottom: 2rem;
}

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
  background: var(--input-bg);
  border: 0.5px solid var(--border);
  border-radius: 4px;
  padding: 0.9rem 1rem;
  font-family: 'Jost', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input::placeholder { color: rgba(107, 93, 74, 0.45); }
.field-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(168, 134, 74, 0.12);
}

.suggest-wrap {
  position: relative;
}

.suggest-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--input-bg);
  border: 0.5px solid var(--border-strong);
  border-radius: 4px;
  box-shadow: var(--shadow);
  max-height: 240px;
  overflow-y: auto;
  z-index: 20;
  list-style: none;
}

.suggest-item {
  width: 100%;
  text-align: left;
  padding: 0.85rem 1rem;
  font-family: 'Jost', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: var(--text);
  background: transparent;
  border: none;
  border-bottom: 0.5px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
}

.suggest-item:last-child {
  border-bottom: none;
}

.suggest-item:hover,
.suggest-item.active {
  background: rgba(154, 115, 64, 0.1);
}

.suggest-item mark {
  background: rgba(154, 115, 64, 0.22);
  color: var(--heading);
  font-weight: 400;
  padding: 0 1px;
  border-radius: 2px;
}

.suggest-hint {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text-soft);
  margin-top: 0.5rem;
  text-align: left;
}

.btn {
  width: 100%;
  padding: 0.95rem 1rem;
  background: rgba(255, 255, 255, 0.75);
  border: 0.5px solid var(--border-strong);
  border-radius: 4px;
  font-family: 'Jost', sans-serif;
  font-size: 10.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--heading);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  margin-top: 0.5rem;
}

.btn:hover { background: rgba(255, 255, 255, 0.95); box-shadow: var(--shadow-soft); }
.btn:active { transform: scale(0.99); }
.btn:disabled { opacity: 0.35; cursor: default; transform: none; }

.btn-primary {
  background: linear-gradient(160deg, #b8925a 0%, #96703a 100%);
  border-color: transparent;
  color: #fffef9;
  box-shadow: 0 4px 16px rgba(154, 115, 64, 0.28);
}

.btn-primary:hover {
  background: linear-gradient(160deg, #c4a066 0%, #a07840 100%);
  box-shadow: 0 6px 20px rgba(154, 115, 64, 0.32);
}

.btn-secondary {
  border-color: var(--border-strong);
  color: var(--text-muted);
  margin-top: 0.75rem;
  font-size: 10px;
}

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
  color: var(--heading);
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
  font-size: clamp(3.2rem, 14vw, 5rem);
  font-weight: 400;
  color: var(--gold);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.result-meal {
  display: inline-block;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  border: 0.5px solid var(--border);
  background: rgba(255, 255, 255, 0.5);
  padding: 0.3rem 1rem;
  border-radius: 1px;
  margin-top: 0.5rem;
}

.error-msg {
  text-align: center;
  color: #b85c4a;
  font-size: 13px;
  letter-spacing: 0.05em;
  padding: 1rem 0;
  animation: fadeUp 0.3s ease;
}

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
  background: rgba(168, 134, 74, 0.06);
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
  color: var(--text-soft);
  margin-top: 0.4rem;
  letter-spacing: 0.1em;
}

.stats-bar {
  display: flex;
  gap: 1px;
  margin-bottom: 1.5rem;
}

.stat {
  flex: 1;
  background: var(--surface-muted);
  border: 0.5px solid var(--border);
  padding: 0.75rem;
  text-align: center;
}

.stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  font-weight: 300;
  color: var(--heading);
  line-height: 1;
}

.stat-lbl {
  font-size: 9.5px;
  letter-spacing: 0.2em;
  color: var(--gold-dim);
  text-transform: uppercase;
  margin-top: 0.2rem;
}

.nav-switch {
  display: inline-flex;
  gap: 0;
  margin: 0 auto 1.5rem;
  padding: 4px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 0.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  box-shadow: var(--shadow-soft);
}

.nav-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.nav-item {
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  border: none;
  transition: color 0.2s, background 0.2s, box-shadow 0.2s;
  background: none;
  font-family: 'Jost', sans-serif;
  white-space: nowrap;
}

.nav-item.active {
  color: var(--heading);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 10px rgba(44, 36, 24, 0.08);
}

.footer-note {
  text-align: center;
  font-size: 10px;
  color: var(--text-soft);
  letter-spacing: 0.15em;
  margin-top: 2rem;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-up { animation: fadeUp 0.6s ease both; }
.fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
.fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }

.guest-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 1rem;
  max-height: 220px;
  overflow-y: auto;
  display: block;
}

.guest-table thead { position: sticky; top: 0; background: rgba(255, 252, 247, 0.98); }

.guest-table th {
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.5rem 0.75rem;
  border-bottom: 0.5px solid var(--border);
  text-align: left;
  font-weight: 400;
}

.guest-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 0.5px solid rgba(168, 134, 74, 0.12);
  color: var(--text);
}

.guest-table tr:last-child td { border-bottom: none; }

.tag {
  display: inline-block;
  font-size: 9px;
  letter-spacing: 0.15em;
  padding: 0.15rem 0.5rem;
  border: 0.5px solid var(--border);
  border-radius: 1px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
}

.admin-gate {
  text-align: center;
}
`;

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += ch;
    }
  }

  values.push(current.trim().replace(/^"|"$/g, ""));
  return values;
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function looksLikeHeaderRow(cells) {
  if (/^\d+$/.test(cells[0]?.trim() || "")) return false;

  const joined = cells.join(" ").toLowerCase();
  return /name|guest|table|seat|meal|first|last|section|category|seating/.test(joined)
    && cells.some((cell) => Number.isNaN(Number(cell.trim())));
}

function pickField(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key].trim();
  }
  return "";
}

function formatTableDisplay(tableNum, seatNum) {
  const parts = [];
  if (tableNum) parts.push(`Table ${tableNum}`);
  if (seatNum) parts.push(`Seat ${seatNum}`);
  return parts.length ? parts.join(" · ") : "—";
}

function normalizeGuestRow(row) {
  const name = pickField(row, [
    "name", "guest_name", "guest", "full_name", "fullname", "guestname",
  ]) || [row.first_name, row.last_name].filter(Boolean).join(" ");

  const tableNumber = pickField(row, ["table", "table_number", "table_no", "tablenumber"]);
  const seat = pickField(row, ["seat", "seat_number", "seat_no", "seatnumber"]);
  const section = pickField(row, ["section", "seating_category", "category", "seating", "area"]);
  const meal = pickField(row, ["meal", "meal_choice", "dietary", "menu"]);

  return {
    name,
    table_number: tableNumber,
    seat,
    section,
    meal,
    table: formatTableDisplay(tableNumber, seat),
  };
}

function isValidGuestRow(guest) {
  const name = normalise(guest.name || "");
  return Boolean(name) && name !== "empty" && name !== "—" && name !== "n/a" && name !== "na";
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const firstCells = parseCSVLine(lines[0]);
  const hasHeader = looksLikeHeaderRow(firstCells);
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const defaultHeaders = ["table", "section", "seat", "name"];
  const headers = hasHeader
    ? firstCells.map(normalizeHeader)
    : defaultHeaders.slice(0, firstCells.length);

  return dataLines
    .map((line) => {
      const values = parseCSVLine(line);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      // Headerless rows with extra columns: map trailing column as guest name.
      if (!hasHeader && values.length > headers.length) {
        row.name = values[values.length - 1] || "";
      }

      return normalizeGuestRow(row);
    })
    .filter(isValidGuestRow);
}

function normalise(str) {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function nameParts(fullName) {
  return normalise(fullName).split(" ").filter(Boolean);
}

function nameInitials(fullName) {
  return nameParts(fullName).map((part) => part[0] || "").join("");
}

function scoreGuestMatch(fullName, query) {
  const name = normalise(fullName);
  const q = normalise(query);
  if (!q) return 0;
  if (name === q) return 1000;
  if (name.startsWith(q)) return 900;

  const parts = nameParts(fullName);
  const initials = nameInitials(fullName);

  if (q.length >= 2 && initials.startsWith(q)) {
    return 560 + q.length;
  }

  if (parts[0]?.startsWith(q)) {
    return 500 + q.length;
  }

  const partIndex = parts.findIndex((part) => part.startsWith(q));
  if (partIndex >= 0) {
    return 420 - partIndex * 15 + q.length;
  }

  const queryTokens = q.split(" ").filter(Boolean);
  if (queryTokens.length > 1) {
    const everyTokenMatches = queryTokens.every((token) =>
      parts.some((part) => part.startsWith(token))
    );
    if (everyTokenMatches) return 480;
  }

  return 0;
}

function searchGuests(guests, query, limit = 8) {
  const q = normalise(query);
  if (!q) return [];

  return guests
    .map((guest) => {
      const display = getGuestDisplay(guest);
      const score = scoreGuestMatch(display.name, q);
      return score > 0 ? { guest, display, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.display.name.localeCompare(b.display.name))
    .slice(0, limit);
}

function highlightName(name, query) {
  const q = normalise(query);
  if (!q) return name;

  const parts = name.split(/\s+/);
  const queryTokens = q.split(" ").filter(Boolean);
  const matchToken = queryTokens[queryTokens.length - 1] || q;

  const highlighted = parts.map((part) => {
    if (part.toLowerCase().startsWith(matchToken)) {
      return (
        <>
          <mark>{part.slice(0, matchToken.length)}</mark>
          {part.slice(matchToken.length)}
        </>
      );
    }
    return part;
  });

  return highlighted.reduce((acc, chunk, index) => {
    if (index === 0) return [chunk];
    return [...acc, " ", chunk];
  }, []);
}

function getGuestDisplay(g) {
  const name = g.name || g.full_name || [g.first_name, g.last_name].filter(Boolean).join(" ") || "Guest";
  const tableNumber = g.table_number || pickField(g, ["table", "table_no"]);
  const seat = g.seat || pickField(g, ["seat_number", "seat_no"]);
  const table = g.table || formatTableDisplay(tableNumber, seat);
  const section = g.section || pickField(g, ["seating_category", "category", "seating"]);
  const meal = g.meal || pickField(g, ["meal_choice", "dietary", "menu"]);
  const detail = section || meal;

  return { name, table, tableNumber, seat, section, meal, detail };
}

function getTableKey(g) {
  return g.table_number || pickField(g, ["table", "table_no"]) || g.table || "—";
}

function uniqueTables(guests) {
  return [...new Set(guests.map(getTableKey))].filter((t) => t && t !== "—").length;
}

function uniqueSections(guests) {
  return [...new Set(guests.map((g) => g.section).filter(Boolean))].length;
}

function Diamond() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="none" stroke="#b8a88a" strokeWidth="0.5"/>
      <path d="M6 3L9 6L6 9L3 6L6 3Z" fill="#b8a88a"/>
    </svg>
  );
}

function PageBackground() {
  return (
    <>
      <div className="page-bg" aria-hidden="true" />
      <div className="page-bg-overlay" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}

function AdminView({ onSave, savedGuests, savedCoupleName, savedWeddingDate, adminPassword }) {
  const [guests, setGuests] = useState(savedGuests || []);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [coupleName, setCoupleName] = useState(savedCoupleName || "");
  const [weddingDate, setWeddingDate] = useState(savedWeddingDate || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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
    e.preventDefault();
    setDrag(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await publishWedding({
        password: adminPassword,
        coupleName,
        weddingDate,
        guests,
      });
      onSave(guests, coupleName, weddingDate);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Failed to publish guest list");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="card fade-up-2">
        <p className="card-title">Couple Details</p>
        <p className="card-sub">How guests will see your wedding</p>

        <div className="field-wrap">
          <label className="field-label">Your names (e.g. Edmond & Claudia)</label>
          <input className="field-input" value={coupleName} onChange={e => setCoupleName(e.target.value)} placeholder="Edmond & Claudia" />
        </div>
        <div className="field-wrap">
          <label className="field-label">Wedding date</label>
          <input className="field-input" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} placeholder="08 August 2026" />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <p className="card-title" style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>Guest List CSV</p>
          <p className="card-sub" style={{ marginBottom: "1.25rem" }}>
            Supports seating-chart CSVs like{" "}
            <span style={{ color: "var(--gold-dim)", letterSpacing: "0.05em" }}>table, section, seat, name</span>
            {" "}or simple lists with{" "}
            <span style={{ color: "var(--gold-dim)", letterSpacing: "0.05em" }}>name, table, meal</span>
            . Empty seats are skipped automatically.
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
              <div className="stat">
                <div className="stat-val">
                  {uniqueSections(guests) || [...new Set(guests.map((g) => g.meal).filter(Boolean))].length || "—"}
                </div>
                <div className="stat-lbl">{uniqueSections(guests) ? "Sections" : "Menus"}</div>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="guest-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Seating</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.slice(0, 12).map((g, i) => {
                    const { name, table, section, meal } = getGuestDisplay(g);
                    const detail = section || meal;
                    return (
                      <tr key={i}>
                        <td>{name}</td>
                        <td><span className="tag">{table}</span></td>
                        <td style={{ color: "var(--text-muted)", fontSize: "11px" }}>{detail || "—"}</td>
                      </tr>
                    );
                  })}
                  {guests.length > 12 && (
                    <tr><td colSpan={3} style={{ color: "var(--text-soft)", fontSize: "11px", textAlign: "center", padding: "0.75rem" }}>+{guests.length - 12} more guests</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSave} disabled={saving || (guests.length === 0 && !coupleName)} style={{ marginTop: "1.5rem" }}>
          {saved ? "✓ Published" : saving ? "Publishing…" : "Save & Publish"}
        </button>
        {saved && <p style={{ textAlign: "center", fontSize: "11px", color: "var(--gold-dim)", marginTop: "0.75rem", letterSpacing: "0.15em" }}>Guests can now find their seats</p>}
      </div>

      <p className="footer-note" style={{ marginTop: "1.5rem" }}>Share the guest link from the Guest tab · Data is saved to Supabase</p>
    </div>
  );
}

function GuestView({ guests, loading }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listOpen, setListOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = name.trim();
    if (q.length < 1) return [];
    return searchGuests(guests, q, 8);
  }, [guests, name]);

  const showSuggestions = listOpen && status === "idle" && name.trim().length >= 1 && suggestions.length > 0;

  const selectGuest = (guest) => {
    const display = getGuestDisplay(guest);
    setName(display.name);
    setResult(display);
    setStatus("found");
    setListOpen(false);
    setActiveIndex(-1);
  };

  const handleSearch = () => {
    if (!name.trim() || loading) return;

    const matches = searchGuests(guests, name, 8);
    if (matches.length === 0) {
      setResult(null);
      setStatus("notfound");
      setListOpen(false);
      return;
    }

    if (activeIndex >= 0 && matches[activeIndex]) {
      selectGuest(matches[activeIndex].guest);
      return;
    }

    if (matches.length === 1) {
      selectGuest(matches[0].guest);
      return;
    }

    const top = matches[0];
    const second = matches[1];
    if (top.score >= 900 || top.score - second.score >= 80) {
      selectGuest(top.guest);
      return;
    }

    setListOpen(true);
    setActiveIndex(0);
  };

  const handleReset = () => {
    setName("");
    setStatus("idle");
    setResult(null);
    setActiveIndex(-1);
    setListOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInputChange = (value) => {
    setName(value);
    setStatus("idle");
    setResult(null);
    setActiveIndex(-1);
    setListOpen(value.trim().length >= 1);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSuggestions && suggestions.length > 0) setListOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Escape") {
      setListOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (loading) {
    return (
      <div className="card fade-up-2" style={{ textAlign: "center" }}>
        <p className="card-title" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Loading guest list…</p>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", letterSpacing: "0.08em", lineHeight: 1.7 }}>
          One moment while we fetch your seating details.
        </p>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="card fade-up-2" style={{ textAlign: "center" }}>
        <p className="card-title" style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Almost Ready</p>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", letterSpacing: "0.08em", lineHeight: 1.7 }}>
          The guest list hasn&apos;t been published yet.<br />Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="card fade-up-2">
      {status === "idle" && (
        <>
          <p className="card-title">Find Your Seat</p>
          <p className="card-sub">Start typing your name — matching guests will appear as you type</p>
          <div className="field-wrap suggest-wrap">
            <label className="field-label" htmlFor="guest-name">Your full name</label>
            <input
              id="guest-name"
              ref={inputRef}
              className="field-input"
              value={name}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => name.trim().length >= 1 && suggestions.length > 0 && setListOpen(true)}
              onBlur={() => setTimeout(() => setListOpen(false), 150)}
              onKeyDown={handleInputKeyDown}
              placeholder="e.g. Sam, Catherine Osei"
              autoComplete="off"
              autoFocus
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="guest-suggestions"
              aria-activedescendant={activeIndex >= 0 ? `guest-option-${activeIndex}` : undefined}
            />
            {showSuggestions && (
              <ul id="guest-suggestions" className="suggest-list" ref={listRef} role="listbox">
                {suggestions.map(({ guest, display }, index) => (
                  <li key={`${display.name}-${index}`} role="option" id={`guest-option-${index}`} aria-selected={index === activeIndex}>
                    <button
                      type="button"
                      className={`suggest-item${index === activeIndex ? " active" : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectGuest(guest)}
                    >
                      {highlightName(display.name, name)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {name.trim().length >= 1 && suggestions.length === 0 && (
              <p className="suggest-hint">No matching names yet — keep typing or check spelling</p>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={!name.trim()}>Find My Seat</button>
        </>
      )}

      {status === "found" && result && (
        <div className="result-box fade-up">
          <p className="result-intro">Welcome to the celebration</p>
          <p className="result-name">{result.name}</p>
          <div className="result-divider" />
          <p className="result-table-label">You are seated at</p>
          <p className="result-table-number">{result.table}</p>
          {result.detail && <span className="result-meal">{result.detail}</span>}
          <div style={{ marginTop: "2rem" }}>
            <button className="btn btn-secondary" onClick={handleReset}>Search Another Guest</button>
          </div>
        </div>
      )}

      {status === "notfound" && (
        <div className="result-box">
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "1rem" }}>Name not found</p>
          <p style={{ fontSize: "12px", color: "var(--text-soft)", letterSpacing: "0.1em", lineHeight: 1.8, marginBottom: "1.5rem" }}>
            Please check the spelling or try a variation of your name.<br />If the issue persists, please speak to a member of staff.
          </p>
          <button className="btn" onClick={handleReset}>Try Again</button>
        </div>
      )}
    </div>
  );
}

function updateShareMeta(coupleName, weddingDate) {
  const { title, description } = sharePreviewText(coupleName, weddingDate);
  const imagePath = `${window.location.origin}/images/og-share.png`;

  document.title = title;

  const setMeta = (selector, content) => {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement("meta");
      const isProperty = selector.startsWith('meta[property="');
      if (isProperty) {
        tag.setAttribute("property", selector.slice(14, -2));
      } else {
        tag.setAttribute("name", selector.slice(11, -2));
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  };

  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:image"]', imagePath);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[name="twitter:image"]', imagePath);
}

export default function App() {
  const [view, setView] = useState("guest");
  const [guests, setGuests] = useState([]);
  const [coupleName, setCoupleName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const ADMIN_PW = "couple2026";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const timeoutMs = 15000;
      try {
        const data = await Promise.race([
          fetchWeddingData(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out. Please refresh the page.")), timeoutMs);
          }),
        ]);
        if (cancelled) return;
        setGuests(data.guests);
        setCoupleName(data.coupleName);
        setWeddingDate(data.weddingDate);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Failed to load wedding data");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loading) updateShareMeta(coupleName, weddingDate);
  }, [loading, coupleName, weddingDate]);

  const handleSave = (g, name, date) => {
    setGuests(g);
    setCoupleName(name);
    setWeddingDate(date);
  };

  const displayCouple = coupleName || ENV_DEFAULTS.VITE_COUPLE_NAMES;
  const displayDate = weddingDate || ENV_DEFAULTS.VITE_WEDDING_DATE;

  return (
    <>
      <style>{FONTS + CSS}</style>
      <PageBackground />

      <div className="page">
        <div className="content">
          <header className="hero">
            <div className="ornament fade-up">
              <div className="ornament-line"><Diamond /><span style={{ letterSpacing: "0.3em" }}>Wedding Reception</span><Diamond /></div>
            </div>

            <h1 className="couple-names fade-up">
              {displayCouple.includes("&") ? (
                <>
                  <em>{displayCouple.split("&")[0].trim()}</em>
                  <span className="couple-amp">&</span>
                  <em>{displayCouple.split("&")[1].trim()}</em>
                </>
              ) : (
                <em>{displayCouple}</em>
              )}
            </h1>

            {displayDate && <p className="date-line fade-up-2">{displayDate}</p>}
          </header>

          {loadError && (
            <div className="card fade-up-2" style={{ marginBottom: "1rem", textAlign: "center" }}>
              <p className="error-msg" style={{ padding: "0.5rem 0 0" }}>{loadError}</p>
              <button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {!loadError && (
          <>
          <div className="nav-wrap fade-up-3">
            <div className="nav-switch">
              <button className={`nav-item ${view === "guest" ? "active" : ""}`} onClick={() => setView("guest")}>Find My Seat</button>
              <button className={`nav-item ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>Couple's Portal</button>
            </div>
          </div>

          {view === "guest" && <GuestView guests={guests} loading={loading} />}

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
              <button className="btn btn-primary" style={{ maxWidth: 280, margin: "0 auto" }} onClick={() => { adminPw === ADMIN_PW ? setAdminUnlocked(true) : setPwError(true); }}>Enter Portal</button>
              <p style={{ fontSize: "10px", color: "var(--text-soft)", marginTop: "1rem", letterSpacing: "0.1em" }}>Default password: couple2026</p>
            </div>
          )}

          {view === "admin" && adminUnlocked && (
            <AdminView
              onSave={handleSave}
              savedGuests={guests}
              savedCoupleName={coupleName}
              savedWeddingDate={weddingDate}
              adminPassword={adminPw}
            />
          )}
          </>
          )}
        </div>
      </div>
    </>
  );
}
