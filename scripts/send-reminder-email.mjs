import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";
import { loadEnvFile } from "./load-env.mjs";
import { buildReminderEmail } from "./lib/reminder-email.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const defaultCsv = resolve(__dirname, "data/guest-emails.csv");

loadEnvFile();

function usage() {
  console.log(`Send wedding venue reminder emails via Resend.

Usage:
  node scripts/send-reminder-email.mjs --dry-run --file scripts/data/guest-emails.csv
  node scripts/send-reminder-email.mjs --test-to you@example.com
  node scripts/send-reminder-email.mjs --send --file scripts/data/guest-emails.csv

Options:
  --file <path>     CSV with columns: name,email
  --test-to <email> Send one preview email (uses "Guest" as the name)
  --send            Actually send (default is dry-run)
  --dry-run         Print recipients and preview only
  --delay <ms>      Delay between sends (default: 600)

Required env:
  RESEND_API_KEY
  RESEND_FROM       e.g. "Steven & Priscilla <onboarding@resend.dev>"
`);
}

function parseArgs(argv) {
  const args = {
    file: null,
    testTo: null,
    send: false,
    dryRun: false,
    delayMs: 600,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--send") args.send = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--help" || arg === "-h") return { ...args, help: true };
    else if (arg === "--file") args.file = argv[++i];
    else if (arg === "--test-to") args.testTo = argv[++i];
    else if (arg === "--delay") args.delayMs = Number(argv[++i] || 600);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.send && !args.dryRun && !args.testTo) args.dryRun = true;
  return args;
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const header = lines[0].split(",").map((cell) => cell.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const emailIdx = header.indexOf("email");

  if (nameIdx === -1 || emailIdx === -1) {
    throw new Error('CSV must include header row with "name" and "email" columns.');
  }

  const rows = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
    const name = cells[nameIdx];
    const email = cells[emailIdx];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    rows.push({ name: name || "Guest", email });
  }

  return rows;
}

function loadRecipients(filePath) {
  const path = filePath || (existsSync(defaultCsv) ? defaultCsv : null);
  if (!path) {
    throw new Error(
      "No recipient file found. Create scripts/data/guest-emails.csv or pass --file <path>.\n" +
        "See scripts/data/guest-emails.example.csv for format."
    );
  }
  if (!existsSync(path)) throw new Error(`Recipient file not found: ${path}`);
  return parseCsv(readFileSync(path, "utf8"));
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    usage();
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  const recipients = args.testTo
    ? [{ name: "Guest", email: args.testTo }]
    : loadRecipients(args.file);

  if (recipients.length === 0) {
    throw new Error("No valid recipients found.");
  }

  const preview = buildReminderEmail({ guestName: recipients[0].name });
  console.log(`Subject: ${preview.subject}`);
  console.log(`Recipients: ${recipients.length}`);
  console.log(`Mode: ${args.testTo ? "test" : args.send ? "send" : "dry-run"}`);
  console.log("");
  console.log(preview.text);
  console.log("");

  if (args.dryRun && !args.testTo) {
    console.log("Dry run — no emails sent. Pass --send to deliver.");
    console.log("");
    recipients.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} <${row.email}>`);
    });
    if (recipients.length > 5) console.log(`...and ${recipients.length - 5} more`);
    return;
  }

  if (!apiKey) throw new Error("RESEND_API_KEY is not set in .env");
  if (!from) throw new Error('RESEND_FROM is not set in .env (e.g. "Steven & Priscilla <onboarding@resend.dev>")');

  const resend = new Resend(apiKey);
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const { subject, html, text } = buildReminderEmail({ guestName: recipient.name });
    const result = await resend.emails.send({
      from,
      to: [recipient.email],
      subject,
      html,
      text,
    });

    if (result.error) {
      failed += 1;
      console.error(`Failed: ${recipient.name} <${recipient.email}> — ${result.error.message}`);
    } else {
      sent += 1;
      console.log(`Sent: ${recipient.name} <${recipient.email}> (${result.data?.id || "ok"})`);
    }

    if (!args.testTo && args.delayMs > 0) await sleep(args.delayMs);
  }

  console.log("");
  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
