// ─────────────────────────────────────────────────────────────────
//  Dominate Law — Google Sheets Dynamic Data Loader
//
//  SETUP: Replace YOUR_SHEET_ID_HERE with your Google Sheet ID.
//  The Sheet ID is the long string in your Sheet URL:
//  https://docs.google.com/spreadsheets/d/  ← SHEET_ID →  /edit
//
//  Required tabs in your Google Sheet:
//    • podcasts  (columns: episode, title, guest_name, guest_photo_url, poster_image,
//                          episode_url, category, duration, description,
//                          contact_info, spotify_embed, spotify_url, apple_url, audio_source,
//                          transcript_url, speakers, speaker_photos, date_published)
//
//   date_published — Google Sheets date cell OR plain ISO/text date.
//                    Displayed as "Apr 21, 2026" wherever the episode appears.
//
//   Multi-speaker episodes (panel format, ep 21+):
//     speakers       — pipe-separated, mark host with "(Host)" suffix.
//                      Example: "Naren Raja (Host)|David Skinner|Maribel Rivera|Joseph Tiano|Lana Manganello"
//                      Position N = transcript Speaker N (1-indexed).
//     speaker_photos — pipe-separated photo URLs, same order as speakers (optional).
//
//   Audio source types auto-detected:
//     • Libsyn embed iframe (html5-player.libsyn.com/embed/...)  → branded iframe (90px)
//     • Direct .mp3 / .m4a / .wav (e.g. traffic.libsyn.com/...)  → native HTML5 audio card
//     • Google Drive link                                        → Drive preview iframe (legacy)
//    • reviews   (columns: reviewer_name, firm_name, rating, review_text, platform, photo_url)
//    • events    (columns: date_iso, day, month_year, title, description, register_url)
//    • leads     (auto-filled by Google Apps Script — do not edit manually)
//
//  The Sheet must be shared: File → Share → Publish to web → Entire document → Web page → Publish
// ─────────────────────────────────────────────────────────────────

const DL_SHEET_ID        = '1Kqtgrii6peL3DxEp7PO45zSYd3sSeTN-e1tHmkFdLpg';
const DL_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymJUuFFz2lcpz231orJIPf10I9aqoOrp31CVCxX4jNyqyJ7nogwC63oNExXMnWZl9L/exec';

// ── SPAM PROTECTION ────────────────────────────────────────────────
window.dlFormTs = Date.now(); // timestamp when page loaded

// Detect random-looking strings (bot-generated names like "SXsakrnaGQFRNwzWCjLXp")
function dlLooksSpam(text) {
  if (!text) return false;
  const s = text.trim();
  if (s.length > 30) return true; // real names/firms rarely exceed 30 chars
  // Check each word for suspicious mid-word uppercase chars
  const words = s.split(/[\s\-']+/);
  for (const w of words) {
    if (w.length < 4) continue;
    const midUpper = w.slice(1).replace(/[^a-zA-Z]/g, '')
                      .split('').filter(c => c >= 'A' && c <= 'Z').length;
    if (midUpper >= 3) return true; // 3+ uppercase mid-word = random casing = spam
  }
  // 7+ consecutive non-vowel chars (no real word has this)
  if (/[^aeiouAEIOU\s\-']{7,}/.test(s)) return true;
  return false;
}

// Main spam gate: call before any form submission
// honeypotId = the hidden field id on that form
function dlSpamBlock(honeypotId, firstName, lastName) {
  // 1. Honeypot filled — bot
  const hp = document.getElementById(honeypotId || 'dl_hp');
  if (hp && hp.value.trim()) return true;
  // 2. Submitted under 2 seconds from page load — bot
  if (Date.now() - window.dlFormTs < 2000) return true;
  // 3. Names look randomly generated
  if (dlLooksSpam(firstName) || dlLooksSpam(lastName)) return true;
  return false;
}
// ──────────────────────────────────────────────────────────────────

// ── Fetch & parse a sheet tab ─────────────────────────────────────
async function dlFetchSheet(sheetName) {
  if (!DL_SHEET_ID || DL_SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    console.warn('DL Sheets: Please set your Google Sheet ID in js/sheets.js');
    return [];
  }
  const url = `https://docs.google.com/spreadsheets/d/${DL_SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1];
  const json = JSON.parse(jsonStr);
  const cols = json.table.cols.map(c => c.label.trim());
  return json.table.rows
    .filter(row => row.c && row.c.some(cell => cell && cell.v !== null && cell.v !== ''))
    .map(row => {
      const obj = {};
      row.c.forEach((cell, i) => { obj[cols[i]] = (cell && cell.v !== null) ? String(cell.v).trim() : ''; });
      return obj;
    });
}

// ── Helper: initials from name ────────────────────────────────────
function dlInitials(name) {
  return (name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Helper: parse GViz date OR plain ISO string ───────────────────
// Google Sheets stores dates as Date(YYYY,M,D) in the GViz API (month is 0-indexed)
function dlParseDate(str) {
  if (!str) return null;
  const m = String(str).match(/^Date\((\d+),(\d+),(\d+)/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
  return new Date(str);
}

// ── Helper: format a sheet date for display ──────────────────────
// Returns "Apr 21, 2026" — empty string if input is missing/invalid.
function dlFormatDate(str) {
  const d = dlParseDate(str);
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Helper: extract Drive file ID from ANY Drive URL format ──────────────
// Handles all formats users might paste:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/file/d/FILE_ID/edit
//   https://drive.google.com/file/d/FILE_ID
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?export=view&id=FILE_ID
//   https://drive.google.com/uc?id=FILE_ID&export=download
//   https://drive.google.com/thumbnail?id=FILE_ID
//   https://docs.google.com/uc?export=open&id=FILE_ID
//   https://lh3.googleusercontent.com/d/FILE_ID
//   Just a bare file ID (long alphanumeric string)
function dlDriveId(url) {
  if (!url) return '';
  url = url.trim();
  // /file/d/ID or /d/ID
  var m = url.match(/\/d\/([\w-]{20,})/);
  if (m) return m[1];
  // ?id=ID or &id=ID
  m = url.match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  // lh3.googleusercontent.com/d/ID
  m = url.match(/googleusercontent\.com\/d\/([\w-]{20,})/);
  if (m) return m[1];
  // Bare file ID (20+ alphanumeric chars, no slashes/dots — likely a raw ID)
  if (/^[\w-]{20,}$/.test(url)) return url;
  return '';
}

// ── Helper: convert any Google Drive URL to a displayable image URL ──
// Users can paste ANY Drive link format — this auto-converts to thumbnail
function dlDriveImg(url, size = 'w800') {
  if (!url) return '';
  url = url.trim();
  // Already a direct image URL (non-Drive) — return as-is
  if (!url.includes('drive.google.com') && !url.includes('google.com') && !url.includes('googleusercontent.com') && !/^[\w-]{20,}$/.test(url)) {
    return url;
  }
  // Already a working thumbnail URL with size
  if (url.includes('drive.google.com/thumbnail') && url.includes('sz=')) return url;
  // Extract file ID and build thumbnail URL
  const id = dlDriveId(url);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;
  // Not a recognizable Drive URL — return as-is
  return url;
}

// ── Helper: Drive audio → preview iframe URL (most reliable) ──────
// uc?export=view gets blocked; /preview works for publicly shared audio
function dlDriveAudio(url) {
  const id = dlDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

// ── Helper: Drive audio → direct streamable URL for <audio> ───────
// Returns an array of URLs to try in order (fallback chain)
function dlDriveAudioUrls(url) {
  if (!url) return [];
  const id = dlDriveId(url);
  if (id) return [
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://docs.google.com/uc?export=open&id=${id}`,
    `https://drive.google.com/uc?id=${id}&export=download`
  ];
  return [url]; // already a direct MP3/audio URL
}

// ── Helper: parse description into key points + bio ────────────────
// Expected sheet format (each bullet on its own line):
//   Key points
//   • Point one
//   • Point two
//   More about [Name]
//   • Bio sentence one
//   • Bio sentence two
function dlParseDescription(desc) {
  if (!desc) return { keyPoints: [], bioGuestName: '', bio: [] };

  const lines      = desc.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let keyPoints    = [];
  let bio          = [];
  let bioGuestName = '';
  let section      = '';

  for (const line of lines) {
    if (/^key\s*points/i.test(line)) { section = 'kp'; continue; }

    const moreMatch = line.match(/^(?:More\s+about|About)\s+(.+)/i);
    if (moreMatch) { section = 'bio'; bioGuestName = moreMatch[1].trim(); continue; }

    if (/^[•*\-–—>]/.test(line)) {
      const text = line.replace(/^[•*\-–—>]\s*/, '').replace(/\.\s*$/, '').trim();
      if (!text) continue;
      if (section === 'kp')  keyPoints.push(text);
      if (section === 'bio') bio.push(text);
    }
  }

  // ── Fallback: plain text split on periods
  if (keyPoints.length === 0) {
    keyPoints = desc.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 1);
  }

  return { keyPoints, bioGuestName, bio };
}

// ── Helper: parse pipe-separated contact_info string ──────────────
function dlParseContact(str) {
  if (!str) return [];
  return str.split('|').map(item => {
    const t = item.trim();
    const ci = t.indexOf(':');
    if (ci > -1) return { type: t.substring(0, ci).trim(), value: t.substring(ci + 1).trim() };
    return { type: 'Link', value: t };
  }).filter(c => c.value.length > 0);
}

// ── Helper: parse pipe-separated speakers list ───────────────────
// Format: "Naren Raja (Host)|David Skinner|Maribel Rivera"
// Position 0 = Speaker 1, position 1 = Speaker 2, etc.
// Append "(Host)" / "(Co-Host)" / "(Moderator)" to mark host role.
function dlParseSpeakers(str) {
  if (!str) return [];
  return str.split('|').map((raw, i) => {
    const s = raw.trim();
    if (!s) return null;
    const m = s.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (m) {
      const role = /host|moderator/i.test(m[2]) ? 'host' : 'guest';
      return { speakerNum: i + 1, name: m[1].trim(), roleLabel: m[2].trim(), role };
    }
    return { speakerNum: i + 1, name: s, roleLabel: 'Speaker', role: 'guest' };
  }).filter(Boolean);
}

// ── Helper: classify an audio_source URL ──────────────────────────
// Returns: 'libsyn-embed' | 'audio-file' | 'drive' | 'other'
function dlClassifyAudio(url) {
  if (!url) return 'other';
  const u = url.trim();
  if (/html5-player\.libsyn\.com\/embed/i.test(u)) return 'libsyn-embed';
  if (/\.(mp3|m4a|wav|ogg|aac)(\?|$)/i.test(u))   return 'audio-file';
  if (/traffic\.libsyn\.com|libsynpro\.com/i.test(u)) return 'audio-file';
  if (/drive\.google\.com/i.test(u))               return 'drive';
  // Common embed iframe hosts (Spotify, Apple, etc) the user may paste here too
  if (/\/embed\//i.test(u))                        return 'libsyn-embed';
  return 'other';
}

function dlEsc(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function dlPick(row, names) {
  if (!row) return '';
  const keys = Object.keys(row);
  const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const name of names) {
    const direct = row[name];
    if (direct !== undefined && direct !== null && String(direct).trim() !== '') return String(direct).trim();
    const wanted = norm(name);
    const key = keys.find(k => norm(k) === wanted);
    if (key && row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return String(row[key]).trim();
  }
  return '';
}

function dlSlug(value) {
  return String(value || 'item')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'item';
}

// ── Custom episode slug overrides (managed here, not in the sheet) ──
// Use this to give long-titled episodes clean, short, SEO-friendly slugs
// without needing a 'slug' column in the Google Sheet.
// Whenever you add a new entry here, also update sitemap.xml to match.
const DL_EPISODE_SLUGS = {
  23: 'building-a-law-firm-with-control-clarity-confidence',
  // 3:  'how-to-build-and-grow-a-law-practice-gary-bennett',
  // 11: 'mindfulness-and-lawyer-wellbeing-jeena-cho',
  // 16: 'always-look-from-the-other-perspective-daniel-forouzan',
  // …add more episode-number → slug entries as needed
};

// ── Helper: resolve or auto-generate a URL slug for a podcast episode ──
// Precedence:
//   1. Manual override from DL_EPISODE_SLUGS (in this file)
//   2. 'slug' column on the sheet (if you ever decide to use it)
//   3. Auto-generated from ep.title (capped at 72 chars)
// Numeric ?ep=21 URLs still work for backward compat.
function dlEpisodeSlug(ep) {
  const epNum = parseInt(ep.episode, 10);
  if (DL_EPISODE_SLUGS[epNum]) return DL_EPISODE_SLUGS[epNum];
  if (ep.slug && ep.slug.trim()) return ep.slug.trim();
  return dlSlug(ep.title);
}

function dlVimeoEmbed(url) {
  if (!url) return '';
  const raw = String(url).trim();
  const idMatch = raw.match(/player\.vimeo\.com\/video\/(\d+)/i) || raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (!idMatch) return raw;
  const id = idMatch[1];
  const hParam = raw.match(/[?&]h=([^&]+)/i);
  const pathHash = raw.match(/vimeo\.com\/\d+\/([A-Za-z0-9]+)/i);
  const hash = hParam ? hParam[1] : (pathHash ? pathHash[1] : '');
  return `https://player.vimeo.com/video/${id}${hash ? `?h=${encodeURIComponent(hash)}` : ''}`;
}

function dlSplitKeynotes(text, titleFromSheet) {
  const lines = String(text || '').split(/\r?\n/)
    .map(line => line.trim().replace(/^(?:[-*]|\d+[.)])\s*/, ''))
    .filter(Boolean);
  if (!lines.length) return [];
  if (titleFromSheet && lines[0].toLowerCase() === titleFromSheet.toLowerCase()) return lines.slice(1);
  return lines;
}

function dlNormalizeWebinarReplay(row, index) {
  const keynotesRaw   = dlPick(row, ['keymotes', 'keynotes', 'key notes', 'takeaways', 'description']);
  const explicitTitle = dlPick(row, ['title', 'webinar title', 'replay title', 'name']);
  // Reuse the podcast-style parser — strips "Key points"/"About …" headers AND every bullet
  // character (•, *, -, –, —, >) so we never get double bullets on the page.
  const parsedNotes   = dlParseDescription(keynotesRaw);
  const title         = explicitTitle || parsedNotes.keyPoints[0] || `Webinar Replay ${index + 1}`;
  const notes         = explicitTitle ? parsedNotes.keyPoints : parsedNotes.keyPoints.slice(1);
  const dateRaw       = dlPick(row, ['date', 'date_iso', 'published date', 'date published']);
  const vimeoLink     = dlPick(row, ['vimeo_url', 'vimeo links', 'vimeo link', 'vimeo', 'video link', 'video url', 'replay link', 'link', 'url']);
  const thumbRaw      = dlPick(row, ['thumbnail_url', 'thumbnail', 'image', 'image_url', 'cover']);
  const speakers      = dlPick(row, ['speakers', 'panelists', 'speaker', 'hosts']);
  const duration      = dlPick(row, ['duration', 'length', 'runtime']);
  const category      = dlPick(row, ['category', 'topic', 'type', 'tag']);
  const id            = dlPick(row, ['id', 'slug', 'replay id', 'webinar id', 'webinarID']) || dlSlug(`${title}-${dateRaw || index + 1}`);
  const embedUrl      = dlVimeoEmbed(vimeoLink);

  // Extract Vimeo video ID for thumbnail auto-fetch
  const vimeoIdMatch  = vimeoLink.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  const vimeoId       = vimeoIdMatch ? vimeoIdMatch[1] : '';
  const thumbnailUrl  = thumbRaw ? dlDriveImg(thumbRaw, 'w800') : '';

  return {
    id, index, title, notes, dateRaw,
    dateLabel: dlFormatDate(dateRaw) || dateRaw,
    vimeoLink, embedUrl, vimeoId, thumbnailUrl,
    speakers, duration, category
  };
}

function dlGateKey(type, id) {
  return `dl_unlocked_${type}_${id || 'item'}`;
}

// Unlock is per-type (fill once = access all episodes/replays of that type).
// 'id' is accepted for backwards compat but we always check/set the 'all' key.
function dlIsUnlocked(type) {
  try { return localStorage.getItem(dlGateKey(type, 'all')) === '1'; } catch (e) { return false; }
}

function dlMarkUnlocked(type) {
  try { localStorage.setItem(dlGateKey(type, 'all'), '1'); } catch (e) {}
}

// ── Card-level gate form builder ─────────────────────────────────
// Renders a compact gate form that lives directly inside the card.
// All 5 fields are required. On submit calls dlCardGateSubmit().
function dlCardGateHtml(type, id, redirectPath, title, vimeoLink) {
  const formId   = `cg-${type}-${dlSlug(id)}`;
  const btnLabel = type === 'podcast' ? '🎙️ Listen Now' : '▶ Watch Replay';
  return `
    <form class="cg-form" id="${dlEsc(formId)}"
          data-type="${dlEsc(type)}" data-id="${dlEsc(id)}"
          data-redirect="${dlEsc(redirectPath)}" data-title="${dlEsc(title)}"
          ${vimeoLink ? `data-vimeo="${dlEsc(vimeoLink)}"` : ''}
          onsubmit="dlCardGateSubmit(event)">
      <div class="cg-row">
        <input name="first" type="text"  placeholder="First Name *"  required autocomplete="given-name">
        <input name="last"  type="text"  placeholder="Last Name *"   required autocomplete="family-name">
      </div>
      <div class="cg-row">
        <input name="email" type="email" placeholder="Email *"       required autocomplete="email">
        <input name="phone" type="tel"   placeholder="Phone *"       required autocomplete="tel">
      </div>
      <input name="firm" type="text" placeholder="Firm Name *" required autocomplete="organization">
      <p class="cg-error" role="alert"></p>
      <button type="submit">${btnLabel}</button>
    </form>`;
}

// ── Card gate submit handler (global — called from inline onsubmit) ─
async function dlCardGateSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const get  = name => (form.querySelector(`[name="${name}"]`)?.value || '').trim();

  const first = get('first'), last = get('last');
  const email = get('email'), phone = get('phone'), firm = get('firm');
  const errEl = form.querySelector('.cg-error');
  const btn   = form.querySelector('button[type="submit"]');

  const setErr = msg => { if (errEl) errEl.textContent = msg; };
  setErr('');

  if (typeof dlSpamBlock === 'function' && dlSpamBlock('', first, last)) return;
  if (!first || !last || !email || !phone || !firm) {
    setErr('All fields are required.'); return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Unlocking…'; }

  const type         = form.dataset.type;
  const id           = form.dataset.id;
  const redirectPath = form.dataset.redirect;

  const payload = {
    form:      type === 'podcast' ? 'podcast_gate' : 'webinar_replay_gate',
    tab:       type === 'podcast' ? 'Podcast Gate' : 'Webinar Replay Gate',
    first_name: first, last_name: last, email, phone, firm_name: firm,
    page_url:  window.location.href,
  };
  if (type === 'podcast') {
    payload.podcast_episode = id;
    payload.podcast_title   = form.dataset.title || '';
  } else {
    payload.webinar_title   = form.dataset.title || '';
    payload.replay_id       = id;
    payload.vimeo_link      = form.dataset.vimeo || '';
  }

  try {
    await dlSendGateLead(payload);
    dlMarkUnlocked(type);          // unlock ALL episodes of this type
    window.location.href = redirectPath;
  } catch (e) {
    setErr('Something went wrong. Please try again.');
    if (btn) { btn.disabled = false; btn.textContent = type === 'podcast' ? '🎙️ Listen Now' : '▶ Watch Replay'; }
  }
}

function dlSetGateMessage(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message || '';
}

async function dlSendGateLead(payload) {
  await fetch(DL_APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}

function dlEnsurePodcastGateEl() {
  let gate = document.getElementById('ep-gate-section');
  if (gate) return gate;
  const before = document.getElementById('ep-native-audio-section') || document.getElementById('ep-audio-section') || document.getElementById('ep-embed-section');
  if (!before || !before.parentNode) return null;
  gate = document.createElement('section');
  gate.id = 'ep-gate-section';
  gate.className = 'ep-gate-section';
  gate.style.display = 'none';
  before.parentNode.insertBefore(gate, before);
  return gate;
}

function dlRenderPodcastGate(ep) {
  const gate = dlEnsurePodcastGateEl();
  if (!gate) return;
  ['ep-native-audio-section', 'ep-audio-section', 'ep-embed-section'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  gate.style.display = 'block';
  gate.innerHTML = `
    <div class="ep-audio-player-wrap">
      <form class="dl-gate-card" id="podcast-gate-form" onsubmit="dlSubmitPodcastGate(event)">
        <div class="dl-hp" aria-hidden="true"><input type="text" id="podcast_dl_hp" tabindex="-1" autocomplete="off"></div>
        <div class="dl-gate-kicker">Free Access</div>
        <h2>Unlock This Podcast Episode</h2>
        <p>Enter your details once to listen to this episode and help us share more practical law firm growth conversations.</p>
        <div class="dl-gate-grid">
          <label>First Name <input id="podGateFirst" type="text" autocomplete="given-name" required></label>
          <label>Last Name <input id="podGateLast" type="text" autocomplete="family-name" required></label>
        </div>
        <div class="dl-gate-grid">
          <label>Email <input id="podGateEmail" type="email" autocomplete="email" required></label>
          <label>Phone <input id="podGatePhone" type="tel" autocomplete="tel" required></label>
        </div>
        <label>Firm Name <input id="podGateFirm" type="text" autocomplete="organization" required></label>
        <div class="dl-gate-error" id="podGateError"></div>
        <button class="btn btn-primary" type="submit">Unlock Episode</button>
      </form>
    </div>`;
}

function dlRenderPodcastAudio(ep) {
  const gate = document.getElementById('ep-gate-section');
  if (gate) gate.style.display = 'none';

  ['ep-native-audio-section', 'ep-audio-section', 'ep-embed-section'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (ep.spotify_embed) {
    const sec    = document.getElementById('ep-embed-section');
    const iframe = document.getElementById('ep-spotify-iframe');
    if (sec) sec.style.display = 'block';
    if (iframe) {
      iframe.src    = ep.spotify_embed;
      iframe.height = 152;
    }
  } else if (ep.audio_source) {
    const kind = dlClassifyAudio(ep.audio_source);
    if (kind === 'audio-file') {
      const sec     = document.getElementById('ep-native-audio-section');
      const audioEl = document.getElementById('ep-native-audio');
      const titleEl = document.getElementById('ep-libsyn-title');
      if (sec) sec.style.display = 'block';
      if (audioEl) audioEl.src = ep.audio_source;
      if (titleEl) titleEl.textContent = `Episode #${ep.episode}: ${ep.title}`;
    } else if (kind === 'libsyn-embed') {
      const sec    = document.getElementById('ep-embed-section');
      const iframe = document.getElementById('ep-spotify-iframe');
      if (sec) sec.style.display = 'block';
      if (iframe) {
        iframe.src    = ep.audio_source;
        iframe.height = ep.audio_source.includes('libsyn') ? 90 : 152;
      }
    } else {
      const sec    = document.getElementById('ep-audio-section');
      const player = document.getElementById('ep-audio-player');
      if (sec) sec.style.display = 'block';
      if (player) player.src = dlDriveAudio(ep.audio_source);
    }
  }
}

async function dlSubmitPodcastGate(event) {
  event.preventDefault();
  const get = id => (document.getElementById(id)?.value || '').trim();
  const first = get('podGateFirst');
  const last  = get('podGateLast');
  const email = get('podGateEmail');
  const ep = window.dlCurrentPodcastEpisode || {};

  const phone = get('podGatePhone');
  const firm  = get('podGateFirm');
  if (typeof dlSpamBlock === 'function' && dlSpamBlock('podcast_dl_hp', first, last)) return;
  if (!first || !last || !email || !phone || !firm) {
    dlSetGateMessage('podGateError', 'All fields are required.');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Unlocking...'; }

  try {
    await dlSendGateLead({
      form: 'podcast_gate',
      tab: 'Podcast Gate',
      first_name: first,
      last_name: last,
      email: email,
      phone: get('podGatePhone'),
      firm_name: get('podGateFirm'),
      podcast_episode: ep.episode || '',
      podcast_title: ep.title || '',
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    });
    dlMarkUnlocked('podcast');
    dlRenderPodcastAudio(ep);
  } catch (e) {
    dlSetGateMessage('podGateError', 'Something went wrong. Please try again.');
    if (btn) { btn.disabled = false; btn.textContent = 'Unlock Episode'; }
  }
}

// ── HOME PAGE: Load latest podcast into popup + announcement bar ──
async function dlLoadLatestPodcast() {
  try {
    const episodes = await dlFetchSheet('podcasts');
    if (!episodes.length) return;
    const ep = episodes[episodes.length - 1]; // last row = newest

    // Log audio column status for debugging
    if (!ep.audio_source && !('audio_source' in ep)) {
      console.warn('DL Sheets: "audio_source" column not found in podcasts tab. Add it to enable inline playback.');
    } else if (!ep.audio_source) {
      console.warn('DL Sheets: "audio_source" is empty for the latest episode. Paste a Drive/MP3 link to enable playback.');
    }

    // Announcement bar — inline mini-player (NEVER redirects)
    const announce = document.querySelector('.announce');
    if (announce) {
      const driveId  = dlDriveId(ep.audio_source);
      const epHref   = `/podcast-episode/?ep=${encodeURIComponent(dlEpisodeSlug(ep))}`;
      const epLabel  = `Ep #${ep.episode}: ${ep.title}`;

      announce.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:10px 16px;';
      announce.innerHTML = `
        <span class="a-pulse"></span>
        <strong style="color:var(--gold3)">NEW:</strong>
        <span style="color:rgba(255,255,255,.85);max-width:340px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${epLabel}</span>
        <span style="color:rgba(255,255,255,.3)">·</span>
        <a href="${epHref}" style="color:var(--gold3);text-decoration:underline;font-weight:700;white-space:nowrap;">Listen Now →</a>
      `;
    }

    // Popup — podcast card (banner-led template)
    const epNum         = parseInt(ep.episode, 10) || 0;
    const speakerCount  = ep.speakers ? ep.speakers.split('|').map(s => s.trim()).filter(Boolean).length : 0;
    const isPanel       = speakerCount > 1;
    const photoEl       = document.getElementById('hp-pod-img');
    const epNumEl       = document.getElementById('hp-pod-ep');
    const flagEl        = document.getElementById('hp-pod-flag');
    const bylineEl      = document.getElementById('hp-pod-byline');
    const titleEl       = document.getElementById('hp-pod-title');
    const bannerLinkEl  = document.getElementById('hp-pod-banner-link');
    const listenBtn     = document.getElementById('hp-pod-link');
    const epHref        = `/podcast-episode/?ep=${encodeURIComponent(dlEpisodeSlug(ep))}`;

    const fallbackEl = document.getElementById('hp-pod-fallback');
    if (photoEl) {
      const photoUrl = ep.guest_photo_url ? dlDriveImg(ep.guest_photo_url, 'w800') : '';
      // Reset any prior hidden state from a failed earlier load
      photoEl.style.display = '';
      if (fallbackEl) fallbackEl.style.display = 'none';

      if (photoUrl) {
        photoEl.alt = `Episode ${ep.episode}: ${ep.title}`;
        // Attach onerror BEFORE setting src so failures are caught
        photoEl.onerror = function () {
          this.style.display = 'none';
          if (fallbackEl) fallbackEl.style.display = 'flex';
        };
        photoEl.src = photoUrl;
      } else {
        // No photo URL on the sheet row — show the DL fallback
        photoEl.style.display = 'none';
        if (fallbackEl) fallbackEl.style.display = 'flex';
      }
    }
    if (epNumEl)      epNumEl.textContent  = `Episode ${ep.episode}`;
    if (flagEl)       flagEl.classList.toggle('visible', epNum >= 21);
    if (bylineEl) {
      const baseByline = isPanel
        ? `Featuring a panel of ${speakerCount - 1}`
        : (ep.guest_name ? `With ${ep.guest_name}` : 'Dominate Law Podcast');
      const dateStr = dlFormatDate(ep.date_published);
      bylineEl.textContent = dateStr ? `${baseByline} · ${dateStr}` : baseByline;
    }
    if (titleEl)      titleEl.textContent  = ep.title;
    if (bannerLinkEl) bannerLinkEl.href    = epHref;
    if (listenBtn)    listenBtn.href       = epHref;
  } catch (e) {
    console.warn('DL Sheets: Could not load latest podcast', e);
  }
}

// ── HOME PAGE: Load next upcoming event into popup ────────────────
async function dlLoadNextEvent() {
  try {
    const events = await dlFetchSheet('events');
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Sort ascending and find first event on or after today
    const sorted   = events.slice().sort((a, b) => dlParseDate(a.date_iso) - dlParseDate(b.date_iso));
    const upcoming = sorted.find(ev => {
      const d = dlParseDate(ev.date_iso);
      return d && d >= today;
    });

    // If no upcoming event, hide the event card entirely
    if (!upcoming) {
      const card = document.querySelector('.hp-card:last-child');
      if (card) card.style.display = 'none';
      return;
    }

    const dayEl   = document.getElementById('hp-evt-day');
    const monthEl = document.getElementById('hp-evt-month');
    const titleEl = document.getElementById('hp-evt-title');
    const descEl  = document.getElementById('hp-evt-desc');
    const btnEl   = document.querySelector('.hp-btn-event');

    if (dayEl)   dayEl.textContent   = upcoming.day        || '';
    if (monthEl) monthEl.textContent = upcoming.month_year || '';
    if (titleEl) titleEl.textContent = upcoming.title      || 'Upcoming Event';
    if (descEl)  descEl.textContent  = upcoming.description || '';
    if (btnEl) {
      btnEl.href = upcoming.register_url || '/events';
    }
  } catch (e) {
    console.warn('DL Sheets: Could not load next event', e);
    const card = document.querySelector('.hp-card:last-child');
    if (card) card.style.display = 'none';
  }
}

// Episodes whose tightly-cropped headshots need top-anchored crop
// (default 30%-down crop chops off foreheads on these specific photos).
// Add more episode numbers here if other guests have the same issue.
const DL_TOP_CROP_EPISODES = new Set([2, 4, 10]);

// ── Card gate reveal/hide (click-inside-card form behaviour) ────────
function dlRevealCardGate(cardEl) {
  // Close every other card that already has a form open
  document.querySelectorAll('.ep-card-gate.open').forEach(openGate => {
    if (openGate.closest('.ep-photo-card, .wr-card') === cardEl) return;
    openGate.classList.remove('open');
    const sibling = openGate.closest('.ep-photo-card, .wr-card')?.querySelector('.ep-card-preview');
    if (sibling) sibling.style.display = '';
  });

  const preview = cardEl.querySelector('.ep-card-preview');
  const gate    = cardEl.querySelector('.ep-card-gate');
  if (!gate || gate.classList.contains('open')) return;
  if (preview) preview.style.display = 'none';
  gate.classList.add('open');
  setTimeout(() => cardEl.querySelector('.cg-form input')?.focus(), 50);
}

function dlHideCardGate(btn) {
  const cardEl  = btn.closest('.ep-photo-card, .wr-card');
  const preview = cardEl?.querySelector('.ep-card-preview');
  const gate    = cardEl?.querySelector('.ep-card-gate');
  if (!cardEl) return;
  if (gate)    gate.classList.remove('open');
  if (preview) preview.style.display = '';
}

// ── Build a single episode card (shared by home + podcast page) ──
function dlBuildEpisodeCard(ep) {
  const epNum    = parseInt(ep.episode, 10) || 0;
  const isNew    = epNum >= 21;
  const speakerCount = ep.speakers ? ep.speakers.split('|').map(s => s.trim()).filter(Boolean).length : 0;
  const isPanel  = speakerCount > 1;
  const photo    = ep.guest_photo_url ? dlDriveImg(ep.guest_photo_url, 'w800') : '';
  const initials = dlInitials(ep.guest_name);
  const byLine   = isPanel ? `Panel of ${speakerCount - 1}` : (ep.guest_name || 'Dominate Law');
  const byIcon   = isPanel ? '👥' : '👤';
  const dateStr  = dlFormatDate(ep.date_published);
  const meta     = [dateStr, ep.category, ep.duration].filter(Boolean).join(' · ');
  const imgStyle = DL_TOP_CROP_EPISODES.has(epNum)
    ? ' style="object-fit:contain;object-position:center top;background:linear-gradient(135deg,var(--brown),var(--brown3))"'
    : '';
  const unlocked = dlIsUnlocked('podcast');
  const epHref   = `/podcast-episode/?ep=${encodeURIComponent(dlEpisodeSlug(ep))}`;

  const thumbHtml = `
    <div class="ep-photo-img">
      ${photo ? `<img src="${photo}" alt="${ep.title}" loading="lazy"${imgStyle}
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
      <div class="ep-photo-fallback" style="${photo ? 'display:none' : ''}">${initials}</div>
      <span class="ep-photo-num">Ep ${ep.episode}</span>
      ${isNew ? '<span class="ep-photo-flag">NEW</span>' : ''}
      <div class="ep-play-btn${unlocked ? '' : ' ep-lock-icon'}" aria-hidden="true">
        ${unlocked
          ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'}
      </div>
    </div>`;

  if (unlocked) {
    return `
      <a href="${epHref}" class="ep-photo-card${isNew ? ' is-new' : ''}" aria-label="Ep ${ep.episode}: ${ep.title}">
        ${thumbHtml}
        <div class="ep-photo-body">
          <div class="ep-card-preview">
            ${meta ? `<div class="ep-photo-meta">${meta}</div>` : ''}
            <h3 class="ep-photo-title">${ep.title}</h3>
            <div class="ep-photo-by"><span>${byIcon}</span>&nbsp;${byLine}</div>
            <span class="ep-photo-cta">Listen Now <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </a>`;
  }

  return `
    <div class="ep-photo-card ep-card-locked${isNew ? ' is-new' : ''}"
         onclick="dlRevealCardGate(this)" aria-label="Ep ${ep.episode}: ${ep.title}">
      ${thumbHtml}
      <div class="ep-photo-body">
        <div class="ep-card-preview">
          ${meta ? `<div class="ep-photo-meta">${meta}</div>` : ''}
          <h3 class="ep-photo-title">${ep.title}</h3>
          <div class="ep-photo-by"><span>${byIcon}</span>&nbsp;${byLine}</div>
          <span class="ep-photo-cta">🔒 Click to Unlock</span>
        </div>
        <div class="ep-card-gate">
          <div class="ep-gate-head">
            <span class="ep-gate-kicker">Free Access</span>
            <button class="ep-gate-back" onclick="event.stopPropagation();dlHideCardGate(this)" type="button">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6 8L3 5l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Back
            </button>
          </div>
          <form class="cg-form"
                data-type="podcast" data-id="${ep.episode}"
                data-redirect="${epHref}" data-title="${dlEsc(ep.title)}"
                onsubmit="event.stopPropagation();dlCardGateSubmit(event)">
            <div class="cg-row">
              <input name="first" type="text"  placeholder="First Name *"  required autocomplete="given-name">
              <input name="last"  type="text"  placeholder="Last Name *"   required autocomplete="family-name">
            </div>
            <div class="cg-row">
              <input name="email" type="email" placeholder="Email *"       required autocomplete="email">
              <input name="phone" type="tel"   placeholder="Phone *"       required autocomplete="tel">
            </div>
            <input name="firm" type="text" placeholder="Firm Name *" required autocomplete="organization">
            <p class="cg-error" role="alert"></p>
            <button type="submit">🎙️ Listen Now</button>
          </form>
        </div>
      </div>
    </div>`;
}

// ── HOME PAGE: Load latest 6 episodes into homepage podcast grid ─
async function dlLoadHomePodcastGrid() {
  const grid = document.getElementById('hp-pod-grid');
  if (!grid) return;
  try {
    const episodes = await dlFetchSheet('podcasts');
    if (!episodes.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,.4);padding:32px">No episodes yet.</div>'; return; }
    const latest6 = episodes.slice().reverse().slice(0, 6);
    grid.innerHTML = latest6.map(dlBuildEpisodeCard).join('');
  } catch (e) {
    console.warn('DL Sheets: Could not load home podcast grid', e);
  }
}

// ── PODCAST PAGE: Render episodes with numbered pagination ────────
async function dlLoadPodcastGrid() {
  const grid = document.getElementById('episodes-grid');
  if (!grid) return;
  try {
    const episodes = await dlFetchSheet('podcasts');
    if (!episodes.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No episodes found.</p>'; return; }

    document.querySelectorAll('#ticker-ep-count, #pod-count').forEach(el => el.textContent = episodes.length);

    const PAGE_SIZE = 10;
    const all = episodes.slice().reverse(); // newest first
    const totalPages = Math.ceil(all.length / PAGE_SIZE);
    let currentPage = 0;

    // Pagination bar (stays at bottom of grid)
    const paginationWrap = document.createElement('div');
    paginationWrap.id = 'pod-pagination';
    grid.innerHTML = '';
    grid.appendChild(paginationWrap);

    function renderPage(page) {
      currentPage = Math.max(0, Math.min(page, totalPages - 1));
      // Remove all episode cards, keep pagination
      Array.from(grid.children).forEach(child => { if (child !== paginationWrap) child.remove(); });

      const batch = all.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
      batch.forEach(ep => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = dlBuildEpisodeCard(ep).trim();
        const card = wrapper.firstElementChild;
        grid.insertBefore(card, paginationWrap);
      });

      buildPagination();
      // Scroll to episodes section smoothly
      if (currentPage > 0) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function buildPagination() {
      if (totalPages <= 1) { paginationWrap.style.display = 'none'; return; }
      paginationWrap.innerHTML = '';

      const prev = document.createElement('button');
      prev.innerHTML = '&#8592;';
      prev.className = 'pod-page-btn pod-page-nav';
      prev.disabled = currentPage === 0;
      prev.addEventListener('click', () => renderPage(currentPage - 1));
      paginationWrap.appendChild(prev);

      for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        btn.className = 'pod-page-btn' + (i === currentPage ? ' active' : '');
        btn.addEventListener('click', () => renderPage(i));
        paginationWrap.appendChild(btn);
      }

      const next = document.createElement('button');
      next.innerHTML = '&#8594;';
      next.className = 'pod-page-btn pod-page-nav';
      next.disabled = currentPage >= totalPages - 1;
      next.addEventListener('click', () => renderPage(currentPage + 1));
      paginationWrap.appendChild(next);
    }

    renderPage(0);
  } catch (e) {
    console.warn('DL Sheets: Could not load podcast grid', e);
  }
}

// ── EPISODE DETAIL PAGE: Load single episode ─────────────────────
async function dlLoadEpisodePage() {
  const params   = new URLSearchParams(window.location.search);
  const epParam  = params.get('ep');          // slug or number
  const heroEl   = document.getElementById('ep-hero-content');
  const crumbEl  = document.getElementById('ep-breadcrumb');

  if (!epParam) {
    if (heroEl) heroEl.innerHTML = `<div class="ep-not-found"><h2>Episode Not Found</h2><p>No episode provided.</p><a href="/podcast" class="btn btn-primary" style="margin-top:16px">Browse All Episodes →</a></div>`;
    return;
  }

  try {
    const episodes = await dlFetchSheet('podcasts');
    if (!episodes.length) { window.location.href = '/podcast'; return; }

    // Match by slug first, then by episode number (backwards compat with ?ep=21 links)
    const idx = episodes.findIndex(e =>
      dlEpisodeSlug(e) === epParam || String(e.episode) === epParam
    );
    if (idx === -1) {
      if (heroEl) heroEl.innerHTML = `<div class="ep-not-found"><h2>Episode Not Found</h2><p>This episode doesn't exist yet.</p><a href="/podcast" class="btn btn-primary" style="margin-top:16px">Browse All Episodes →</a></div>`;
      return;
    }

    const ep      = episodes[idx];
    const epSlug  = dlEpisodeSlug(ep);
    const prev    = idx > 0 ? episodes[idx - 1] : null;
    const next    = idx < episodes.length - 1 ? episodes[idx + 1] : null;
    const canonicalUrl = `https://www.dominatelaw.com/podcast-episode/?ep=${encodeURIComponent(epSlug)}`;
    const pageUrl      = encodeURIComponent(canonicalUrl);
    const pageTitle    = encodeURIComponent(`Episode #${ep.episode}: ${ep.title} — Dominate Law Podcast`);

    // ── Dynamic SEO meta (canonical + description) ──────────────────
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) { canonicalEl = document.createElement('link'); canonicalEl.rel = 'canonical'; document.head.appendChild(canonicalEl); }
    canonicalEl.href = canonicalUrl;

    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) { descEl = document.createElement('meta'); descEl.name = 'description'; document.head.appendChild(descEl); }
    // Parse description once here — reused later for Key Points + bio rendering
    const parsedDescription = dlParseDescription(ep.description);
    const descSnippet = parsedDescription.keyPoints[0]
      ? parsedDescription.keyPoints[0].slice(0, 160)
      : `Episode #${ep.episode} of the Dominate Law Podcast — ${ep.title}.`;
    descEl.content = descSnippet;

    // ── PodcastEpisode JSON-LD: populate the placeholder schema with real episode data
    const ldEl = document.getElementById('ep-jsonld');
    if (ldEl) {
      try {
        const ld = JSON.parse(ldEl.textContent);
        ld.name          = ep.title;
        ld.url           = canonicalUrl;
        ld.description   = descSnippet;
        ld.datePublished = ep.date_published || '';
        const dur = String(ep.duration || '').match(/(\d+)\s*min/i);
        if (dur) ld.duration = `PT${dur[1]}M`;
        if (ep.audio_source && /\.mp3(\?|$)/i.test(ep.audio_source)) {
          ld.associatedMedia = { '@type': 'AudioObject', contentUrl: ep.audio_source, encodingFormat: 'audio/mpeg' };
        }
        ldEl.textContent = JSON.stringify(ld);
      } catch (e) { /* malformed placeholder — skip */ }
    }

    // ── Dynamic OG meta — better social previews per episode
    const setOg = (prop, val) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.content = val;
    };
    setOg('og:title',       ep.title.length > 50 ? ep.title : `${ep.title} | Dominate Law Podcast`);
    setOg('og:description', descSnippet);
    setOg('og:url',         canonicalUrl);
    if (ep.poster_image)         setOg('og:image', dlDriveImg(ep.poster_image, 'w1200'));
    else if (ep.guest_photo_url) setOg('og:image', dlDriveImg(ep.guest_photo_url, 'w1200'));

    // ── Speakers (multi-speaker / panel episodes, ep 21+)
    const speakers = dlParseSpeakers(ep.speakers);
    const isPanel  = speakers.length > 1;

    // ── Page title + breadcrumb
    document.title = ep.title.length > 50 ? ep.title : `${ep.title} | Dominate Law`;
    if (crumbEl) crumbEl.textContent = `Episode #${ep.episode}`;

    // ── Hero
    if (heroEl) {
      // Build the "featuring" tag — single guest or panelist count
      const guestTag = isPanel
        ? `<span class="ep-tag">👥 ${speakers.filter(s => s.role !== 'host').length} Panelists</span>`
        : `<span class="ep-tag">👤 ${ep.guest_name}</span>`;

      const heroDate = dlFormatDate(ep.date_published);
      heroEl.innerHTML = `
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(196,154,10,.15);border:1px solid rgba(196,154,10,.3);border-radius:100px;padding:6px 16px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#E8C44A;margin-bottom:16px">
          Episode #${ep.episode}
        </div>
        <h1 class="ep-hero-title">${ep.title}</h1>
        <div class="ep-meta-tags">
          ${guestTag}
          ${heroDate ? `<span class="ep-tag">📅 ${heroDate}</span>` : ''}
          ${ep.category ? `<span class="ep-tag">🎙️ ${ep.category}</span>` : ''}
          ${ep.duration  ? `<span class="ep-tag">⏱ ${ep.duration}</span>`  : ''}
        </div>`;
    }

    // ── Speaker grid (panel episodes only)
    if (isPanel) {
      const photoUrls = (ep.speaker_photos || '').split('|').map(s => s.trim());
      const speakersSec  = document.getElementById('ep-speakers-section');
      const speakersGrid = document.getElementById('ep-speakers-grid');
      if (speakersSec && speakersGrid) {
        speakersGrid.innerHTML = speakers.map((sp, i) => {
          const photo    = photoUrls[i] ? dlDriveImg(photoUrls[i], 'w400') : '';
          const initials = dlInitials(sp.name);
          const roleCls  = sp.role === 'host' ? 'ep-spk-host' : 'ep-spk-guest';
          return `
            <div class="ep-spk-card ${roleCls}">
              <div class="ep-spk-img">
                ${photo ? `<img src="${photo}" alt="${sp.name}" loading="lazy"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
                <div class="ep-spk-fallback" style="${photo ? 'display:none' : ''}">${initials}</div>
              </div>
              <div class="ep-spk-role">${sp.roleLabel}</div>
              <div class="ep-spk-name">${sp.name}</div>
            </div>`;
        }).join('');
        speakersSec.style.display = 'block';
      }
    }

    // ── Social share bar
    const shareBar = document.getElementById('ep-share-bar');
    if (shareBar) {
      shareBar.style.display = 'block';
      const fb = document.getElementById('share-fb');
      const tw = document.getElementById('share-tw');
      const li = document.getElementById('share-li');
      if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (tw) tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    }

    window.dlCurrentPodcastEpisode = ep;
    if (ep.spotify_embed || ep.audio_source) {
      if (dlIsUnlocked('podcast')) dlRenderPodcastAudio(ep);
      else dlRenderPodcastGate(ep);
    }

    // ── Poster image
    const posterSec = document.getElementById('ep-poster-section');
    const posterImg = document.getElementById('ep-poster-img');
    const posterUrl = ep.poster_image ? dlDriveImg(ep.poster_image) : '';
    if (posterImg && posterUrl) {
      posterImg.src = posterUrl;
      posterImg.alt = ep.title;
      if (posterSec) posterSec.style.display = 'block';
    }

    // ── Key points + bio (already parsed above into `parsedDescription`)
    const { keyPoints, bioGuestName, bio } = parsedDescription;
    const kpList = document.getElementById('ep-keypoints-list');
    if (kpList) kpList.innerHTML = keyPoints.length
      ? keyPoints.map(pt => `<li>${pt}</li>`).join('')
      : '<li style="color:var(--muted);font-style:italic">Episode notes coming soon.</li>';

    const bioWrap = document.getElementById('ep-bio-wrap');
    const bioHead = document.getElementById('ep-bio-heading');
    const bioList = document.getElementById('ep-bio-list');
    if (bio.length && bioWrap) {
      if (bioHead) bioHead.textContent = isPanel
        ? 'Meet the Panelists'
        : `More About ${bioGuestName || ep.guest_name}`;
      if (bioList) bioList.innerHTML = bio.map(b => `<li>${b}</li>`).join('');
      bioWrap.style.display = 'block';
    }

    // ── Contact / Connect info
    const contacts     = dlParseContact(ep.contact_info);
    const connectWrap  = document.getElementById('ep-connect-wrap');
    const connectName  = document.getElementById('ep-connect-name');
    const connectGrid  = document.getElementById('ep-connect-grid');
    if (contacts.length && connectWrap) {
      if (connectName) connectName.textContent = ep.guest_name;
      if (connectGrid) {
        connectGrid.innerHTML = contacts.map(c => {
          const typeL = c.type.toLowerCase();
          const href  = c.value.startsWith('http') ? c.value
            : c.value.startsWith('www.')            ? 'https://' + c.value
            : typeL.includes('call')                ? `tel:${c.value.replace(/[^\d+]/g,'')}`
            : typeL.includes('email')               ? `mailto:${c.value}` : '#';
          const icon  = typeL.includes('call')       ? '📞'
            : typeL.includes('email')                ? '📧'
            : typeL.includes('twitter')              ? '𝕏'
            : typeL.includes('linkedin')             ? '💼'
            : typeL.includes('facebook')             ? '📘'
            : typeL.includes('instagram')            ? '📷'
            : typeL.includes('podcast')              ? '🎙️'
            : '🌐';
          return `<a href="${href}" target="_blank" rel="noopener" class="ep-connect-item">
            <span style="font-size:1.1rem">${icon}</span>
            <span><span class="ep-connect-val">${c.value}</span><span class="ep-connect-type">${c.type}</span></span>
          </a>`;
        }).join('');
      }
      connectWrap.style.display = 'block';
    }

    // ── Show content body
    const body = document.getElementById('ep-body');
    if (body) body.style.display = 'block';

    // ── Transcript tab (speakers array drives Speaker N → name mapping)
    // Ep 21+ uses "new format": never falls back to "Naren" — unmapped speakers stay generic.
    const epNumInt = parseInt(ep.episode, 10) || 0;
    const isNewFormat = epNumInt >= 21;
    dlLoadTranscript(ep.transcript_url, ep.title, ep.guest_name, speakers, isNewFormat);

    // ── Prev / Next
    const navSec   = document.getElementById('ep-nav-section');
    const prevNext = document.getElementById('ep-prev-next');
    if (navSec) navSec.style.display = 'block';
    if (prevNext) {
      const prevCard = prev
        ? `<a href="/podcast-episode/?ep=${encodeURIComponent(dlEpisodeSlug(prev))}" class="ep-nav-card">
             <div class="ep-nav-dir">← Previous Episode</div>
             <div class="ep-nav-ep">Episode #${prev.episode}</div>
             <div class="ep-nav-title">${prev.title}</div>
           </a>`
        : `<div class="ep-nav-card ep-nav-placeholder"><div class="ep-nav-dir">← Previous</div><div class="ep-nav-title">This is the first episode</div></div>`;
      const nextCard = next
        ? `<a href="/podcast-episode/?ep=${encodeURIComponent(dlEpisodeSlug(next))}" class="ep-nav-card ep-nav-right">
             <div class="ep-nav-dir">Next Episode →</div>
             <div class="ep-nav-ep">Episode #${next.episode}</div>
             <div class="ep-nav-title">${next.title}</div>
           </a>`
        : `<div class="ep-nav-card ep-nav-right ep-nav-placeholder"><div class="ep-nav-dir">Next →</div><div class="ep-nav-title">This is the latest episode</div></div>`;
      prevNext.innerHTML = prevCard + nextCard;
    }

  } catch (e) {
    console.warn('DL Sheets: Could not load episode page', e);
    if (heroEl) heroEl.innerHTML = `<div class="ep-not-found"><h2>Could Not Load Episode</h2><p>Please try again or check your connection.</p><a href="/podcast" class="btn btn-primary" style="margin-top:16px">Browse All Episodes →</a></div>`;
  }
}

// ── TRANSCRIPT: fetch .txt from Drive via Apps Script proxy ──────
async function dlLoadTranscript(transcriptUrl, epTitle, guestName, speakers, isNewFormat) {
  const container = document.getElementById('ep-transcript-content');
  const tabBtn    = document.getElementById('ep-tab-transcript-btn');
  if (!container) return;

  // No URL in sheet — keep "not available" message
  if (!transcriptUrl) return;

  const fileId = dlDriveId(transcriptUrl);
  if (!fileId) return;

  // Show loading spinner while fetching
  container.innerHTML = `
    <div class="ep-transcript-loading" style="padding:40px 0">
      <div class="ep-transcript-spinner"></div>
      <span>Loading transcript…</span>
    </div>`;

  // Badge on tab button
  if (tabBtn) tabBtn.innerHTML = '📄 Transcript <span style="background:var(--gold3);color:#fff;font-size:.6rem;padding:2px 6px;border-radius:100px;margin-left:5px;font-weight:700">NEW</span>';

  try {
    // Fetch through Apps Script proxy (bypasses CORS on Google Drive)
    const proxyUrl = `${DL_APPS_SCRIPT_URL}?action=getTranscript&id=${fileId}`;
    const res  = await fetch(proxyUrl);
    const data = await res.json();

    if (data.status !== 'ok' || !data.content) throw new Error(data.error || 'Empty');

    const text = data.content;
    // Pass guest name + default host name for speaker labelling
    // For panel episodes, the speakers array overrides legacy 1=Intro/2=host/3+=guest mapping
    const hostName  = 'Naren Raja';
    const html = dlFormatTranscript(text, guestName, hostName, speakers, isNewFormat);
    const wordCount = text.split(/\s+/).length;
    const readMins  = Math.max(1, Math.round(wordCount / 200));

    container.innerHTML = `
      <div class="ep-transcript-header">
        <div>
          <h3>Full Transcript</h3>
          <p style="font-size:.75rem;color:var(--muted);margin:4px 0 0">
            ~${wordCount.toLocaleString()} words &nbsp;·&nbsp; ${readMins} min read
          </p>
        </div>
        <div class="ep-transcript-actions">
          <div class="ep-transcript-search">
            <svg viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="#60270F" stroke-width="1.4"/><path d="M9.5 9.5l3 3" stroke="#60270F" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input type="text" id="ep-ts-search" placeholder="Search transcript…" autocomplete="off">
          </div>
          <button class="ep-transcript-dl" id="ep-ts-download">
            <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h10" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
            Download
          </button>
        </div>
      </div>
      <div class="ep-transcript-body" id="ep-ts-body">${html}</div>
      <button class="ep-transcript-expand" id="ep-ts-expand">Show full transcript ↓</button>
    `;

    // Expand/collapse
    const tsBody   = document.getElementById('ep-ts-body');
    const expandBtn = document.getElementById('ep-ts-expand');
    let expanded = false;
    expandBtn.addEventListener('click', () => {
      expanded = !expanded;
      tsBody.style.maxHeight = expanded ? 'none' : '520px';
      expandBtn.textContent  = expanded ? 'Collapse transcript ↑' : 'Show full transcript ↓';
    });

    // Search/highlight
    const searchInput = document.getElementById('ep-ts-search');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim();
      if (!q) { tsBody.innerHTML = html; return; }
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(${escaped})`, 'gi');
      tsBody.innerHTML = html.replace(re, '<mark class="ep-transcript-highlight">$1</mark>');
    });

    // Download as txt
    document.getElementById('ep-ts-download').addEventListener('click', () => {
      const blob = new Blob([text], { type: 'text/plain' });
      const a    = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `transcript-${(epTitle || 'episode').toLowerCase().replace(/\s+/g,'-').slice(0,40)}.txt`
      });
      a.click();
      URL.revokeObjectURL(a.href);
    });

  } catch (err) {
    console.warn('DL Sheets: Transcript fetch failed', err);
    container.innerHTML = `
      <div class="ep-transcript-unavailable" style="margin-top:28px">
        <p>Transcript couldn't be loaded automatically.</p>
        <a href="https://drive.google.com/file/d/${fileId}/view" target="_blank" rel="noopener"
           class="btn btn-primary btn-sm" style="margin-top:4px">View Transcript in Drive →</a>
      </div>`;
  }
}

// ── Format raw transcript text into styled HTML ────────────────────
// Handles TWO line formats automatically:
//   1. "Speaker N    HH:MM:SS    text"           (otter.ai / generic)
//   2. "Naren Raja    HH:MM:SS    text"          (already-named transcripts)
//
// When a name is in the transcript directly, that name is used as-is.
// If the speakers column also has roles (e.g. "Naren Raja (Host)"),
// matching names get the correct host/guest styling.
function dlFormatTranscript(text, guestName, hostName, speakers, isNewFormat) {
  const hostShort  = (hostName  || 'Host').split(' ')[0];
  const guestShort = (guestName || 'Guest').split(' ')[0];
  const usePanel   = Array.isArray(speakers) && speakers.length > 0;

  // Build a quick lookup: lowercased name → role (from the speakers column)
  const nameToRole = {};
  if (usePanel) {
    speakers.forEach(s => { nameToRole[s.name.toLowerCase()] = s.role; });
  }

  // ── Two line patterns ───────────────────────────────────────────
  // Format A: "Speaker N    00:00:00    text"
  const reNumbered = /^(Speaker\s+(\d+))\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;
  // Format B: "<Name>    00:00:00    text" — name is letters/space/dot/apostrophe/hyphen, 2-60 chars
  const reNamed    = /^([A-Za-z][A-Za-z .'\-]{0,58}[A-Za-z.])\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;

  const lines   = text.split(/\r?\n/);
  const entries = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Try Speaker N first
    let mNum = line.match(reNumbered);
    if (mNum) {
      const speakerNum  = parseInt(mNum[2], 10);
      const time        = mNum[3];
      const textContent = mNum[4].trim();
      if (!textContent || textContent === '<silence>') continue;
      if (speakerNum === 0) continue;

      let label, role;
      if (usePanel) {
        const sp = speakers.find(s => s.speakerNum === speakerNum);
        if (sp) { label = sp.name; role = sp.role; }
        else    { label = `Speaker ${speakerNum}`; role = 'guest'; }
      } else if (isNewFormat) {
        label = `Speaker ${speakerNum}`; role = 'guest';
      } else {
        if (speakerNum === 1)      { label = 'Intro';   role = 'intro'; }
        else if (speakerNum === 2) { label = hostShort; role = 'host';  }
        else                       { label = guestShort; role = 'guest'; }
      }
      entries.push({ speakerKey: `n${speakerNum}`, label, role, time, text: textContent });
      continue;
    }

    // Try named-speaker format
    let mName = line.match(reNamed);
    if (mName) {
      const nameRaw     = mName[1].trim();
      const time        = mName[2];
      const textContent = mName[3].trim();
      if (!textContent || textContent === '<silence>') continue;

      // Use the transcript's own name. Derive role from speakers column if a match exists.
      const label = nameRaw;
      const role  = nameToRole[nameRaw.toLowerCase()]
                 || (/intro/i.test(nameRaw) ? 'intro' : 'guest');
      entries.push({ speakerKey: 'name:' + nameRaw.toLowerCase(), label, role, time, text: textContent });
      continue;
    }

    // Plain line with no structure — keep it as floating text
    if (line && line !== '<silence>') {
      entries.push({ speakerKey: 'plain', label: '', role: 'intro', time: '', text: line });
    }
  }

  if (!entries.length) return '<div class="ep-transcript-para"><div class="ep-transcript-text">Transcript content could not be parsed.</div></div>';

  // Assign a stable per-speaker color index (1-6, cycles) based on first appearance
  const keyToIdx = new Map();
  let nextIdx = 1;
  entries.forEach(e => {
    if (!keyToIdx.has(e.speakerKey)) keyToIdx.set(e.speakerKey, nextIdx++);
    e.colorIdx = keyToIdx.get(e.speakerKey);
  });

  // ── Build HTML ───────────────────────────────────────────────────
  const perSpeakerTinting = usePanel || isNewFormat || keyToIdx.size > 2;
  let html = '';
  let lastSig = null;

  for (const e of entries) {
    const roleClass = e.role === 'host'  ? 'ep-ts-host'
                    : e.role === 'guest' ? 'ep-ts-guest'
                    : 'ep-ts-intro';
    const spkClass = perSpeakerTinting && e.colorIdx > 0
      ? `ep-ts-spk-${((e.colorIdx - 1) % 6) + 1}`
      : '';

    const sig = perSpeakerTinting ? `${e.role}#${e.speakerKey}` : e.role;
    const showSpeaker = (sig !== lastSig) || e.role === 'intro';
    lastSig = sig;

    html += `<div class="ep-transcript-para ${roleClass} ${spkClass}">
      <div class="ep-ts-meta">
        ${showSpeaker && e.label ? `<span class="ep-transcript-speaker ${roleClass}-badge ${spkClass}-badge">${e.label}</span>` : '<span></span>'}
        ${e.time ? `<span class="ep-transcript-time">${e.time}</span>` : ''}
      </div>
      <div class="ep-transcript-text">${e.text}</div>
    </div>`;
  }

  return html;
}

// ── REVIEWS PAGE: Render all reviews with carousel ───────────────
async function dlLoadReviewsGrid() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  try {
    const reviews = await dlFetchSheet('reviews');
    if (!reviews.length) { grid.innerHTML = '<div style="padding:48px;text-align:center;color:var(--muted);flex-shrink:0;width:100%">No reviews found.</div>'; return; }

    const stars = n => '★'.repeat(Math.min(5, parseInt(n) || 5));
    grid.innerHTML = reviews.map(r => {
      const initials = dlInitials(r.reviewer_name);
      const photoHtml = r.photo_url
        ? `<img src="${r.photo_url}" alt="${r.reviewer_name}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0"
               onerror="this.outerHTML='<div style=\\'width:44px;height:44px;border-radius:50%;background:var(--brown);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;color:#fff;flex-shrink:0\\'>${initials}</div>'">`
        : `<div style="width:44px;height:44px;border-radius:50%;background:var(--brown);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;color:#fff;flex-shrink:0">${initials}</div>`;
      return `
        <article class="review-card">
          <div class="review-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div class="review-stars">${stars(r.rating)}</div><div style="font-size:.7rem;color:var(--muted)">${r.platform || 'Dominate Law'}</div></div>
          <p class="review-text">"${r.review_text}"</p>
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:12px;">
            ${photoHtml}
            <div><span class="review-name">${r.reviewer_name}</span><span class="review-title">${r.firm_name}</span></div>
          </div>
        </article>`;
    }).join('');

    // Init carousel after DOM is updated
    dlInitRvCarousel();
  } catch (e) {
    console.warn('DL Sheets: Could not load reviews', e);
  }
}

// ── REVIEWS CAROUSEL: Initialize controls ────────────────────────
function dlInitRvCarousel() {
  const track = document.getElementById('reviews-grid');
  const prev = document.getElementById('rv-prev');
  const next = document.getElementById('rv-next');
  const dotsWrap = document.getElementById('rv-dots');
  if (!track || !prev || !next || !dotsWrap) return;

  let page = 0;

  function perView() {
    return window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
  }

  function allCards() { return Array.from(track.querySelectorAll('.review-card')); }

  function pageCount() { return Math.max(1, Math.ceil(allCards().length / perView())); }

  function goTo(p) {
    const cards = allCards();
    if (!cards.length) return;
    page = Math.max(0, Math.min(p, pageCount() - 1));
    const pv = perView();
    const idx = page * pv;
    let offset = 0;
    for (let i = 0; i < idx && i < cards.length; i++) {
      offset += cards[i].offsetWidth + 24; // 24 = gap
    }
    track.style.transform = `translateX(-${offset}px)`;
    prev.style.opacity = page === 0 ? '.35' : '1';
    prev.disabled = page === 0;
    next.style.opacity = page >= pageCount() - 1 ? '.35' : '1';
    next.disabled = page >= pageCount() - 1;
    buildDots();
  }

  function buildDots() {
    const count = pageCount();
    dotsWrap.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'rv-dot' + (i === page ? ' active' : '');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  prev.addEventListener('click', () => { goTo(page - 1); resetAuto(); });
  next.addEventListener('click', () => { goTo(page + 1); resetAuto(); });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(0), 150);
  });

  // Auto-slide every 4 seconds; pause on hover
  let autoTimer;
  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(page >= pageCount() - 1 ? 0 : page + 1);
    }, 4000);
  }
  function stopAuto() { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }

  const viewport = track.closest('.rv-viewport') || track.parentElement;
  if (viewport) {
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);
  }

  goTo(0);
  startAuto();
}

// ── EVENTS PAGE: Featured next event + upcoming list ─────────────
async function dlLoadEventsGrid() {
  const featEl     = document.getElementById('ev-featured');
  const upWrap     = document.getElementById('ev-upcoming-wrap');
  const upList     = document.getElementById('ev-upcoming-list');
  if (!featEl) return;

  try {
    const events = await dlFetchSheet('events');
    if (!events.length) { featEl.innerHTML = '<p style="text-align:center;color:var(--muted);padding:48px">No events scheduled yet.</p>'; return; }

    const today = new Date(); today.setHours(0,0,0,0);
    const upcoming = events.filter(ev => dlParseDate(ev.date_iso) >= today);
    const past     = events.filter(ev => dlParseDate(ev.date_iso) < today);

    // ── Pick featured = soonest upcoming, fallback to most recent past
    const featured = upcoming.length ? upcoming[0] : past[past.length - 1];
    const rest     = upcoming.slice(1); // remaining upcoming after featured
    const isPast   = dlParseDate(featured.date_iso) < today;

    // Parse panelists + image_urls
    const panelists = (featured.Panelists || '').split('\n').map(s => s.trim()).filter(Boolean);
    const imageMap  = {};
    (featured.image_urls || '').split('\n').forEach(line => {
      const ci = line.indexOf(':');
      if (ci > -1) {
        const name = line.substring(0, ci).trim();
        const url  = line.substring(ci + 1).trim();
        imageMap[name] = url;
      }
    });

    // Build speaker cards
    const speakersHtml = panelists.map(name => {
      const imgUrl = Object.keys(imageMap).find(k => name.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
      const src    = imgUrl ? dlDriveImg(imageMap[imgUrl]) : '';
      const ini    = dlInitials(name);
      return `
        <div class="ev-speaker">
          <div class="ev-speaker-img">
            ${src ? `<img src="${src}" alt="${name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${ini}</span>` : `<span>${ini}</span>`}
          </div>
          <div class="ev-speaker-name">${name}</div>
        </div>`;
    }).join('');

    // Build agenda items
    const agendaLines = (featured.description || '').split('\n').map(s => s.trim().replace(/^\d+\.\s*/,'')).filter(Boolean).slice(0,5);
    const agendaHtml  = agendaLines.map(l => `<div class="ev-agenda-item"><div class="ev-agenda-dot"></div><span>${l}</span></div>`).join('');

    // Render featured
    featEl.innerHTML = `
      <div class="ev-hero">
        <div class="ev-hero-inner">
          <div class="ev-hero-content">
            <div class="ev-live-badge"><div class="ev-live-dot"></div>${isPast ? 'Past Event' : 'Next Event'}</div>
            <h2>${featured.title}</h2>
            <div class="ev-meta-row">
              <div class="ev-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                ${featured.day} ${featured.month_year}
              </div>
              <div class="ev-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                ${featured.time || 'Time TBA'}
              </div>
              <div class="ev-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>
                Virtual · Free
              </div>
            </div>
            ${!isPast ? `
            <div class="ev-urgency-bump" style="margin:18px 0 4px;padding:13px 16px;background:linear-gradient(135deg,rgba(196,154,10,.18),rgba(96,39,15,.22));border:1px solid rgba(196,154,10,.55);border-radius:10px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;flex-shrink:0;">
                  <span style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(196,154,10,.25);animation:seat-ping 1.6s ease-out infinite;"></span>
                  <span style="position:relative;width:8px;height:8px;border-radius:50%;background:#E8C44A;display:block;"></span>
                </span>
                <span style="font-size:.79rem;font-weight:700;color:#E8C44A;letter-spacing:.01em;">Seats Are Filling Up Fast</span>
              </div>
              <div style="background:rgba(0,0,0,.09);border-radius:100px;height:6px;overflow:hidden;margin-bottom:6px;">
                <div style="width:74%;height:100%;background:linear-gradient(90deg,#C49A0A,#E8C44A);border-radius:100px;animation:seat-fill .9s ease-out forwards;"></div>
              </div>
              <div style="font-size:.71rem;color:rgba(255,255,255,.6);">Limited capacity &nbsp;·&nbsp; Free to attend &nbsp;·&nbsp; No credit card required</div>
            </div>` : ''}
            <div class="ev-agenda">
              <div class="ev-agenda-lbl">What We'll Cover</div>
              ${agendaHtml}
            </div>
            ${isPast
              ? `<span class="ev-reg-btn" style="opacity:.55;cursor:default">Registration Closed</span>`
              : `<div>
                  <button class="ev-reg-btn ev-reg-btn-hype" onclick="dlOpenEventModal(${JSON.stringify(featured).replace(/"/g,'&quot;')})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    Reserve My Free Spot Now
                  </button>
                  <p style="font-size:.72rem;color:var(--muted);margin-top:9px;display:flex;align-items:center;gap:6px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Secure registration &nbsp;·&nbsp; Zoom link sent instantly &nbsp;·&nbsp; No waitlist once full
                  </p>
                </div>`
            }
          </div>
          <div class="ev-sidebar">
            <div class="ev-date-big">
              <div class="ev-day">${featured.day}</div>
              <div class="ev-mo">${featured.month_year}</div>
            </div>
            ${!isPast ? `
            <div>
              <div class="ev-cd-label">Event Starts In</div>
              <div class="ev-countdown">
                <div class="ev-cd-block"><div class="ev-cd-num" id="ev-cd-days">--</div><div class="ev-cd-lbl">Days</div></div>
                <div class="ev-cd-block"><div class="ev-cd-num" id="ev-cd-hrs">--</div><div class="ev-cd-lbl">Hrs</div></div>
                <div class="ev-cd-block"><div class="ev-cd-num" id="ev-cd-min">--</div><div class="ev-cd-lbl">Min</div></div>
                <div class="ev-cd-block"><div class="ev-cd-num" id="ev-cd-sec">--</div><div class="ev-cd-lbl">Sec</div></div>
              </div>
            </div>` : ''}
            ${panelists.length ? `
            <div>
              <div class="ev-speakers-lbl">Panelists</div>
              ${speakersHtml}
            </div>` : ''}
          </div>
        </div>
      </div>`;

    // Start countdown if upcoming — target in America/New_York time
    if (!isPast) {
      // Parse start hour/min from event time field (e.g. "8.00 PM to 9.00 PM EST")
      let evHour = 20, evMin = 0; // default 8 PM ET
      if (featured.time) {
        const m = featured.time.match(/(\d+)(?:[:.](\d+))?\s*(AM|PM)/i);
        if (m) {
          evHour = parseInt(m[1]);
          evMin  = parseInt(m[2] || '0');
          if (m[3].toUpperCase() === 'PM' && evHour !== 12) evHour += 12;
          if (m[3].toUpperCase() === 'AM' && evHour === 12) evHour = 0;
        }
      }
      // Use dlParseDate to safely handle both Date(YYYY,M,D) and ISO formats
      const evDate = dlParseDate(featured.date_iso);
      const y  = evDate.getFullYear();
      const mo = String(evDate.getMonth() + 1).padStart(2, '0');
      const d  = String(evDate.getDate()).padStart(2, '0');
      const isoDate = `${y}-${mo}-${d}`;
      // Probe: create a UTC timestamp at the desired clock hour, then ask
      // Intl what hour that UTC time shows in New York. The difference
      // tells us how many hours to shift to land on evHour ET.
      const probeUTC = new Date(`${isoDate}T${String(evHour).padStart(2,'0')}:${String(evMin).padStart(2,'0')}:00Z`);
      const nyHour   = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: '2-digit', hour12: false
      }).format(probeUTC)) % 24;
      let shift = evHour - nyHour;
      if (shift < -12) shift += 24;
      if (shift >  12) shift -= 24;
      const target = new Date(probeUTC.getTime() + shift * 3600000);
      if (typeof dlStartCountdown === 'function') dlStartCountdown(target);
    }

    // Render upcoming list
    if (rest.length && upWrap && upList) {
      upList.innerHTML = rest.map(ev => `
        <div class="ev-upcoming-card">
          <div class="ev-upcoming-badge">
            <div class="ev-upcoming-day">${ev.day}</div>
            <div class="ev-upcoming-mo">${(ev.month_year||'').split(' ')[0]}</div>
          </div>
          <div class="ev-upcoming-info">
            <h4>${ev.title}</h4>
            <p>${(ev.Panelists||'').split('\n').map(s=>s.trim()).filter(Boolean).join(' · ') || 'Panelists TBA'}</p>
            <div style="display:flex;align-items:center;gap:6px;margin-top:5px;">
              <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex-shrink:0;">
                <span style="position:absolute;width:14px;height:14px;border-radius:50%;background:rgba(196,154,10,.25);animation:seat-ping 1.8s ease-out infinite;"></span>
                <span style="position:relative;width:6px;height:6px;border-radius:50%;background:#C49A0A;display:block;"></span>
              </span>
              <span style="font-size:.69rem;font-weight:600;color:#7A3515;letter-spacing:.01em;">Limited seats · Register early</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
            <button class="btn btn-primary btn-sm" onclick="dlOpenEventModal(${JSON.stringify(ev).replace(/"/g,'&quot;')})">Reserve Spot →</button>
            <span style="font-size:.67rem;color:var(--muted);">Free · No card needed</span>
          </div>
        </div>`).join('');
      upWrap.style.display = '';
    }

  } catch (e) {
    console.warn('DL Sheets: Could not load events', e);
    if (featEl) featEl.innerHTML = '<p style="text-align:center;color:var(--muted);padding:48px">Could not load event. Please try again.</p>';
  }
}

// Try fetching a sheet tab under several common name spellings
async function dlFetchWebinarReplays() {
  const candidates = [
    'webinar-replays', 'webinar replays', 'Webinar Replays',
    'webinar-replay',  'webinar replay',  'Webinar Replay',
    'WebinarReplays',  'Webinars'
  ];
  for (const name of candidates) {
    try {
      const rows = await dlFetchSheet(name);
      if (rows.length) { console.log('DL: loaded webinar replays from tab →', name); return rows; }
    } catch (_) {}
  }
  return [];
}

async function dlLoadWebinarReplayGrid() {
  const wrap = document.getElementById('wr-replays-wrap');
  const grid = document.getElementById('wr-replays-grid');
  if (!wrap || !grid) return;

  // Show section immediately so errors are visible
  wrap.style.display = 'block';
  grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:16px 0">Loading replays…</p>';

  try {
    const rows = await dlFetchWebinarReplays();

    if (!rows.length) {
      grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:16px 0">No replays found. Check that your Google Sheet tab is named <strong>webinar-replays</strong> and is published.</p>';
      return;
    }

    const replays = rows.map(dlNormalizeWebinarReplay)
      .filter(item => item.title && item.vimeoLink)
      .sort((a, b) => {
        const da = dlParseDate(a.dateRaw);
        const db = dlParseDate(b.dateRaw);
        return (db && !isNaN(db) ? db.getTime() : 0) - (da && !isNaN(da) ? da.getTime() : 0);
      });

    if (!replays.length) {
      grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:16px 0">Replays loaded but no rows have a Vimeo URL yet. Add a <strong>vimeo_url</strong> column to your sheet.</p>';
      return;
    }

    const wrUnlocked = dlIsUnlocked('webinar');

    grid.innerHTML = replays.map(replay => {
      const href       = `/webinar-replay/?replay=${encodeURIComponent(replay.id)}`;
      const metaLine   = [replay.dateLabel, replay.category].filter(Boolean).join(' · ');
      const thumbStyle = replay.thumbnailUrl
        ? `background-image:url(${replay.thumbnailUrl});background-size:cover;background-position:center`
        : '';

      const thumbHtml = `
        <div class="wr-thumb" style="${thumbStyle}"
             ${replay.vimeoId && !replay.thumbnailUrl ? `data-vimeo-id="${replay.vimeoId}"` : ''}>
          <div class="wr-thumb-overlay"></div>
          <div class="ep-play-btn${wrUnlocked ? '' : ' ep-lock-icon'}" aria-hidden="true">
            ${wrUnlocked
              ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>'}
          </div>
          <span>${dlEsc(replay.dateLabel || 'On Demand')}</span>
        </div>`;

      if (wrUnlocked) {
        return `
          <a class="wr-card" href="${href}" aria-label="Watch: ${dlEsc(replay.title)}">
            ${thumbHtml}
            <div class="wr-card-body">
              <div class="ep-card-preview">
                ${metaLine ? `<div class="wr-meta">${dlEsc(metaLine)}</div>` : ''}
                <h3>${dlEsc(replay.title)}</h3>
                <span class="ep-photo-cta">Watch Replay <span>→</span></span>
              </div>
            </div>
          </a>`;
      }

      return `
        <div class="wr-card ep-card-locked" onclick="dlRevealCardGate(this)"
             aria-label="Watch: ${dlEsc(replay.title)}">
          ${thumbHtml}
          <div class="wr-card-body">
            <div class="ep-card-preview">
              ${metaLine ? `<div class="wr-meta">${dlEsc(metaLine)}</div>` : ''}
              <h3>${dlEsc(replay.title)}</h3>
              <span class="ep-photo-cta">🔒 Click to Unlock</span>
            </div>
            <div class="ep-card-gate">
              <div class="ep-gate-head">
                <span class="ep-gate-kicker">Free Access</span>
                <button class="ep-gate-back" type="button" onclick="event.stopPropagation();dlHideCardGate(this)">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6 8L3 5l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Back
                </button>
              </div>
              <form class="cg-form"
                    data-type="webinar" data-id="${dlEsc(replay.id)}"
                    data-redirect="${href}" data-title="${dlEsc(replay.title)}"
                    data-vimeo="${dlEsc(replay.vimeoLink)}"
                    onsubmit="event.stopPropagation();dlCardGateSubmit(event)">
                <div class="cg-row">
                  <input name="first" type="text"  placeholder="First Name *"  required autocomplete="given-name">
                  <input name="last"  type="text"  placeholder="Last Name *"   required autocomplete="family-name">
                </div>
                <div class="cg-row">
                  <input name="email" type="email" placeholder="Email *"       required autocomplete="email">
                  <input name="phone" type="tel"   placeholder="Phone *"       required autocomplete="tel">
                </div>
                <input name="firm" type="text" placeholder="Firm Name *" required autocomplete="organization">
                <p class="cg-error" role="alert"></p>
                <button type="submit">▶ Watch Replay</button>
              </form>
            </div>
          </div>
        </div>`;
    }).join('');

    wrap.style.display = '';

    // Async-fetch Vimeo thumbnails for cards that don't have a Drive image
    grid.querySelectorAll('.wr-thumb[data-vimeo-id]').forEach(async el => {
      if (el.style.backgroundImage) return; // already has a thumbnail
      const vid = el.dataset.vimeoId;
      try {
        const res  = await fetch(`https://vimeo.com/api/v2/video/${vid}.json`);
        const data = await res.json();
        const url  = data[0]?.thumbnail_large || data[0]?.thumbnail_medium || '';
        if (url) {
          el.style.backgroundImage = `url(${url})`;
          el.style.backgroundSize  = 'cover';
          el.style.backgroundPosition = 'center';
          const bg = el.querySelector('.wr-thumb-bg');
          if (bg) bg.style.display = 'none';
        }
      } catch (_) { /* silently fall back to gradient */ }
    });

  } catch (e) {
    console.warn('DL Sheets: Could not load webinar replays', e);
    grid.innerHTML = `<p style="color:#b42318;font-size:.85rem;padding:16px 0">Error loading replays: ${e.message || e}. Check the browser console for details.</p>`;
  }
}

async function dlLoadWebinarReplayPage() {
  const params      = new URLSearchParams(window.location.search);
  const replayParam = params.get('replay') || params.get('id') || '';
  const hero        = document.getElementById('wr-hero-content');
  const crumb       = document.getElementById('wr-breadcrumb-current');
  const videoWrap   = document.getElementById('wr-video-wrap');
  const gateWrap    = document.getElementById('wr-gate-wrap');
  const navSec      = document.getElementById('wr-nav-section');
  const prevNext    = document.getElementById('wr-prev-next');
  const sharebar    = document.getElementById('wr-share-bar');
  const contentBody = document.getElementById('wr-content-body');
  const kpList      = document.getElementById('wr-keypoints-list');

  try {
    const rows = await dlFetchSheet('webinar-replays');
    const replays = rows.map(dlNormalizeWebinarReplay)
      .filter(item => item.title)
      .sort((a, b) => {
        const da = dlParseDate(a.dateRaw);
        const db = dlParseDate(b.dateRaw);
        return (db && !isNaN(db) ? db.getTime() : 0) - (da && !isNaN(da) ? da.getTime() : 0);
      });

    if (!replays.length) {
      if (hero) hero.innerHTML = '<div class="wr-not-found"><h2>No Replays Found</h2><p>Check back soon for on-demand sessions.</p><a href="/events" class="btn btn-primary" style="margin-top:16px">Back to Events →</a></div>';
      return;
    }

    const foundIndex = replayParam
      ? replays.findIndex(r => r.id === replayParam || String(r.index + 1) === replayParam)
      : 0;
    const idx    = foundIndex >= 0 ? foundIndex : 0;
    const replay = replays[idx];
    window.dlCurrentWebinarReplay = replay;

    // Page meta
    document.title = replay.title.length > 45 ? `${replay.title} | Webinar Replay` : `${replay.title} | Webinar Replay | Dominate Law`;
    if (crumb) crumb.textContent = replay.title;

    // Hero
    if (hero) {
      const metaTags = [
        replay.dateLabel ? `<span class="ep-tag">📅 ${dlEsc(replay.dateLabel)}</span>` : '',
        replay.duration  ? `<span class="ep-tag">⏱ ${dlEsc(replay.duration)}</span>`  : '',
        replay.category  ? `<span class="ep-tag">🎙️ ${dlEsc(replay.category)}</span>`  : '',
        '<span class="ep-tag">Free Replay</span>',
      ].filter(Boolean).join('');
      hero.innerHTML = `
        <div class="wr-kicker">On-Demand Webinar</div>
        <h1 class="wr-hero-title">${dlEsc(replay.title)}</h1>
        <div class="ep-meta-tags">${metaTags}</div>`;
    }

    // Share bar
    if (sharebar) {
      const pageUrl   = encodeURIComponent(window.location.href);
      const pageTitle = encodeURIComponent(`${replay.title} — Dominate Law Webinar Replay`);
      sharebar.style.display = 'block';
      const fb = document.getElementById('wr-share-fb');
      const tw = document.getElementById('wr-share-tw');
      const li = document.getElementById('wr-share-li');
      if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (tw) tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
    }

    // Speakers grid
    if (replay.speakers) {
      const speakersList = replay.speakers.split('|').map(s => s.trim()).filter(Boolean);
      if (speakersList.length > 1) {
        const spSec  = document.getElementById('wr-speakers-section');
        const spGrid = document.getElementById('wr-speakers-grid');
        if (spSec && spGrid) {
          spGrid.innerHTML = speakersList.map(name => {
            const initials = dlInitials(name.replace(/\([^)]+\)/g, '').trim());
            return `<div class="ep-spk-card">
              <div class="ep-spk-img"><div class="ep-spk-fallback">${initials}</div></div>
              <div class="ep-spk-name">${dlEsc(name)}</div>
            </div>`;
          }).join('');
          spSec.style.display = 'block';
        }
      }
    }

    // Gate / video
    if (dlIsUnlocked('webinar')) {
      dlRenderWebinarVideo(replay);
    } else {
      if (videoWrap) videoWrap.style.display = 'none';
      if (gateWrap) {
        gateWrap.style.display = 'block';
        gateWrap.querySelector('.wr-video-wrap-inner').innerHTML = `
          <form class="dl-gate-card" id="webinar-gate-form" onsubmit="dlSubmitWebinarReplayGate(event)" style="max-width:620px;margin:0 auto">
            <div class="dl-hp" aria-hidden="true"><input type="text" id="webinar_dl_hp" tabindex="-1" autocomplete="off"></div>
            <div class="dl-gate-kicker">Free Replay Access</div>
            <h2>Unlock the Webinar Replay</h2>
            <p>Enter your details once to watch this on-demand training session. It's completely free.</p>
            <div class="dl-gate-grid">
              <label>First Name <input id="wrGateFirst" type="text" autocomplete="given-name" required placeholder="Alex"></label>
              <label>Last Name  <input id="wrGateLast"  type="text" autocomplete="family-name" required placeholder="Thompson"></label>
            </div>
            <div class="dl-gate-grid">
              <label>Email <input id="wrGateEmail" type="email" autocomplete="email" required placeholder="alex@yourfirm.com"></label>
              <label>Phone <input id="wrGatePhone" type="tel"   autocomplete="tel"   placeholder="+1 (555) 000-0000"></label>
            </div>
            <label style="display:block;margin-bottom:12px">Firm Name <input id="wrGateFirm" type="text" autocomplete="organization" placeholder="Thompson &amp; Associates"></label>
            <div class="dl-gate-error" id="wrGateError"></div>
            <button class="btn btn-primary" type="submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Watch Replay Now
            </button>
          </form>`;
      }
    }

    // Key Takeaways
    if (contentBody) {
      contentBody.style.display = 'block';
      if (kpList) {
        kpList.innerHTML = replay.notes.length
          ? replay.notes.map(n => `<li>${dlEsc(n)}</li>`).join('')
          : '<li style="color:var(--muted);font-style:italic">Key takeaways coming soon.</li>';
      }
    }

    // Prev / Next
    const prev = replays[idx + 1];
    const next = replays[idx - 1];
    if (navSec) navSec.style.display = 'block';
    if (prevNext) {
      prevNext.innerHTML = `
        ${prev
          ? `<a href="/webinar-replay/?replay=${encodeURIComponent(prev.id)}" class="ep-nav-card">
               <div class="ep-nav-dir">← Previous Replay</div>
               <div class="ep-nav-title">${dlEsc(prev.title)}</div>
             </a>`
          : '<div class="ep-nav-card ep-nav-placeholder"><div class="ep-nav-dir">← Previous</div><div class="ep-nav-title">This is the first replay</div></div>'}
        ${next
          ? `<a href="/webinar-replay/?replay=${encodeURIComponent(next.id)}" class="ep-nav-card ep-nav-right">
               <div class="ep-nav-dir">Next Replay →</div>
               <div class="ep-nav-title">${dlEsc(next.title)}</div>
             </a>`
          : '<div class="ep-nav-card ep-nav-right ep-nav-placeholder"><div class="ep-nav-dir">Next →</div><div class="ep-nav-title">This is the latest replay</div></div>'}`;
    }

  } catch (e) {
    console.warn('DL Sheets: Could not load webinar replay page', e);
    if (hero) hero.innerHTML = '<div class="wr-not-found"><h2>Could Not Load Replay</h2><p>Please try again from the events page.</p><a href="/events" class="btn btn-primary" style="margin-top:16px">Back to Events →</a></div>';
  }
}

function dlRenderWebinarVideo(replay) {
  const gateWrap  = document.getElementById('wr-gate-wrap');
  const videoWrap = document.getElementById('wr-video-wrap');
  const iframe    = document.getElementById('wr-video-frame');
  if (gateWrap)  gateWrap.style.display  = 'none';
  if (videoWrap) videoWrap.style.display = 'block';
  if (iframe && replay.embedUrl) {
    iframe.src   = replay.embedUrl;
    iframe.title = replay.title || 'Webinar Replay';
  }
}

async function dlSubmitWebinarReplayGate(event) {
  event.preventDefault();
  const get = id => (document.getElementById(id)?.value || '').trim();
  const first = get('wrGateFirst');
  const last  = get('wrGateLast');
  const email = get('wrGateEmail');
  const replay = window.dlCurrentWebinarReplay || {};

  const phone = get('wrGatePhone');
  const firm  = get('wrGateFirm');
  if (typeof dlSpamBlock === 'function' && dlSpamBlock('webinar_dl_hp', first, last)) return;
  if (!first || !last || !email || !phone || !firm) {
    dlSetGateMessage('wrGateError', 'All fields are required.');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Unlocking...'; }

  try {
    await dlSendGateLead({
      form: 'webinar_replay_gate',
      tab: 'Webinar Replay Gate',
      first_name: first,
      last_name: last,
      email: email,
      phone: get('wrGatePhone'),
      firm_name: get('wrGateFirm'),
      webinar_title: replay.title || '',
      webinar_date: replay.dateLabel || replay.dateRaw || '',
      replay_id: replay.id || '',
      vimeo_link: replay.vimeoLink || '',
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    });
    dlMarkUnlocked('webinar');
    dlRenderWebinarVideo(replay);
  } catch (e) {
    dlSetGateMessage('wrGateError', 'Something went wrong. Please try again.');
    if (btn) { btn.disabled = false; btn.textContent = 'Watch Replay'; }
  }
}

// ── Webinar replay gate modal (events page) ───────────────────────
function dlOpenWrGateModal(replayId, title, redirectPath, vimeoLink) {
  const bg = document.getElementById('wr-gate-modal-bg');
  if (!bg) return;
  document.getElementById('wr-gm-replay-id').value   = replayId;
  document.getElementById('wr-gm-redirect').value    = redirectPath;
  document.getElementById('wr-gm-vimeo').value       = vimeoLink;
  document.getElementById('wr-gm-title').textContent = title;
  document.getElementById('wr-gm-error').textContent = '';
  document.getElementById('wr-gm-form').reset();
  bg.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('wr-gm-first').focus();
}

function dlCloseWrGateModal() {
  const bg = document.getElementById('wr-gate-modal-bg');
  if (bg) bg.classList.remove('open');
  document.body.style.overflow = '';
}

async function dlSubmitWrGateModal(event) {
  event.preventDefault();
  const form   = event.target;
  const get    = id => (document.getElementById(id)?.value || '').trim();
  const first  = get('wr-gm-first');
  const last   = get('wr-gm-last');
  const email  = get('wr-gm-email');
  const phone  = get('wr-gm-phone');
  const firm   = get('wr-gm-firm');
  const id     = get('wr-gm-replay-id');
  const redir  = get('wr-gm-redirect');
  const vimeo  = get('wr-gm-vimeo');
  const title  = document.getElementById('wr-gm-title')?.textContent || '';
  const errEl  = document.getElementById('wr-gm-error');
  const btn    = form.querySelector('button[type="submit"]');

  if (typeof dlSpamBlock === 'function' && dlSpamBlock('', first, last)) return;
  if (!first || !last || !email || !phone || !firm) {
    if (errEl) errEl.textContent = 'All fields are required.'; return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Unlocking…'; }

  try {
    await dlSendGateLead({
      form: 'webinar_replay_gate', tab: 'Webinar Replay Gate',
      first_name: first, last_name: last, email, phone, firm_name: firm,
      webinar_title: title, replay_id: id, vimeo_link: vimeo,
      page_url: window.location.href
    });
    dlMarkUnlocked('webinar');
    window.location.href = redir;
  } catch (e) {
    if (errEl) errEl.textContent = 'Something went wrong. Please try again.';
    if (btn) { btn.disabled = false; btn.textContent = 'Watch Replay →'; }
  }
}

// ── Auto-init based on current page ──────────────────────────────
(function () {
  const path = window.location.pathname;

  // Always update the announcement bar on every page that has .announce
  if (document.querySelector('.announce')) {
    dlLoadLatestPodcast();
  }

  if (path.includes('webinar-replay')) {
    dlLoadWebinarReplayPage();
  } else if (path.includes('podcast-episode')) {
    dlLoadEpisodePage();
  } else if (path.includes('podcast')) {
    dlLoadPodcastGrid();
  } else if (path.includes('reviews')) {
    dlLoadReviewsGrid();
  } else if (path.includes('events')) {
    dlLoadEventsGrid();
    dlLoadWebinarReplayGrid();
  } else if (path.endsWith('/') || path === '') {
    // Home page — load event popup + podcast grid
    dlLoadNextEvent();
    dlLoadHomePodcastGrid();
  }
})();
