// ─────────────────────────────────────────────────────────────────
// Server-side Google Sheets data layer (ported from js/sheets.js).
// Fetched at build time / ISR — episodes ship as real HTML, fully
// visible to Google, Bing, and AI crawlers. Revalidates every 5 minutes, so
// new sheet rows appear without a redeploy.
// ─────────────────────────────────────────────────────────────────

const SHEET_ID = '1Kqtgrii6peL3DxEp7PO45zSYd3sSeTN-e1tHmkFdLpg';
const REVALIDATE_SECONDS = 300;

export const SITE = {
  url: 'https://www.dominatelaw.com',
  name: 'Dominate Law',
  podcastName: 'The Law Firm Growth Show',
};

// Manual slug overrides (episode number → slug). Same values the live
// site uses, so every existing URL keeps working after migration.
export const EPISODE_SLUGS = {
  32: 'why-your-law-firm-is-invisible-to-ai',
  31: 'hidden-legal-mistakes-in-domestic-violence-cases',
  30: 'the-ai-enabled-lawyer-what-modern-legal-practice-demands',
  29: 'how-law-firms-can-better-support-domestic-violence-clients',
  28: 'future-proof-law-firm-staying-profitable',
  27: 'the-future-ready-law-firm',
  26: 'rebuilding-a-law-firm-in-the-ai-era',
  25: 'leadership-psychological-safety-and-law-firm-wellbeing',
  24: 'family-law-2026-new-risks-clients-and-growth-opportunities',
  23: 'building-a-law-firm-with-control-clarity-confidence',
};

// ── Generic helpers ────────────────────────────────────────────────
export function slugify(value) {
  return String(value || 'item')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'item';
}

export function epNum(val) {
  return parseInt(String(val == null ? '' : val).replace(/[^\d]/g, ''), 10) || 0;
}

export function driveId(url) {
  if (!url) return '';
  url = String(url).trim();
  let m = url.match(/\/d\/([\w-]{20,})/);
  if (m) return m[1];
  m = url.match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  m = url.match(/googleusercontent\.com\/d\/([\w-]{20,})/);
  if (m) return m[1];
  if (/^[\w-]{20,}$/.test(url)) return url;
  return '';
}

export function driveImg(url, size = 'w800') {
  if (!url) return '';
  url = String(url).trim();
  if (!url.includes('drive.google.com') && !url.includes('google.com') && !url.includes('googleusercontent.com') && !/^[\w-]{20,}$/.test(url)) {
    return url;
  }
  if (url.includes('drive.google.com/thumbnail') && url.includes('sz=')) return url;
  const id = driveId(url);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;
  return url;
}

// GViz date cells come back as "Date(2026,5,8)" — month is 0-based.
export function parseGvizDate(val) {
  if (!val) return null;
  const m = String(val).match(/Date\((\d+),(\d+),(\d+)/);
  if (m) return new Date(+m[1], +m[2], +m[3]);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(val) {
  const d = parseGvizDate(val);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isoDate(val) {
  const d = parseGvizDate(val);
  return d ? d.toISOString().split('T')[0] : '';
}

export function parseSpeakers(str) {
  if (!str) return [];
  return String(str).split('|').map((raw, i) => {
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

// Description parser — supports both formats:
//  • flat "Key Points" bullets + "About X" bio bullets
//  • numbered "Key Discussion Points" topics with sub-bullets + "About the Panel"
export function parseDescription(desc) {
  if (!desc) return { keyPoints: [], keyPointGroups: [], bioGuestName: '', bio: [] };
  const lines = String(desc).split('\n').map(l => l.trim()).filter(Boolean);
  const keyPoints = [];
  const keyPointGroups = [];
  let currentGroup = null;
  const bio = [];
  let bioGuestName = '';
  let section = '';

  for (const line of lines) {
    if (/^key\s+(?:discussion\s+|takeaway?s?\s*$|points?\s*$)/i.test(line) || /^key\s*points?$/i.test(line)) {
      section = 'kp'; currentGroup = null; continue;
    }
    const moreMatch = line.match(/^(?:More\s+about|About|Meet\s+the)\s+(.+)/i);
    if (moreMatch) { section = 'bio'; bioGuestName = moreMatch[1].trim(); currentGroup = null; continue; }

    const topicMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (section === 'kp' && topicMatch && !/^[•*\-–—>]/.test(line)) {
      currentGroup = { topic: topicMatch[2].replace(/\.\s*$/, '').trim(), bullets: [] };
      keyPointGroups.push(currentGroup);
      continue;
    }
    if (/^[•*\-–—>]/.test(line)) {
      const text = line.replace(/^[•*\-–—>]\s*/, '').replace(/\.\s*$/, '').trim();
      if (!text) continue;
      if (section === 'kp') { keyPoints.push(text); if (currentGroup) currentGroup.bullets.push(text); }
      if (section === 'bio') bio.push(text);
    }
  }
  if (keyPoints.length === 0 && keyPointGroups.length === 0) {
    return {
      keyPoints: String(desc).split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 1),
      keyPointGroups: [], bioGuestName: '', bio: [],
    };
  }
  return { keyPoints, keyPointGroups, bioGuestName, bio };
}

// ── Raw GViz fetch (ISR-cached) ────────────────────────────────────
async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${sheetName} (${res.status})`);
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^{]+\(/, '').replace(/\);?\s*$/, ''));
  const cols = json.table.cols.map(c => (c.label || '').trim().toLowerCase().replace(/\s+/g, '_'));
  return json.table.rows.map(row => {
    const obj = {};
    cols.forEach((label, i) => {
      if (!label) return;
      const cell = row.c && row.c[i];
      obj[label] = cell && cell.v != null ? String(cell.v) : '';
    });
    return obj;
  });
}

// ── Podcast episodes ───────────────────────────────────────────────
export function episodeSlug(ep) {
  const n = epNum(ep.episode);
  if (EPISODE_SLUGS[n]) return EPISODE_SLUGS[n];
  if (ep.slug && ep.slug.trim()) return ep.slug.trim();
  return slugify(ep.title);
}

// The team enters panels as multiple names on separate lines in guest_name
// (no dedicated speakers column). Derive a speakers list from those lines so
// panels display correctly ("N Panelists", speaker sidebar) without changing
// how the sheet is filled in. A pipe-separated `speakers` column still wins
// when present.
function deriveSpeakers(r) {
  const fromColumn = parseSpeakers(r.speakers);
  if (fromColumn.length) return fromColumn;
  const names = String(r.guest_name || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (names.length <= 1) return [];
  return names.map((name, i) => ({ speakerNum: i + 1, name, roleLabel: 'Guest', role: 'guest' }));
}

// The team types dates day-first (DD/MM/YYYY) but the sheet's locale is US
// (month-first), so e.g. "10/08/2026" (10 Aug) gets stored as Oct 8. Episodes
// are never future-dated — when a parsed date lands in the future and swapping
// day/month gives a plausible past date, the swap is the intended date.
function fixSwappedDate(d) {
  if (!d) return null;
  const now = new Date();
  if (d.getTime() <= now.getTime() + 86400000) return d; // past/today — trust it
  const day = d.getDate();
  if (day > 12) return d; // day can't be a month — no swap possible
  const swapped = new Date(d.getFullYear(), day - 1, d.getMonth() + 1);
  return swapped.getTime() <= now.getTime() + 86400000 ? swapped : d;
}

export async function getEpisodes() {
  const rows = await fetchSheet('podcasts');
  return rows
    .filter(r => r.title && r.title.trim())
    .map(r => {
      const n = epNum(r.episode);
      const parsed = parseDescription(r.description);
      const d = fixSwappedDate(parseGvizDate(r.date_published));
      return {
        ...r,
        episode: String(n || r.episode),
        number: n,
        slug: episodeSlug({ ...r, episode: n }),
        speakersList: deriveSpeakers(r),
        parsed,
        dateLabel: d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        dateIso: d ? d.toISOString().split('T')[0] : '',
        posterUrl: driveImg(r.poster_image || r.guest_photo_url, 'w1200'),
        photoUrl: driveImg(r.guest_photo_url, 'w800'),
      };
    })
    .sort((a, b) => b.number - a.number);
}

export async function getEpisodeBySlug(slug) {
  const episodes = await getEpisodes();
  return (
    episodes.find(e => e.slug === slug) ||
    // Backward compat: numeric slugs (?ep=21 style URLs redirect here)
    episodes.find(e => String(e.number) === String(slug)) ||
    null
  );
}

// ── Webinar replays ────────────────────────────────────────────────
export function vimeoEmbed(url) {
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

export async function getReplays() {
  const rows = await fetchSheet('webinar-replays');
  return rows
    .map((r, index) => {
      const keynotesRaw = r.keymotes || r.keynotes || r.key_notes || r.takeaways || r.description || '';
      const explicitTitle = (r.title || r.webinar_title || r.replay_title || r.name || '').trim();
      const parsed = parseDescription(keynotesRaw);
      const title = explicitTitle || parsed.keyPoints[0] || `Webinar Replay ${index + 1}`;
      const notes = explicitTitle ? parsed.keyPoints : parsed.keyPoints.slice(1);
      const vimeoLink = (r.vimeo_url || r.vimeo_links || r.vimeo_link || r.vimeo || r.video_link || r.video_url || r.replay_link || r.link || r.url || '').trim();
      const dateRaw = r.date || r.date_iso || r.published_date || r.date_published || '';
      const id = (r.id || r.slug || r.replay_id || '').trim() || slugify(`${title}-${formatDate(dateRaw) || index + 1}`);
      const vimeoIdMatch = vimeoLink.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
      const transcriptUrl = (r.transcript_url || r.transcript || '').trim();
      const rd = fixSwappedDate(parseGvizDate(dateRaw));
      return {
        ...r,
        index,
        id,
        slug: id,
        transcriptUrl,
        title,
        notes,
        noteGroups: parsed.keyPointGroups || [],
        dateLabel: rd ? rd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (dateRaw || ''),
        dateIso: rd ? rd.toISOString().split('T')[0] : '',
        vimeoLink,
        embedUrl: vimeoEmbed(vimeoLink),
        vimeoId: vimeoIdMatch ? vimeoIdMatch[1] : '',
        thumbnailUrl: r.thumbnail_url ? driveImg(r.thumbnail_url, 'w800') : '',
        speakersList: parseSpeakers(r.speakers || r.panelists || r.speaker || r.hosts || ''),
      };
    })
    .filter(r => r.vimeoLink); // only published replays with a video
}

export async function getReplayBySlug(slug) {
  const replays = await getReplays();
  return replays.find(r => r.slug === slug) || null;
}
