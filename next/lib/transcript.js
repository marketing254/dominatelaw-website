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

// ── WebVTT support ─────────────────────────────────────────────────
// Newer transcripts (ep 35+) are TurboScribe .vtt subtitle files: numbered
// cues of 3–8 word fragments with millisecond timings and no speaker labels.
// We strip watermarks, honour <v Name> voice tags when present, and stitch
// fragments into readable timestamped paragraphs.
const WATERMARK_RE = /\(Transcribed by TurboScribe\.[^)]*\)\s*/g;

function vttSeconds(ts) {
  const m = String(ts).trim().match(/(?:(\d+):)?(\d+):(\d+)(?:[.,](\d+))?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]);
}

function vttLabelTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function parseVtt(text) {
  const blocks = String(text).replace(/^\uFEFF/, '').split(/\r?\n\r?\n+/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (/^(WEBVTT|NOTE|STYLE|REGION)/.test(lines[0]) && !lines.some(l => l.includes('-->'))) continue;
    const timingIdx = lines.findIndex(l => l.includes('-->'));
    if (timingIdx === -1) continue;
    // NB: trim before taking the first token — '--> ' leaves a leading space
    // which made end-times parse as 0 and broke paragraph stitching.
    const [startRaw, endRaw] = lines[timingIdx].split('-->').map(s => s.trim());
    let cueText = lines.slice(timingIdx + 1).join(' ');
    let speaker = '';
    const vTag = cueText.match(/<v\s+([^>]+)>/);
    if (vTag) speaker = vTag[1].trim();
    cueText = cueText.replace(/<[^>]+>/g, '').replace(WATERMARK_RE, '').trim();
    if (!cueText) continue;
    cues.push({ start: vttSeconds(startRaw), end: vttSeconds((endRaw || '').split(/\s+/)[0]), text: cueText, speaker });
  }
  if (!cues.length) return null;

  // Stitch fragments → paragraphs. New paragraph on: speaker change,
  // a silence gap > 2.5s, or ~sentence end once the paragraph is long enough.
  const paras = [];
  let cur = null;
  for (const c of cues) {
    const gap = cur ? c.start - cur.end : 0;
    const sentenceDone = cur && cur.text.length > 420 && /[.?!]["']?$/.test(cur.text);
    if (!cur || c.speaker !== cur.speaker || gap > 2.5 || sentenceDone || cur.text.length > 900) {
      if (cur) paras.push(cur);
      cur = { start: c.start, end: c.end, text: c.text, speaker: c.speaker };
    } else {
      cur.text += ' ' + c.text;
      cur.end = c.end;
    }
  }
  if (cur) paras.push(cur);

  const entries = paras.map(p => ({
    speakerKey: p.speaker ? `name:${p.speaker.toLowerCase()}` : 'vtt',
    label: p.speaker,
    role: 'guest',
    time: vttLabelTime(p.start),
    text: p.text,
  }));

  const hasSpeakers = entries.some(e => e.label);
  entries.forEach((e, i) => {
    e.colorIdx = 1;
    e.showSpeaker = hasSpeakers && e.label && (i === 0 || entries[i - 1].label !== e.label);
  });

  const wordCount = entries.reduce((n, e) => n + e.text.split(/\s+/).length, 0);
  return { entries, wordCount, readMins: Math.max(1, Math.round(wordCount / 200)) };
}

// Parse raw transcript text → entries with speaker labels, roles, timestamps.
// Supports three formats:
//   A: "Speaker N    00:00:00    text"   (numbered)
//   B: "Full Name    00:00:00    text"   (named)
//   C: WebVTT subtitle files (ep 35+)
// Legacy numbered mapping (pre-ep21): 1=Intro, 2=host, 3+=guest.
// Panels: the speakers column maps Speaker N → real names.
export function parseTranscript(text, { guestName = '', hostName = 'Naren Raja', speakers = [], isNewFormat = false } = {}) {
  if (/^\uFEFF?WEBVTT/.test(String(text).trimStart())) return parseVtt(text);
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
