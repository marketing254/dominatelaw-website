'use client';
import { useEffect, useRef, useState } from 'react';

// Premium podcast player: dark brand card, SoundCloud-style waveform
// (smooth deterministic envelope — no random noise, no hydration mismatch),
// gentle pulse animation localized around the playhead while playing.
const BAR_COUNT = 90;
// DJ-style clustered waveform: bursts of tall bars separated by runs of tiny
// "dot" bars, mirrored around the center line. Deterministic (no Math.random)
// so server HTML matches hydration.
const rawHeight = i => {
  const burst   = Math.pow(Math.abs(Math.sin(i * 0.16 + 0.9)), 2.2);          // cluster envelope
  const detail  = Math.abs(Math.sin(i * 0.55) * 0.55 + Math.sin(i * 0.31 + 1.7) * 0.45);
  const accent  = Math.pow(Math.abs(Math.sin(i * 0.045 + 2.2)), 1.4);         // long phrase swell
  return burst * detail * (0.55 + accent * 0.45);
};
const barHeight = i => {
  // Neighbour smoothing = gently curved silhouette instead of jagged spikes
  const v = (rawHeight(i - 1) + rawHeight(i) * 2 + rawHeight(i + 1)) / 4;
  return Math.round(7 + Math.min(1, v) * 88); // 7% (dots) – 95% (spikes)
};

function fmt(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

const SPEEDS = [1, 1.25, 1.5, 2];

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const trackRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const skip = d => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.min(Math.max(0, a.currentTime + d), duration || a.currentTime + d);
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const seek = e => {
    const a = audioRef.current;
    const t = trackRef.current;
    if (!a || !t || !duration) return;
    const rect = t.getBoundingClientRect();
    const ratio = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
    a.currentTime = ratio * duration;
    setCurrent(a.currentTime);
  };

  const progress = duration ? current / duration : 0;
  const activeIdx = Math.floor(progress * BAR_COUNT);

  const skipBtn = {
    width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'background .2s, color .2s',
  };

  return (
    <div style={{
      background: '#3A0D00',
      border: '1px solid rgba(232,196,74,.18)',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 16px 44px rgba(58,13,0,.22)',
    }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Back 15s */}
        <button type="button" style={skipBtn} onClick={() => skip(-15)} aria-label="Back 15 seconds" title="Back 15s"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.16)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /></svg>
        </button>

        {/* Play / pause — white circle, Spotify-style on dark */}
        <button
          type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}
          style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0, border: 'none',
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0,0,0,.35)',
            transition: 'transform .18s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {playing ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#3A0D00"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#3A0D00" style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* Forward 15s */}
        <button type="button" style={skipBtn} onClick={() => skip(15)} aria-label="Forward 15 seconds" title="Forward 15s"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.16)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" /><path d="M21 3v5h-5" /></svg>
        </button>

        {/* Waveform */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            ref={trackRef} onClick={seek} role="slider" aria-label="Seek"
            aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(current)}
            className="dl-wave"
            style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 56, cursor: 'pointer' }}
          >
            {Array.from({ length: BAR_COUNT }, (_, i) => {
              const started = playing || current > 0;
              const played = started && i <= activeIdx;
              const isHead = started && i === activeIdx;
              const dist = Math.abs(i - activeIdx);
              const nearHead = playing && dist <= 4 && !isHead;
              // Entrance ripple plays once on mount; playhead animations take
              // over after playback starts (never replays the entrance).
              const anim = !started
                ? `dlRise .5s cubic-bezier(.34,1.4,.64,1) ${i * 9}ms both`
                : isHead && playing
                  ? 'dlHead 1s ease-in-out infinite'
                  : nearHead
                    ? `dlPulse 1.5s ease-in-out ${dist * 0.13}s infinite`
                    : 'none';
              return (
                <span
                  key={i}
                  className="dl-wave-bar"
                  style={{
                    flex: 1, minWidth: 1.5, maxWidth: 3.5, borderRadius: 100,
                    height: `${barHeight(i)}%`,
                    background: isHead
                      ? '#FFF3C4'
                      : played
                        ? 'linear-gradient(180deg, #F3D66B, #C49A0A)'
                        : 'rgba(255,255,255,.20)',
                    boxShadow: isHead
                      ? '0 0 10px rgba(232,196,74,.9), 0 0 22px rgba(232,196,74,.45)'
                      : played
                        ? '0 0 6px rgba(232,196,74,.18)'
                        : 'none',
                    transition: 'background .3s ease, box-shadow .3s ease',
                    transformOrigin: 'center',
                    animation: anim,
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
            <span style={{ fontSize: '.73rem', fontWeight: 700, color: '#E8C44A', fontVariantNumeric: 'tabular-nums' }}>{fmt(current)}</span>
            <span style={{ fontSize: '.73rem', fontWeight: 600, color: 'rgba(255,255,255,.6)', fontVariantNumeric: 'tabular-nums' }}>{fmt(duration)}</span>
          </div>
        </div>

        {/* Speed */}
        <button
          type="button" onClick={cycleSpeed} aria-label="Playback speed" title="Playback speed"
          style={{
            minWidth: 46, padding: '7px 11px', borderRadius: 100, flexShrink: 0,
            border: '1px solid rgba(255,255,255,.25)', background: 'transparent', cursor: 'pointer',
            fontSize: '.72rem', fontWeight: 700, color: 'rgba(255,255,255,.85)',
            transition: 'border-color .2s, background .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.borderColor = 'rgba(232,196,74,.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.25)'; }}
        >
          {SPEEDS[speedIdx]}×
        </button>
      </div>

      <style>{`
        @keyframes dlPulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes dlHead {
          0%, 100% { transform: scaleY(1.05); }
          50% { transform: scaleY(1.45); }
        }
        @keyframes dlRise {
          from { transform: scaleY(.1); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        .dl-wave:hover .dl-wave-bar { filter: brightness(1.15); }
        @media (prefers-reduced-motion: reduce) { .dl-wave-bar { animation: none !important; } }
      `}</style>
    </div>
  );
}
