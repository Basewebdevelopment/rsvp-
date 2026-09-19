import { ENV_DEFAULTS } from "../../env.defaults.js";

function firstName(fullName) {
  const trimmed = String(fullName || "").trim();
  if (!trimmed) return "Friend";
  return trimmed.split(/\s+/)[0];
}

export function buildReminderEmail({ guestName } = {}) {
  const couple = ENV_DEFAULTS.VITE_COUPLE_NAMES;
  const date = ENV_DEFAULTS.VITE_WEDDING_DATE;
  const venue = ENV_DEFAULTS.VITE_VENUE_NAME;
  const address = ENV_DEFAULTS.VITE_VENUE_ADDRESS;
  const mapsUrl = ENV_DEFAULTS.VITE_VENUE_MAPS_URL;
  const greeting = guestName ? firstName(guestName) : "Friends & Family";

  const subject = `Today — ${couple}'s Wedding | ${venue}`;

  const text = `Dear ${greeting},

We're so excited to celebrate with you today, ${date}, as Steven and Priscilla begin their marriage.

Venue: ${venue}
Address: ${address}
Directions: ${mapsUrl}

Arrival: Please aim to be seated by 11:45 am
Ceremony begins: 12:00 pm

If you have any trouble finding the venue, please speak to a member of the ushers team on arrival.

We can't wait to share this special day with you.

With love,
${couple}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#3d3428;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf7f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffdf9;border:1px solid rgba(154,115,64,0.18);border-radius:8px;padding:32px 28px;">
          <tr>
            <td style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8a7962;text-align:center;padding-bottom:18px;">
              Wedding Reminder
            </td>
          </tr>
          <tr>
            <td style="font-size:28px;line-height:1.25;color:#2c2418;text-align:center;font-style:italic;padding-bottom:8px;">
              ${couple}
            </td>
          </tr>
          <tr>
            <td style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6b5d4a;text-align:center;padding-bottom:28px;">
              ${date}
            </td>
          </tr>
          <tr>
            <td style="font-size:16px;line-height:1.7;color:#3d3428;">
              <p style="margin:0 0 16px;">Dear ${greeting},</p>
              <p style="margin:0 0 16px;">We're so excited to celebrate with you <strong>today</strong> as Steven and Priscilla begin their marriage.</p>
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9a7340;">Venue</p>
              <p style="margin:0 0 16px;line-height:1.6;">
                <strong>${venue}</strong><br />
                ${address}<br />
                <a href="${mapsUrl}" style="color:#9a7340;">Open directions in Google Maps</a>
              </p>
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9a7340;">Timing</p>
              <p style="margin:0 0 16px;line-height:1.6;">
                Please aim to be seated by <strong>11:45 am</strong><br />
                Ceremony begins at <strong>12:00 pm</strong>
              </p>
              <p style="margin:0 0 16px;">If you have any trouble finding the venue, please speak to a member of the ushers team on arrival.</p>
              <p style="margin:0;">We can't wait to share this special day with you.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:28px;font-size:16px;line-height:1.6;color:#3d3428;font-style:italic;text-align:center;">
              With love,<br />${couple}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
