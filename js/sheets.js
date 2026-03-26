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
//                          contact_info, spotify_embed, spotify_url, apple_url, audio_source)
//    • reviews   (columns: reviewer_name, firm_name, rating, review_text, platform, photo_url)
//    • events    (columns: date_iso, day, month_year, title, description, register_url)
//    • leads     (auto-filled by Google Apps Script — do not edit manually)
//
//  The Sheet must be shared: File → Share → Publish to web → Entire document → Web page → Publish
// ─────────────────────────────────────────────────────────────────

const DL_SHEET_ID        = '1xf9FygiOjqYrfaTeG2j0SW3RjqGPv2SX-6eJBI_6VUA';
const DL_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCmZIkYwqb_t3MDv91bTyfDCfnISeYznMS2jByqY4w2YySUUaXOrs_eTxgBVLOvil2/exec';

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
  console.log(`DL Sheets [${sheetName}] columns:`, cols);
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
      const epHref   = `podcast-episode.html?ep=${ep.episode}`;
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

    // Popup — podcast card
    const photoEl = document.querySelector('.hp-pod-photo img');
    const epNumEl = document.querySelector('.hp-pod-ep');
    const titleEl = document.querySelector('.hp-pod-title');
    const listenBtn = document.querySelector('.hp-btn-podcast');
    if (photoEl) { photoEl.src = dlDriveImg(ep.guest_photo_url); photoEl.alt = ep.guest_name; }
    if (epNumEl) epNumEl.textContent = `Episode #${ep.episode}`;
    if (titleEl) titleEl.textContent = ep.title;
    if (listenBtn) listenBtn.href = `podcast-episode.html?ep=${ep.episode}`;
  } catch (e) {
    console.warn('DL Sheets: Could not load latest podcast', e);
  }
}

// ── HOME PAGE: Load next upcoming event into popup ────────────────
async function dlLoadNextEvent() {
  try {
    const events = await dlFetchSheet('events');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcoming = events.find(ev => new Date(ev.date_iso) >= today);
    if (!upcoming) return;

    const dayEl   = document.querySelector('.hp-evt-date-day');
    const monthEl = document.querySelector('.hp-evt-date-month');
    const titleEl = document.querySelector('.hp-evt-title');
    const descEl  = document.querySelector('.hp-evt-desc');
    const btnEl   = document.querySelector('.hp-btn-event');
    if (dayEl)   dayEl.textContent   = upcoming.day;
    if (monthEl) monthEl.textContent = upcoming.month_year;
    if (titleEl) titleEl.textContent = upcoming.title;
    if (descEl)  descEl.textContent  = upcoming.description;
    if (btnEl && upcoming.register_url) btnEl.href = upcoming.register_url;
  } catch (e) {
    console.warn('DL Sheets: Could not load next event', e);
  }
}

// ── PODCAST PAGE: Render all episodes ────────────────────────────
async function dlLoadPodcastGrid() {
  const grid = document.getElementById('episodes-grid');
  if (!grid) return;
  try {
    const episodes = await dlFetchSheet('podcasts');
    if (!episodes.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No episodes found.</p>'; return; }

    // Update ticker count dynamically
    document.querySelectorAll('#ticker-ep-count').forEach(el => el.textContent = episodes.length);

    grid.innerHTML = episodes.slice().reverse().map(ep => {
      const initials = dlInitials(ep.guest_name);
      return `
        <a href="podcast-episode.html?ep=${ep.episode}" class="ep-photo-card">
          <span class="ep-badge">Episode #${ep.episode}</span>
          <div class="ep-circle">
            <img src="${dlDriveImg(ep.guest_photo_url)}" alt="${ep.guest_name}" loading="lazy"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.1rem">${initials}</div>
          </div>
          <p>${ep.title}</p>
        </a>`;
    }).join('');
  } catch (e) {
    console.warn('DL Sheets: Could not load podcast grid', e);
  }
}

// ── EPISODE DETAIL PAGE: Load single episode ─────────────────────
async function dlLoadEpisodePage() {
  const params   = new URLSearchParams(window.location.search);
  const epNum    = params.get('ep');
  const heroEl   = document.getElementById('ep-hero-content');
  const crumbEl  = document.getElementById('ep-breadcrumb');

  if (!epNum) {
    if (heroEl) heroEl.innerHTML = `<div class="ep-not-found"><h2>Episode Not Found</h2><p>No episode number provided.</p><a href="podcast.html" class="btn btn-primary" style="margin-top:16px">Browse All Episodes →</a></div>`;
    return;
  }

  try {
    const episodes = await dlFetchSheet('podcasts');
    if (!episodes.length) { window.location.href = 'podcast.html'; return; }

    const idx  = episodes.findIndex(e => String(e.episode) === String(epNum));
    if (idx === -1) {
      if (heroEl) heroEl.innerHTML = `<div class="ep-not-found"><h2>Episode #${epNum} Not Found</h2><p>This episode doesn't exist yet.</p><a href="podcast.html" class="btn btn-primary" style="margin-top:16px">Browse All Episodes →</a></div>`;
      return;
    }

    const ep   = episodes[idx];
    const prev = idx > 0 ? episodes[idx - 1] : null;
    const next = idx < episodes.length - 1 ? episodes[idx + 1] : null;
    const pageUrl   = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(`Episode #${ep.episode}: ${ep.title} — Dominate Law`);

    // ── Page title + breadcrumb
    document.title = `Episode #${ep.episode}: ${ep.title} — Dominate Law`;
    if (crumbEl) crumbEl.textContent = `Episode #${ep.episode}`;

    // ── Hero
    if (heroEl) {
      heroEl.innerHTML = `
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(196,154,10,.15);border:1px solid rgba(196,154,10,.3);border-radius:100px;padding:6px 16px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#E8C44A;margin-bottom:16px">
          Episode #${ep.episode}
        </div>
        <h1 class="ep-hero-title">${ep.title}</h1>
        <div class="ep-meta-tags">
          <span class="ep-tag">👤 ${ep.guest_name}</span>
          ${ep.category ? `<span class="ep-tag">🎙️ ${ep.category}</span>` : ''}
          ${ep.duration  ? `<span class="ep-tag">⏱ ${ep.duration}</span>`  : ''}
        </div>`;
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

    // ── Audio: Spotify embed takes priority, MP3 Drive as fallback
    if (ep.spotify_embed) {
      const sec    = document.getElementById('ep-embed-section');
      const iframe = document.getElementById('ep-spotify-iframe');
      if (sec) sec.style.display = 'block';
      if (iframe) iframe.src = ep.spotify_embed;
    } else if (ep.audio_source) {
      const sec    = document.getElementById('ep-audio-section');
      const player = document.getElementById('ep-audio-player');
      if (sec) sec.style.display = 'block';
      // Use Drive preview iframe — works reliably for publicly shared MP3s
      if (player) player.src = dlDriveAudio(ep.audio_source);
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

    // ── Parse description into key points + bio
    const { keyPoints, bioGuestName, bio } = dlParseDescription(ep.description);
    const kpList = document.getElementById('ep-keypoints-list');
    if (kpList) kpList.innerHTML = keyPoints.length
      ? keyPoints.map(pt => `<li>${pt}</li>`).join('')
      : '<li style="color:var(--muted);font-style:italic">Episode notes coming soon.</li>';

    const bioWrap = document.getElementById('ep-bio-wrap');
    const bioHead = document.getElementById('ep-bio-heading');
    const bioList = document.getElementById('ep-bio-list');
    if (bio.length && bioWrap) {
      if (bioHead) bioHead.textContent = `More About ${bioGuestName || ep.guest_name}`;
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

    // ── Transcript tab
    dlLoadTranscript(ep.transcript_url, ep.title, ep.guest_name);

    // ── Prev / Next
    const navSec   = document.getElementById('ep-nav-section');
    const prevNext = document.getElementById('ep-prev-next');
    if (navSec) navSec.style.display = 'block';
    if (prevNext) {
      const prevCard = prev
        ? `<a href="podcast-episode.html?ep=${prev.episode}" class="ep-nav-card">
             <div class="ep-nav-dir">← Previous Episode</div>
             <div class="ep-nav-ep">Episode #${prev.episode}</div>
             <div class="ep-nav-title">${prev.title}</div>
           </a>`
        : `<div class="ep-nav-card ep-nav-placeholder"><div class="ep-nav-dir">← Previous</div><div class="ep-nav-title">This is the first episode</div></div>`;
      const nextCard = next
        ? `<a href="podcast-episode.html?ep=${next.episode}" class="ep-nav-card ep-nav-right">
             <div class="ep-nav-dir">Next Episode →</div>
             <div class="ep-nav-ep">Episode #${next.episode}</div>
             <div class="ep-nav-title">${next.title}</div>
           </a>`
        : `<div class="ep-nav-card ep-nav-right ep-nav-placeholder"><div class="ep-nav-dir">Next →</div><div class="ep-nav-title">This is the latest episode</div></div>`;
      prevNext.innerHTML = prevCard + nextCard;
    }

  } catch (e) {
    console.warn('DL Sheets: Could not load episode page', e);
    if (heroEl) heroEl.innerHTML = `<div class="ep-not-found"><h2>Could Not Load Episode</h2><p>Please try again or check your connection.</p><a href="podcast.html" class="btn btn-primary" style="margin-top:16px">Browse All Episodes →</a></div>`;
  }
}

// ── TRANSCRIPT: fetch .txt from Drive via Apps Script proxy ──────
async function dlLoadTranscript(transcriptUrl, epTitle, guestName) {
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
    const hostName  = 'Naren Raja';
    const html = dlFormatTranscript(text, guestName, hostName);
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
// Handles format: "Speaker N    HH:MM:SS    text content"
function dlFormatTranscript(text, guestName, hostName) {
  hostName  = (hostName  || 'Host').split(' ')[0];
  guestName = (guestName || 'Guest').split(' ')[0];

  // ── Parse each line ──────────────────────────────────────────────
  // Format: Speaker N    00:00:00    text  (4-space separated)
  const lineRe = /^(Speaker\s+(\d+))\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;

  const lines = text.split(/\r?\n/);
  const entries = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const m = line.match(lineRe);
    if (!m) {
      // Fallback: plain line with no structure
      const t = line.trim();
      if (t && t !== '<silence>') {
        entries.push({ speakerNum: -1, label: '', time: '', text: t });
      }
      continue;
    }

    const speakerNum = parseInt(m[2], 10);
    const time       = m[3];
    const textContent = m[4].trim();

    // Skip silences and empty
    if (!textContent || textContent === '<silence>' || textContent === '<silence>  ') continue;

    // Map speaker numbers to labels
    let label, role;
    if (speakerNum === 0) continue;                // silence / noise
    if (speakerNum === 1) { label = 'Intro'; role = 'intro'; }
    else if (speakerNum === 2) { label = hostName; role = 'host'; }
    else { label = guestName; role = 'guest'; }    // Speaker 3, 4, etc.

    entries.push({ speakerNum, label, role, time, text: textContent });
  }

  if (!entries.length) return '<div class="ep-transcript-para"><div class="ep-transcript-text">Transcript content could not be parsed.</div></div>';

  // ── Build HTML ───────────────────────────────────────────────────
  let html = '';
  let lastRole = null;

  for (const e of entries) {
    const roleClass = e.role === 'host'  ? 'ep-ts-host'
                    : e.role === 'guest' ? 'ep-ts-guest'
                    : 'ep-ts-intro';

    const showSpeaker = (e.role !== lastRole) || e.role === 'intro';
    lastRole = e.role;

    html += `<div class="ep-transcript-para ${roleClass}">
      <div class="ep-ts-meta">
        ${showSpeaker && e.label ? `<span class="ep-transcript-speaker ${roleClass}-badge">${e.label}</span>` : '<span></span>'}
        ${e.time ? `<span class="ep-transcript-time">${e.time}</span>` : ''}
      </div>
      <div class="ep-transcript-text">${e.text}</div>
    </div>`;
  }

  return html;
}

// ── REVIEWS PAGE: Render all reviews ─────────────────────────────
async function dlLoadReviewsGrid() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  try {
    const reviews = await dlFetchSheet('reviews');
    if (!reviews.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No reviews found.</p>'; return; }

    const stars = n => '★'.repeat(Math.min(5, parseInt(n) || 5));
    grid.innerHTML = reviews.map(r => {
      const initials = dlInitials(r.reviewer_name);
      const photoHtml = r.photo_url
        ? `<img src="${r.photo_url}" alt="${r.reviewer_name}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0"
               onerror="this.outerHTML='<div style=\\'width:44px;height:44px;border-radius:50%;background:var(--brown);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;color:#fff;flex-shrink:0\\'>${initials}</div>'">`
        : `<div style="width:44px;height:44px;border-radius:50%;background:var(--brown);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;color:#fff;flex-shrink:0">${initials}</div>`;
      return `
        <article class="review-card">
          <div class="review-header"><div class="stars">${stars(r.rating)}</div><div class="review-platform">${r.platform || 'Dominate Law Podcast'}</div></div>
          <p class="review-text">"${r.review_text}"</p>
          <div class="testimonial-author" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:12px;">
            ${photoHtml}
            <div><div class="review-author">${r.reviewer_name}</div><div class="review-firm">${r.firm_name}</div></div>
          </div>
        </article>`;
    }).join('');
  } catch (e) {
    console.warn('DL Sheets: Could not load reviews', e);
  }
}

// ── EVENTS PAGE: Render all events ───────────────────────────────
async function dlLoadEventsGrid() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  try {
    const events = await dlFetchSheet('events');
    if (!events.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No events found.</p>'; return; }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    grid.innerHTML = events.map(ev => {
      const isPast = new Date(ev.date_iso) < today;
      const btnHtml = isPast
        ? `<span class="btn btn-primary btn-sm mt-16 btn-closed">Registration Closed</span>`
        : `<a href="${ev.register_url || 'contact.html'}" class="btn btn-primary btn-sm mt-16 event-register-btn" style="display:inline-flex;">Register Free →</a>`;
      return `
        <article class="event-card${isPast ? ' past' : ''}" data-event-date="${ev.date_iso}">
          <div class="event-card-header">
            <div class="event-date"><div class="event-date-day">${ev.day}</div><div class="event-date-month">${ev.month_year}</div></div>
            <span class="event-badge event-status-badge" style="${isPast ? 'background:rgba(255,255,255,.1);color:rgba(255,255,255,.4)' : 'background:var(--gold);color:#fff'}">${isPast ? 'Concluded' : 'Upcoming'}</span>
          </div>
          <div class="event-card-body">
            <h3>${ev.title}</h3>
            <p>${ev.description}</p>
            ${btnHtml}
          </div>
        </article>`;
    }).join('');
  } catch (e) {
    console.warn('DL Sheets: Could not load events grid', e);
  }
}

// ── Auto-init based on current page ──────────────────────────────
(function () {
  const path = window.location.pathname;

  // Always update the announcement bar on every page that has .announce
  if (document.querySelector('.announce')) {
    dlLoadLatestPodcast();
  }

  if (path.includes('podcast-episode')) {
    dlLoadEpisodePage();
  } else if (path.includes('podcast')) {
    dlLoadPodcastGrid();
  } else if (path.includes('reviews')) {
    dlLoadReviewsGrid();
  } else if (path.includes('events')) {
    dlLoadEventsGrid();
  } else if (path.endsWith('/') || path.endsWith('index.html') || path.endsWith('index1.html') || path === '') {
    // Home page — also load event popup
    dlLoadNextEvent();
  }
})();
