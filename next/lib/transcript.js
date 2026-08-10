import { driveId } from './sheets';

// ─────────────────────────────────────────────────────────────────
// Server-side transcript pipeline (ported from legacy dlLoadTranscript /
// dlFormatTranscript). The legacy site fetched transcripts client-side
// through an Apps Script CORS proxy — invisible to crawlers. Here we fetch
// the Drive file directly on the server and ship the transcript as real
// HTML: fully indexable by Google/Bing/AI engines.
// ─────────────────────────────────────────────────────────────────

const TRANSCRIPT_REVALIDATE = 3600; // transcripts rarely change once published

export async function fetchTranscript(transcriptUrl) {
  const id = driveId(transcriptUrl);
  if (!id) return null;
  try {
    const res = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
      next: { revalidate: TRANSCRIPT_REVALIDATE },
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Drive returns an HTML interstitial for non-public/oversized files — reject it
    if (!text || text.trimStart().startsWith('<')) return null;
    return text;
  } catch {
    return null;
  }
}

// Parse raw transcript text → entries with speaker labels, roles, timestamps.
// Supports both formats:
//   A: "Speaker N    00:00:00    text"   (numbered)
//   B: "Full Name    00:00:00    text"   (named)
// Legacy numbered mapping (pre-ep21): 1=Intro, 2=host, 3+=guest.
// Panels: the speakers column maps Speaker N → real names.
export function parseTranscript(text, { guestName = '', hostName = 'Naren Raja', speakers = [], isNewFormat = false } = {}) {
  const hostShort = (hostName || 'Host').split(' ')[0];
  const guestShort = (guestName || 'Guest').split(' ')[0];
  const usePanel = Array.isArray(speakers) && speakers.length > 0;

  const nameToRole = {};
  if (usePanel) speakers.forEach(s => { nameToRole[s.name.toLowerCase()] = s.role; });

  const reNumbered = /^(Speaker\s+(\d+))\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;
  const reNamed = /^([A-Za-z][A-Za-z .'\-]{0,58}[A-Za-z.])\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)\s{2,}(.+)$/;

  const entries = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === '<silence>') continue;

    const mNum = line.match(reNumbered);
    if (mNum) {
      const speakerNum = parseInt(mNum[2], 10);
      const t = mNum[4].trim();
      if (!t || t === '<silence>' || speakerNum === 0) continue;
      let label, role;
      if (usePanel) {
        const sp = speakers.find(s => s.speakerNum === speakerNum);
        if (sp) { label = sp.name; role = sp.role; }
        else { label = `Speaker ${speakerNum}`; role = 'guest'; }
      } else if (isNewFormat) {
        label = `Speaker ${speakerNum}`; role = 'guest';
      } else {
        if (speakerNum === 1) { label = 'Intro'; role = 'intro'; }
        else if (speakerNum === 2) { label = hostShort; role = 'host'; }
        else { label = guestShort; role = 'guest'; }
      }
      entries.push({ speakerKey: `n${speakerNum}`, label, role, time: mNum[3], text: t });
      continue;
    }

    const mName = line.match(reNamed);
    if (mName) {
      const nameRaw = mName[1].trim();
      const t = mName[3].trim();
      if (!t || t === '<silence>') continue;
      const role = nameToRole[nameRaw.toLowerCase()] || (/intro/i.test(nameRaw) ? 'intro' : 'guest');
      entries.push({ speakerKey: `name:${nameRaw.toLowerCase()}`, label: nameRaw, role, time: mName[2], text: t });
      continue;
    }

    entries.push({ speakerKey: 'plain', label: '', role: 'intro', time: '', text: line });
  }

  if (!entries.length) return null;

  // Stable per-speaker color index (1-6, cycles) by first appearance
  const keyToIdx = new Map();
  let nextIdx = 1;
  entries.forEach(e => {
    if (!keyToIdx.has(e.speakerKey)) keyToIdx.set(e.speakerKey, nextIdx++);
    e.colorIdx = ((keyToIdx.get(e.speakerKey) - 1) % 6) + 1;
  });

  // Hide repeated speaker labels on consecutive entries by the same voice
  let lastSig = null;
  const tinting = usePanel || isNewFormat || keyToIdx.size > 2;
  entries.forEach(e => {
    const sig = tinting ? `${e.role}#${e.speakerKey}` : e.role;
    e.showSpeaker = sig !== lastSig || e.role === 'intro';
    lastSig = sig;
  });

  const wordCount = String(text).split(/\s+/).length;
  return { entries, wordCount, readMins: Math.max(1, Math.round(wordCount / 200)) };
}
